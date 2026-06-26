import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/database.types';
import { formatSupabaseError, throwSupabaseError } from '@/utils/supabase/errors';

type Project = Database['public']['Tables']['projects']['Row'];

export type ProjectWithCount = Project & {
  note_count: number;
};

export type ProjectUpdateInput = {
  name?: string;
  deleted_at?: string | null;
};

export async function getProjects(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(formatSupabaseError(error, 'getProjects failed'));
  }

  return data;
}

export async function getProjectsWithNoteCounts(supabase: SupabaseClient<Database>) {
  const projects = await getProjects(supabase);
  let result: ProjectWithCount[] = [];

  if (projects.length === 0) {
    return result;
  }

  const projectIds = projects.map((project) => project.id);
  const { data: notes, error } = await supabase
    .from('notes')
    .select('project_id')
    .in('project_id', projectIds)
    .is('deleted_at', null);

  if (error) {
    throw new Error(formatSupabaseError(error, 'getProjectsWithNoteCounts failed'));
  }

  const counts = notes.reduce<Record<string, number>>((accumulator, note) => {
    accumulator[note.project_id] = (accumulator[note.project_id] ?? 0) + 1;
    return accumulator;
  }, {});

  result = projects.map((project) => ({
    ...project,
    note_count: counts[project.id] ?? 0,
  }));

  return result;
}

export async function getProjectById(
  supabase: SupabaseClient<Database>,
  projectId: string
) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw new Error(formatSupabaseError(error, 'getProjectById failed'));
  }

  return data;
}

export async function countActiveProjects(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { count, error } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (error) {
    throw new Error(formatSupabaseError(error, 'countActiveProjects failed'));
  }

  return count ?? 0;
}

export async function createProject(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string,
  name: string
) {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      id,
      name,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throwSupabaseError(error, 'createProject failed');
  }

  return data;
}

export async function updateProject(
  supabase: SupabaseClient<Database>,
  projectId: string,
  input: ProjectUpdateInput
) {
  const { data, error } = await supabase
    .from('projects')
    .update(input)
    .eq('id', projectId)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) {
    throw new Error(formatSupabaseError(error, 'updateProject failed'));
  }

  return data;
}

export async function softDeleteProject(
  supabase: SupabaseClient<Database>,
  projectId: string
) {
  const deletedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from('projects')
    .update({ deleted_at: deletedAt })
    .eq('id', projectId)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) {
    throw new Error(formatSupabaseError(error, 'softDeleteProject failed'));
  }

  await supabase
    .from('notes')
    .update({ deleted_at: deletedAt })
    .eq('project_id', projectId)
    .is('deleted_at', null);

  return data;
}

export type { Project };
