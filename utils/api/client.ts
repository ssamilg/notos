import type { ApiEnvelope } from '@/utils/api/response';

export async function apiFetch<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const envelope = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || envelope.error) {
    throw new Error(envelope.error ?? 'Request failed');
  }

  if (envelope.data === null) {
    throw new Error('Empty response');
  }

  return envelope.data;
}
