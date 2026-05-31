const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers: customHeaders, ...restOptions } = options;

  // Build URL with query parameters
  let url = `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  if (url.endsWith('/') === false && !url.includes('?')) {
    // Django REST Framework likes trailing slashes unless configured otherwise
    // Let's ensure we append a trailing slash to resources to avoid redirects, but don't add to query params
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
      // If trailing slash was added, make sure query params are appended after it
      url += `?${queryString}`;
    }
  }

  // Set default headers
  const headers = new Headers(customHeaders);
  if (!headers.has('Content-Type') && !(restOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  // Auto-inject JWT token if it exists in localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const config: RequestInit = {
    ...restOptions,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle No Content response
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
      // Parse django REST framework error structure
      let errorMessage = 'An error occurred during the API request.';
      let details: any = null;

      if (typeof responseData === 'object' && responseData !== null) {
        details = responseData;
        if (responseData.detail) {
          errorMessage = responseData.detail;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else {
          // If it's a validation error with field names
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
    // Network or other fetch errors
    throw new ApiError(500, 'Network Error', error instanceof Error ? error.message : 'Network request failed');
  }
}

export const apiClient = {
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
