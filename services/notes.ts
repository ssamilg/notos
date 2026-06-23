import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/database.types';
import {
  createNote,
  getNoteById,
  getNotes,
  softDeleteNote,
  updateNote,
  type NoteUpdateInput,
} from '@/data/notes';

export async function listNotes(
  supabase: SupabaseClient<Database>,
  projectId: string
) {
  return getNotes(supabase, projectId);
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
  projectId: string,
  title: string,
  text: string,
  tag?: string | null
) {
  return createNote(supabase, userId, projectId, title, text, tag);
}

export async function updateNoteForUser(
  supabase: SupabaseClient<Database>,
  noteId: string,
  input: NoteUpdateInput
) {
  return updateNote(supabase, noteId, input);
}

export async function deleteNoteForUser(
  supabase: SupabaseClient<Database>,
  noteId: string
) {
  return softDeleteNote(supabase, noteId);
}
