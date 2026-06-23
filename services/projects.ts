import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/database.types';
import {
  countActiveProjects,
  createProject,
  getProjectById,
  getProjectsWithNoteCounts,
  softDeleteProject,
  updateProject,
  type ProjectUpdateInput,
} from '@/data/projects';

export async function listProjects(supabase: SupabaseClient<Database>) {
  return getProjectsWithNoteCounts(supabase);
}

export async function getProject(
  supabase: SupabaseClient<Database>,
  projectId: string
) {
  return getProjectById(supabase, projectId);
}

export async function createProjectForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  name: string
) {
  return createProject(supabase, userId, name);
}

export async function updateProjectForUser(
  supabase: SupabaseClient<Database>,
  projectId: string,
  input: ProjectUpdateInput
) {
  return updateProject(supabase, projectId, input);
}

export async function deleteProjectForUser(
  supabase: SupabaseClient<Database>,
  projectId: string
) {
  return softDeleteProject(supabase, projectId);
}

export async function ensureDefaultProject(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const activeCount = await countActiveProjects(supabase, userId);
  let project = null;

  if (activeCount === 0) {
    project = await createProject(supabase, userId, 'Default');
  }

  return project;
}
