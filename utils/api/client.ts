import type { ApiEnvelope } from '@/utils/api/response';

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

async function parseEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  return (await response.json()) as ApiEnvelope<T>;
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
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
  const response = await fetch(url, init);
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
