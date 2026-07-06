import type { NextFunction, Request, Response } from 'express';
import { createRequestId } from '@notos/shared';
import { createUserSupabaseClient } from '../lib/supabase.js';
import { sendError } from '../lib/apiResponse.js';
import { initializeUser } from '../services/userInit.js';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  req.requestId = createRequestId();

  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (token.length === 0) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  const supabase = createUserSupabaseClient(token);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  req.user = data.user;
  req.supabase = supabase;

  try {
    await initializeUser(supabase, data.user.id);
  } catch {
    sendError(res, 'Failed to initialize user', 500);
    return;
  }

  next();
}
