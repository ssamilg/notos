import type { ProjectWithCount, TagWithCount, Note } from '@/types/domain';
import { apiFetch } from '@/lib/apiClient';

export async function fetchProjects(): Promise<ProjectWithCount[]> {
  return apiFetch<ProjectWithCount[]>('/api/v1/projects');
}

export async function fetchTags(): Promise<TagWithCount[]> {
  return apiFetch<TagWithCount[]>('/api/v1/tags');
}

export async function fetchNote(noteId: string): Promise<Note> {
  return apiFetch<Note>(`/api/v1/notes/${noteId}`);
}
