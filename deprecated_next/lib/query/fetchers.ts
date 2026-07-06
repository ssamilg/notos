import type { ProjectWithCount } from "@/data/projects";
import type { TagWithCount } from "@/data/tags";
import type { Note } from "@/data/notes";
import { apiFetch } from "@/utils/api/client";

export async function fetchProjects(): Promise<ProjectWithCount[]> {
  return apiFetch<ProjectWithCount[]>("/api/v1/projects");
}

export async function fetchTags(): Promise<TagWithCount[]> {
  return apiFetch<TagWithCount[]>("/api/v1/tags");
}

export async function fetchNote(noteId: string): Promise<Note> {
  return apiFetch<Note>(`/api/v1/notes/${noteId}`);
}
