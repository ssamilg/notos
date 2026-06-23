import { NextResponse } from 'next/server';

export type ApiEnvelope<T> = {
  data: T | null;
  error: string | null;
  meta: Record<string, unknown> | null;
  request_id: string;
};

export function createRequestId() {
  return crypto.randomUUID();
}

export function apiSuccess<T>(
  data: T,
  init?: ResponseInit,
  meta: Record<string, unknown> | null = null
) {
  const body: ApiEnvelope<T> = {
    data,
    error: null,
    meta,
    request_id: createRequestId(),
  };

  return NextResponse.json(body, init);
}

export function apiError(
  message: string,
  status: number,
  meta: Record<string, unknown> | null = null
) {
  const body: ApiEnvelope<null> = {
    data: null,
    error: message,
    meta,
    request_id: createRequestId(),
  };

  return NextResponse.json(body, { status });
}
