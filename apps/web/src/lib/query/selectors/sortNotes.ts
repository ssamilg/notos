import type { Note } from '@/types/domain';

export function sortNotes(notes: Note[]): Note[] {
  const incomplete = notes
    .filter((note) => !note.is_completed)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  const complete = notes
    .filter((note) => note.is_completed)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));

  return [...incomplete, ...complete];
}

export function flattenNotesPages(pages: Note[][]): Note[] {
  return sortNotes(pages.flat());
}
