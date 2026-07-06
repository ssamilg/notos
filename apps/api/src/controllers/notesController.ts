import type { NextFunction, Request, Response } from 'express';
import {
  createNoteSchema,
  notesQuerySchema,
  updateNoteSchema,
} from '@notos/shared';
import {
  createNoteForUser,
  deleteNoteForUser,
  getNote,
  listNotes,
  updateNoteForUser,
} from '../services/notes.js';
import { sendError, sendSuccess } from '../lib/apiResponse.js';
import { getQueryParam, getRouteParam } from '../lib/requestParams.js';
import { isUniqueViolationCode, SupabaseOperationError } from '../lib/supabase/errors.js';

export async function getNotesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.supabase) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const parsed = notesQuerySchema.safeParse({
      projectId: req.query.projectId ?? '',
      cursor: req.query.cursor ?? undefined,
      search: req.query.search ?? undefined,
      tag_id: req.query.tag_id ?? undefined,
      limit: req.query.limit ?? undefined,
    });

    if (!parsed.success) {
      sendError(res, parsed.error.issues[0]?.message ?? 'Invalid query parameters', 422);
      return;
    }

    const result = await listNotes(req.supabase, {
      projectId: parsed.data.projectId,
      ...(parsed.data.cursor !== undefined ? { cursor: parsed.data.cursor } : {}),
      ...(parsed.data.search !== undefined ? { search: parsed.data.search } : {}),
      ...(parsed.data.tag_id !== undefined ? { tagId: parsed.data.tag_id } : {}),
      limit: parsed.data.limit,
    });
    sendSuccess(res, result.notes, 200, { nextCursor: result.nextCursor });
  } catch (error) {
    next(error);
  }
}

export async function createNoteHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.supabase || !req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const parsed = createNoteSchema.safeParse(req.body);

    if (!parsed.success) {
      sendError(res, parsed.error.issues[0]?.message ?? 'Invalid request', 422);
      return;
    }

    const note = await createNoteForUser(
      req.supabase,
      req.user.id,
      parsed.data.id,
      parsed.data.projectId,
      parsed.data.title,
      parsed.data.text,
      parsed.data.tags,
      parsed.data.is_completed
    );
    sendSuccess(res, note, 201);
  } catch (error) {
    if (error instanceof SupabaseOperationError && isUniqueViolationCode(error.code)) {
      sendError(res, 'Resource already exists', 409);
      return;
    }

    next(error);
  }
}

export async function getNoteHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.supabase) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const noteId = getRouteParam(req.params.id);

    if (!noteId) {
      sendError(res, 'Note id is required', 422);
      return;
    }

    const note = await getNote(req.supabase, noteId);

    if (!note) {
      sendError(res, 'Note not found', 404);
      return;
    }

    sendSuccess(res, note);
  } catch (error) {
    next(error);
  }
}

export async function updateNoteHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.supabase || !req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const noteId = getRouteParam(req.params.id);

    if (!noteId) {
      sendError(res, 'Note id is required', 422);
      return;
    }

    const parsed = updateNoteSchema.safeParse(req.body);

    if (!parsed.success) {
      sendError(res, parsed.error.issues[0]?.message ?? 'Invalid request', 422);
      return;
    }

    if (parsed.data.deleted_at !== undefined) {
      const note = await deleteNoteForUser(req.supabase, noteId);
      sendSuccess(res, note);
      return;
    }

    const payload: {
      title?: string;
      text?: string;
      tags?: string[];
      is_completed?: boolean;
    } = {};

    if (parsed.data.title !== undefined) {
      payload.title = parsed.data.title;
    }

    if (parsed.data.text !== undefined) {
      payload.text = parsed.data.text;
    }

    if (parsed.data.tags !== undefined) {
      payload.tags = parsed.data.tags;
    }

    if (parsed.data.is_completed !== undefined) {
      payload.is_completed = parsed.data.is_completed;
    }

    const note = await updateNoteForUser(req.supabase, noteId, req.user.id, payload);
    sendSuccess(res, note);
  } catch (error) {
    next(error);
  }
}
