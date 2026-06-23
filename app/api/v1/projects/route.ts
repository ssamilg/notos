import {
  createProjectForUser,
  listProjects,
} from '@/services/projects';
import { apiError, apiSuccess } from '@/utils/api/response';
import { createProjectSchema } from '@/utils/api/schemas';
import { requireUser } from '@/utils/api/requireUser';

export async function GET() {
  const { supabase, user, error } = await requireUser();

  if (error || !user) {
    return apiError('Unauthorized', 401);
  }

  try {
    const projects = await listProjects(supabase);
    return apiSuccess(projects);
  } catch (serviceError) {
    const message = serviceError instanceof Error ? serviceError.message : 'Failed to fetch projects';
    return apiError(message, 500);
  }
}

export async function POST(request: Request) {
  const { supabase, user, error } = await requireUser();

  if (error || !user) {
    return apiError('Unauthorized', 401);
  }

  const body: unknown = await request.json();
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'Invalid request', 422);
  }

  try {
    const project = await createProjectForUser(supabase, user.id, parsed.data.name);
    return apiSuccess(project, { status: 201 });
  } catch (serviceError) {
    const message = serviceError instanceof Error ? serviceError.message : 'Failed to create project';
    return apiError(message, 500);
  }
}
