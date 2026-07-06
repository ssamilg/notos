import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/database.types';
import {
  createNote,
  getNoteById,
  getNotes,
  softDeleteNote,
  updateNote,
  type NoteUpdateInput,
  type NotesQueryInput,
} from '@/data/notes';

export async function listNotes(
  supabase: SupabaseClient<Database>,
  input: NotesQueryInput
) {
  return getNotes(supabase, input);
}

export async function getNote(
  supabase: SupabaseClient<Database>,
  noteId: string
) {
  return getNoteById(supabase, noteId);
}

export async function createNoteForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string,
  projectId: string,
  title: string,
  text: string,
  tags?: string[],
  isCompleted?: boolean
) {
  return createNote(supabase, userId, id, projectId, title, text, tags, isCompleted);
}

export async function updateNoteForUser(
  supabase: SupabaseClient<Database>,
  noteId: string,
  userId: string,
  input: NoteUpdateInput
) {
  return updateNote(supabase, noteId, userId, input);
}

export async function deleteNoteForUser(
  supabase: SupabaseClient<Database>,
  noteId: string
) {
  return softDeleteNote(supabase, noteId);
}
