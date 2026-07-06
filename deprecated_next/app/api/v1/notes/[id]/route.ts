import {
  deleteNoteForUser,
  getNote,
  updateNoteForUser,
} from '@/services/notes';
import { apiError, apiSuccess } from '@/utils/api/response';
import { updateNoteSchema } from '@/utils/api/schemas';
import { requireUser } from '@/utils/api/requireUser';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { supabase, user, error } = await requireUser();

  if (error || !user) {
    return apiError('Unauthorized', 401);
  }

  const { id } = await context.params;

  try {
    const note = await getNote(supabase, id);

    if (!note) {
      return apiError('Note not found', 404);
    }

    return apiSuccess(note);
  } catch (serviceError) {
    const message = serviceError instanceof Error ? serviceError.message : 'Failed to fetch note';
    return apiError(message, 500);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { supabase, user, error } = await requireUser();

  if (error || !user) {
    return apiError('Unauthorized', 401);
  }

  const { id } = await context.params;
  const body: unknown = await request.json();
  const parsed = updateNoteSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'Invalid request', 422);
  }

  if (parsed.data.deleted_at !== undefined) {
    try {
      const note = await deleteNoteForUser(supabase, id);
      return apiSuccess(note);
    } catch (serviceError) {
      const message = serviceError instanceof Error ? serviceError.message : 'Failed to delete note';
      return apiError(message, 500);
    }
  }

  try {
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

    const note = await updateNoteForUser(supabase, id, user.id, payload);
    return apiSuccess(note);
  } catch (serviceError) {
    const message = serviceError instanceof Error ? serviceError.message : 'Failed to update note';
    return apiError(message, 500);
  }
}
