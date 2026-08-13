const API_BASE = '/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const fullPath = `${API_BASE}${path}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    };

    if (this.token) {
      requestHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(fullPath, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  get<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: 'GET', headers });
  }

  post<T>(path: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: 'POST', body, headers });
  }

  put<T>(path: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body, headers });
  }

  delete<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
