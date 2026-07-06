import type { Response } from 'express';
import { createRequestId, type ApiEnvelope } from '@notos/shared';

export function sendSuccess<T>(
  res: Response,
  data: T,
  status = 200,
  meta: Record<string, unknown> | null = null
): Response {
  const body: ApiEnvelope<T> = {
    data,
    error: null,
    meta,
    request_id: createRequestId(),
  };

  return res.status(status).json(body);
}

export function sendError(
  res: Response,
  message: string,
  status: number,
  meta: Record<string, unknown> | null = null
): Response {
  const body: ApiEnvelope<null> = {
    data: null,
    error: message,
    meta,
    request_id: createRequestId(),
  };

  return res.status(status).json(body);
}
