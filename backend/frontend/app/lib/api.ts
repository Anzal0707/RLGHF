/**
 * Centralized API client for the RLG Complaint System frontend.
 *
 * API base URL resolution:
 * - Production: NEXT_PUBLIC_API_URL (required in deployed environments)
 * - Development: NEXT_PUBLIC_API_URL if set, else LAN hostname:8000 on local networks,
 *   else http://127.0.0.1:8000/api
 */

const DEV_API_FALLBACK = 'http://127.0.0.1:8000/api';
const PRODUCTION_API_FALLBACK = '/api';

const LOCAL_BROWSER_HOST = /^(localhost|127\.0\.0\.1)$/;
const LAN_BROWSER_HOST =
  /^(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})$/;

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, '');
}

export function resolveApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) {
    return normalizeBaseUrl(fromEnv || PRODUCTION_API_FALLBACK);
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;

    // Desktop dev on localhost — always use local Django (ignore stale LAN IP in .env.local)
    if (LOCAL_BROWSER_HOST.test(hostname)) {
      return DEV_API_FALLBACK;
    }

    // Phone/tablet on Wi-Fi — API on same host as the Next.js page
    if (LAN_BROWSER_HOST.test(hostname)) {
      return `http://${hostname}:8000/api`;
    }
  }

  if (fromEnv) {
    return normalizeBaseUrl(fromEnv);
  }

  return DEV_API_FALLBACK;
}

export interface ApiErrorDetail {
  message: string;
  field?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  statusText: string;
  details?: unknown;

  constructor(status: number, statusText: string, message: string, details?: unknown) {
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
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
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
      if (!res.ok) return null;
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

async function ensureValidAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  if (token && !isAccessTokenExpired(token)) return token;
  return refreshAccessToken();
}

function buildResourceUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean>,
): string {
  let url = `${resolveApiBaseUrl()}/${endpoint.replace(/^\//, '')}`;
  if (!url.endsWith('/') && !url.includes('?') && !endpoint.includes('.')) {
    url += '/';
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

  const config: RequestInit = { ...restOptions, headers };

  try {
    const response = await fetch(url, config);

    if (response.status === 204) {
      return {} as T;
    }

    let responseData: unknown;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
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
      let details: unknown = null;

      if (typeof responseData === 'object' && responseData !== null) {
        details = responseData;
        const record = responseData as Record<string, unknown>;
        if (typeof record.detail === 'string') {
          errorMessage = record.detail;
        } else if (typeof record.message === 'string') {
          errorMessage = record.message;
        } else {
          const firstKey = Object.keys(record)[0];
          if (firstKey) {
            const val = record[firstKey];
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
    if (error instanceof ApiError) throw error;
    const base = resolveApiBaseUrl();
    const hint =
      error instanceof Error && error.message === 'Failed to fetch'
        ? `Cannot reach the API at ${base}. Ensure the Django server is running (python manage.py runserver).`
        : error instanceof Error
          ? error.message
          : 'Network request failed';
    throw new ApiError(0, 'Network Error', hint);
  }
}

export const apiClient = {
  ensureValidAccessToken,
  resolveBaseUrl: resolveApiBaseUrl,

  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
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
