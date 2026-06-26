import {
  createTagForUser,
  listTagsForUser,
} from '@/services/tags';
import { apiError, apiSuccess } from '@/utils/api/response';
import { createTagSchema } from '@/utils/api/schemas';
import { requireUser } from '@/utils/api/requireUser';

export async function GET() {
  const { supabase, user, error } = await requireUser();

  if (error || !user) {
    return apiError('Unauthorized', 401);
  }

  try {
    const tags = await listTagsForUser(supabase, user.id);
    return apiSuccess(tags);
  } catch (serviceError) {
    const message = serviceError instanceof Error ? serviceError.message : 'Failed to fetch tags';
    return apiError(message, 500);
  }
}

export async function POST(request: Request) {
  const { supabase, user, error } = await requireUser();

  if (error || !user) {
    return apiError('Unauthorized', 401);
  }

  const body: unknown = await request.json();
  const parsed = createTagSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'Invalid request', 422);
  }

  try {
    const tag = await createTagForUser(supabase, user.id, parsed.data.name);
    return apiSuccess(tag, { status: 201 });
  } catch (serviceError) {
    const message = serviceError instanceof Error ? serviceError.message : 'Failed to create tag';
    const status = message.includes('duplicate') || message.includes('unique') ? 422 : 500;
    return apiError(message, status);
  }
}
