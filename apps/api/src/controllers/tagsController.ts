import type { NextFunction, Request, Response } from 'express';
import {
  createTagSchema,
  tagIdParamSchema,
  updateTagSchema,
} from '@notos/shared';
import {
  createTagForUser,
  deleteTagForUser,
  listTagsForUser,
  updateTagForUser,
} from '../services/tags.js';
import { getRouteParam } from '../lib/requestParams.js';
import { sendError, sendSuccess } from '../lib/apiResponse.js';

export async function getTagsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.supabase || !req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const tags = await listTagsForUser(req.supabase, req.user.id);
    sendSuccess(res, tags);
  } catch (error) {
    next(error);
  }
}

export async function createTagHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.supabase || !req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const parsed = createTagSchema.safeParse(req.body);

    if (!parsed.success) {
      sendError(res, parsed.error.issues[0]?.message ?? 'Invalid request', 422);
      return;
    }

    const tag = await createTagForUser(req.supabase, req.user.id, parsed.data.name);
    sendSuccess(res, tag, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create tag';
    const status = message.includes('duplicate') || message.includes('unique') ? 422 : 500;

    if (status === 422) {
      sendError(res, message, status);
      return;
    }

    next(error);
  }
}

export async function updateTagHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.supabase) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const idParsed = tagIdParamSchema.safeParse({ id: getRouteParam(req.params.id) });

    if (!idParsed.success) {
      sendError(res, idParsed.error.issues[0]?.message ?? 'Invalid tag id', 422);
      return;
    }

    const parsed = updateTagSchema.safeParse(req.body);

    if (!parsed.success) {
      sendError(res, parsed.error.issues[0]?.message ?? 'Invalid request', 422);
      return;
    }

    const tag = await updateTagForUser(req.supabase, idParsed.data.id, parsed.data.name);
    sendSuccess(res, tag);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update tag';
    const status = message.includes('duplicate') || message.includes('unique') ? 422 : 500;

    if (status === 422) {
      sendError(res, message, status);
      return;
    }

    next(error);
  }
}

export async function deleteTagHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.supabase) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const parsed = tagIdParamSchema.safeParse({ id: getRouteParam(req.params.id) });

    if (!parsed.success) {
      sendError(res, parsed.error.issues[0]?.message ?? 'Invalid tag id', 422);
      return;
    }

    const tag = await deleteTagForUser(req.supabase, parsed.data.id);

    if (!tag) {
      sendError(res, 'Tag not found', 404);
      return;
    }

    sendSuccess(res, tag);
  } catch (error) {
    next(error);
  }
}
