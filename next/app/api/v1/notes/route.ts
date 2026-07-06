import {
  createNoteForUser,
  listNotes,
} from '@/services/notes';
import { apiError, apiSuccess } from '@/utils/api/response';
import { createNoteSchema, notesQuerySchema } from '@/utils/api/schemas';
import { requireUser } from '@/utils/api/requireUser';
import { isUniqueViolationCode, SupabaseOperationError } from '@/utils/supabase/errors';

export async function GET(request: Request) {
  const { supabase, user, error } = await requireUser();

  if (error || !user) {
    return apiError('Unauthorized', 401);
  }

  const { searchParams } = new URL(request.url);
  const parsed = notesQuerySchema.safeParse({
    projectId: searchParams.get('projectId') ?? '',
    cursor: searchParams.get('cursor') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    tag_id: searchParams.get('tag_id') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  });

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'Invalid query parameters', 422);
  }

  try {
    const result = await listNotes(supabase, {
      projectId: parsed.data.projectId,
      cursor: parsed.data.cursor,
      search: parsed.data.search,
      tagId: parsed.data.tag_id,
      limit: parsed.data.limit,
    });
    return apiSuccess(result.notes, undefined, { nextCursor: result.nextCursor });
  } catch (serviceError) {
    const message = serviceError instanceof Error ? serviceError.message : 'Failed to fetch notes';
    return apiError(message, 500);
  }
}

export async function POST(request: Request) {
  const { supabase, user, error } = await requireUser();

  if (error || !user) {
    return apiError('Unauthorized', 401);
  }

  const body: unknown = await request.json();
  const parsed = createNoteSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'Invalid request', 422);
  }

  try {
    const note = await createNoteForUser(
      supabase,
      user.id,
      parsed.data.id,
      parsed.data.projectId,
      parsed.data.title,
      parsed.data.text,
      parsed.data.tags,
      parsed.data.is_completed
    );
    return apiSuccess(note, { status: 201 });
  } catch (serviceError) {
    if (serviceError instanceof SupabaseOperationError && isUniqueViolationCode(serviceError.code)) {
      return apiError('Resource already exists', 409);
    }

    const message = serviceError instanceof Error ? serviceError.message : 'Failed to create note';
    return apiError(message, 500);
  }
}
