const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

if (!API_URL) {
  throw new Error('VITE_API_URL is not set. Add it to .env (see .env.example) or to your hosting environment.');
}

export interface FieldError {
  path: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  errors: FieldError[];

  constructor(status: number, message: string, errors: FieldError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  /** Field errors as { field: message } for forms. */
  fieldErrors(): Record<string, string> {
    return Object.fromEntries(this.errors.map((e) => [e.path.split('.')[0], e.message]));
  }
}

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

/** AuthContext registers this so any 401 clears the session and sends the user to /login. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

/** Endpoints where a 401 is an expected answer, not an expired session. */
const SILENT_401 = ['/auth/me', '/auth/login', '/auth/register'];

type Query = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Query;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: Query) {
  const url = new URL(`${API_URL}/api${path}`);
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });
  return url.toString();
}

export async function request<T>(path: string, { method = 'GET', body, query, signal }: RequestOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }

  if (res.status === 204) return undefined as T;

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const payload = (data ?? {}) as { message?: string; errors?: FieldError[] };
    if (res.status === 401 && !SILENT_401.includes(path)) onUnauthorized?.();
    const fallback = res.status === 429 ? 'Too many attempts. Please wait and try again.' : `Request failed (${res.status})`;
    throw new ApiError(res.status, payload.message || fallback, payload.errors ?? []);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, query?: Query, signal?: AbortSignal) => request<T>(path, { query, signal }),
  post: <T>(path: string, body?: unknown, query?: Query) => request<T>(path, { method: 'POST', body, query }),
  patch: <T>(path: string, body?: unknown, query?: Query) => request<T>(path, { method: 'PATCH', body, query }),
  del: (path: string) => request<void>(path, { method: 'DELETE' }),
};

export const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : 'Something went wrong. Please try again.';
