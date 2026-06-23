import {
  deleteProjectForUser,
  updateProjectForUser,
} from '@/services/projects';
import { apiError, apiSuccess } from '@/utils/api/response';
import { updateProjectSchema } from '@/utils/api/schemas';
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
  const body: unknown = await request.json();
  const parsed = updateProjectSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'Invalid request', 422);
  }

  if (parsed.data.deleted_at !== undefined) {
    try {
      const project = await deleteProjectForUser(supabase, id);
      return apiSuccess(project);
    } catch (serviceError) {
      const message = serviceError instanceof Error ? serviceError.message : 'Failed to delete project';
      return apiError(message, 500);
    }
  }

  if (!parsed.data.name) {
    return apiError('Name is required', 422);
  }

  try {
    const project = await updateProjectForUser(supabase, id, { name: parsed.data.name });
    return apiSuccess(project);
  } catch (serviceError) {
    const message = serviceError instanceof Error ? serviceError.message : 'Failed to update project';
    return apiError(message, 500);
  }
}
