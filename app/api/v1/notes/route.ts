import {
  createNoteForUser,
  listNotes,
} from '@/services/notes';
import { apiError, apiSuccess } from '@/utils/api/response';
import { createNoteSchema, notesQuerySchema } from '@/utils/api/schemas';
import { requireUser } from '@/utils/api/requireUser';

export async function GET(request: Request) {
  const { supabase, user, error } = await requireUser();

  if (error || !user) {
    return apiError('Unauthorized', 401);
  }

  const { searchParams } = new URL(request.url);
  const parsed = notesQuerySchema.safeParse({
    projectId: searchParams.get('projectId') ?? '',
  });

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'projectId is required', 422);
  }

  try {
    const notes = await listNotes(supabase, parsed.data.projectId);
    return apiSuccess(notes);
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
      parsed.data.projectId,
      parsed.data.title,
      parsed.data.text,
      parsed.data.tag
    );
    return apiSuccess(note, { status: 201 });
  } catch (serviceError) {
    const message = serviceError instanceof Error ? serviceError.message : 'Failed to create note';
    return apiError(message, 500);
  }
}
