import type { ApiEnvelope } from '@notos/shared';
import { getAccessToken } from './supabase';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

function resolveUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${apiBaseUrl}${path}`;
}

async function buildHeaders(init?: RequestInit): Promise<Headers> {
  const headers = new Headers(init?.headers);
  const token = await getAccessToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  return headers;
}

async function parseEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  return (await response.json()) as ApiEnvelope<T>;
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(resolveUrl(url), {
    ...init,
    headers: await buildHeaders(init),
  });
  const envelope = await parseEnvelope<T>(response);

  if (!response.ok || envelope.error) {
    throw new ApiRequestError(envelope.error ?? 'Request failed', response.status);
  }

  if (envelope.data === null) {
    throw new ApiRequestError('Empty response', response.status);
  }

  return envelope.data;
}

export async function apiFetchWithMeta<T>(
  url: string,
  init?: RequestInit
): Promise<{ data: T; meta: Record<string, unknown> | null }> {
  const response = await fetch(resolveUrl(url), {
    ...init,
    headers: await buildHeaders(init),
  });
  const envelope = await parseEnvelope<T>(response);

  if (!response.ok || envelope.error) {
    throw new ApiRequestError(envelope.error ?? 'Request failed', response.status);
  }

  if (envelope.data === null) {
    throw new ApiRequestError('Empty response', response.status);
  }

  return {
    data: envelope.data,
    meta: envelope.meta,
  };
}
