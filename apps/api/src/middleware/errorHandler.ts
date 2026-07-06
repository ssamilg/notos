import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../lib/apiResponse.js';
import { DomainError, SupabaseOperationError } from '../lib/supabase/errors.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (err instanceof ZodError) {
    const message = err.issues[0]?.message ?? 'Invalid request';
    return sendError(res, message, 422);
  }

  if (err instanceof DomainError) {
    return sendError(res, err.message, err.statusCode);
  }

  if (err instanceof SupabaseOperationError) {
    return sendError(res, err.message, 500);
  }

  if (err instanceof Error) {
    return sendError(res, err.message, 500);
  }

  return sendError(res, 'Internal server error', 500);
}
