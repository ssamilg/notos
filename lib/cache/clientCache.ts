import type { Note } from '@/data/notes';
import type { ProjectWithCount } from '@/data/projects';
import { createClient } from '@/utils/supabase/client';

type CacheEntry<T> = {
  data: T;
};

let userIdCache: string | null = null;
let userIdPromise: Promise<string | null> | null = null;

let projectsCache: CacheEntry<ProjectWithCount[]> | null = null;
const notesCache = new Map<string, CacheEntry<Note[]>>();

const fetchedProjects = { current: false };
const fetchedNotes = new Set<string>();

export function getCachedUserId() {
  return userIdCache;
}

export async function resolveUserId() {
  if (userIdCache) {
    return userIdCache;
  }

  if (userIdPromise) {
    return userIdPromise;
  }

  userIdPromise = (async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    userIdCache = session?.user?.id ?? null;
    userIdPromise = null;
    return userIdCache;
  })();

  return userIdPromise;
}

export function clearClientCache() {
  userIdCache = null;
  userIdPromise = null;
  projectsCache = null;
  notesCache.clear();
  fetchedProjects.current = false;
  fetchedNotes.clear();
}

export function getCachedProjects() {
  return projectsCache?.data ?? null;
}

export function setCachedProjects(projects: ProjectWithCount[]) {
  projectsCache = { data: projects };
}

export function hasFetchedProjects() {
  return fetchedProjects.current;
}

export function hasCachedProjects() {
  return projectsCache !== null;
}

export function markProjectsFetched() {
  fetchedProjects.current = true;
}

export function getCachedNotes(projectId: string) {
  return notesCache.get(projectId)?.data ?? null;
}

export function setCachedNotes(projectId: string, notes: Note[]) {
  notesCache.set(projectId, { data: notes });
}

export function hasFetchedNotes(projectId: string) {
  return fetchedNotes.has(projectId);
}

export function hasCachedNotes(projectId: string) {
  return notesCache.has(projectId);
}

export function hasCachedNote(projectId: string, noteId: string) {
  const notes = getCachedNotes(projectId);

  if (!notes) {
    return false;
  }

  return notes.some((note) => note.id === noteId);
}

export function markNotesFetched(projectId: string) {
  fetchedNotes.add(projectId);
}
