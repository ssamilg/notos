import {
  deleteTagForUser,
  updateTagForUser,
} from '@/services/tags';
import { apiError, apiSuccess } from '@/utils/api/response';
import { tagIdParamSchema, updateTagSchema } from '@/utils/api/schemas';
import { requireUser } from '@/utils/api/requireUser';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { supabase, user, error } = await requireUser();

  if (error || !user) {
    return apiError('Unauthorized', 401);
  }

  const { id } = await context.params;
  const idParsed = tagIdParamSchema.safeParse({ id });

  if (!idParsed.success) {
    return apiError(idParsed.error.issues[0]?.message ?? 'Invalid tag id', 422);
  }

  const body: unknown = await request.json();
  const parsed = updateTagSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'Invalid request', 422);
  }

  try {
    const tag = await updateTagForUser(supabase, idParsed.data.id, parsed.data.name);
    return apiSuccess(tag);
  } catch (serviceError) {
    const message = serviceError instanceof Error ? serviceError.message : 'Failed to update tag';
    const status = message.includes('duplicate') || message.includes('unique') ? 422 : 500;
    return apiError(message, status);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { supabase, user, error } = await requireUser();

  if (error || !user) {
    return apiError('Unauthorized', 401);
  }

  const { id } = await context.params;
  const parsed = tagIdParamSchema.safeParse({ id });

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'Invalid tag id', 422);
  }

  try {
    const tag = await deleteTagForUser(supabase, parsed.data.id);

    if (!tag) {
      return apiError('Tag not found', 404);
    }

    return apiSuccess(tag);
  } catch (serviceError) {
    const message = serviceError instanceof Error ? serviceError.message : 'Failed to delete tag';
    return apiError(message, 500);
  }
}
