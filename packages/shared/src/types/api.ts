export type ApiEnvelope<T> = {
  data: T | null;
  error: string | null;
  meta: Record<string, unknown> | null;
  request_id: string;
};

export function createRequestId(): string {
  return crypto.randomUUID();
}
