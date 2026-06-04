function resolveBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  if (typeof window === 'undefined') return configured;

  const hostname = window.location.hostname;
  const usePageHost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);

  if (usePageHost) {
    return `http://${hostname}:8000/api`;
  }
  return configured;
}

export interface ApiErrorDetail {
  message: string;
  field?: string;
  [key: string]: any;
}

export class ApiError extends Error {
  status: number;
  statusText: string;
  details?: any;

  constructor(status: number, statusText: string, message: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  _retried?: boolean;
}

let refreshInFlight: Promise<string | null> | null = null;

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as { exp?: number };
  } catch {
    return null;
  }
}

function isAccessTokenExpired(token: string, skewSec = 30): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now() + skewSec * 1000;
}

async function ensureValidAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  if (token && !isAccessTokenExpired(token)) return token;
  return refreshAccessToken();
}

function buildResourceUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
  let url = `${resolveBaseUrl().replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  if (url.endsWith('/') === false && !url.includes('?')) {
    if (!endpoint.includes('.')) {
      url += '/';
    }
  }
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  return url;
}

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return null;

  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(buildResourceUrl('auth/token/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      if (data.access) {
        localStorage.setItem('access_token', data.access);
        return data.access as string;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers: customHeaders, _retried, ...restOptions } = options;
  const url = buildResourceUrl(endpoint, params);

  const isAuthEndpoint =
    endpoint.includes('auth/admin/login') || endpoint.includes('auth/token/refresh');

  const headers = new Headers(customHeaders);
  if (!headers.has('Content-Type') && !(restOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (typeof window !== 'undefined' && !isAuthEndpoint) {
    const token = _retried
      ? localStorage.getItem('access_token') || localStorage.getItem('token')
      : await ensureValidAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      headers.delete('Authorization');
    }
  }

  const config: RequestInit = {
    ...restOptions,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 204) {
      return {} as T;
    }

    let responseData: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      if (
        response.status === 401 &&
        !_retried &&
        !isAuthEndpoint &&
        typeof window !== 'undefined'
      ) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const { headers: _omit, ...retryOptions } = options;
          return request<T>(endpoint, { ...retryOptions, _retried: true });
        }
      }

      let errorMessage = 'An error occurred during the API request.';
      let details: any = null;

      if (typeof responseData === 'object' && responseData !== null) {
        details = responseData;
        if (responseData.detail) {
          errorMessage = responseData.detail;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else {
          const firstKey = Object.keys(responseData)[0];
          if (firstKey) {
            const val = responseData[firstKey];
            const msg = Array.isArray(val) ? val[0] : val;
            errorMessage = `${firstKey}: ${msg}`;
          }
        }
      } else if (typeof responseData === 'string' && responseData) {
        errorMessage = responseData;
      }

      throw new ApiError(response.status, response.statusText, errorMessage, details);
    }

    return responseData as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network Error', error instanceof Error ? error.message : 'Network request failed');
  }
}

export const apiClient = {
  ensureValidAccessToken,

  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  put<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  patch<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
