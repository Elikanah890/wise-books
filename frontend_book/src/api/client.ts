import { API_URL, ADMIN_TOKEN_KEY } from '../utils/constants';

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function getAdminToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string | null): void {
  if (token) {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

export const UNAUTHORIZED_EVENT = 'admin-unauthorized';

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  isFormData?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, isFormData = false } = options;
  const headers: Record<string, string> = {};

  if (auth) {
    const token = getAdminToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let payload: BodyInit | undefined;
  if (body !== undefined) {
    if (isFormData) {
      payload = body as FormData;
    } else {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, { method, headers, body: payload });
  const text = await response.text();
  const json = text ? (JSON.parse(text) as Record<string, unknown>) : {};

  if (!response.ok || json.success === false) {
    const error = (json.error as { code?: string; message?: string; details?: unknown }) || {};
    if (response.status === 401 && auth) {
      setAdminToken(null);
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(
      error.code ?? 'REQUEST_FAILED',
      error.message ?? `Request failed (${response.status})`,
      response.status,
      error.details
    );
  }

  return json.data as T;
}

export const api = {
  get: <T>(endpoint: string, auth = false) => request<T>(endpoint, { auth }),
  post: <T>(endpoint: string, body?: unknown, auth = false) =>
    request<T>(endpoint, { method: 'POST', body, auth }),
  patch: <T>(endpoint: string, body?: unknown, auth = false) =>
    request<T>(endpoint, { method: 'PATCH', body, auth }),
  put: <T>(endpoint: string, body?: unknown, auth = false) =>
    request<T>(endpoint, { method: 'PUT', body, auth }),
  delete: <T>(endpoint: string, auth = false) =>
    request<T>(endpoint, { method: 'DELETE', auth }),
  upload: <T>(endpoint: string, formData: FormData, method = 'POST') =>
    request<T>(endpoint, { method, body: formData, auth: true, isFormData: true }),
};
