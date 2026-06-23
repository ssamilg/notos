import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/database.types';
import { formatSupabaseError } from '@/utils/supabase/errors';

type Note = Database['public']['Tables']['notes']['Row'];

export type NoteUpdateInput = {
  title?: string;
  text?: string;
  tag?: string | null;
  deleted_at?: string | null;
};

export async function getNotes(
  supabase: SupabaseClient<Database>,
  projectId: string
) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(formatSupabaseError(error, 'getNotes failed'));
  }

  return data;
}

export async function getNoteById(
  supabase: SupabaseClient<Database>,
  noteId: string
) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw new Error(formatSupabaseError(error, 'getNoteById failed'));
  }

  return data;
}

export async function createNote(
  supabase: SupabaseClient<Database>,
  userId: string,
  projectId: string,
  title: string,
  text: string,
  tag?: string | null
) {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      title,
      text,
      tag: tag ?? null,
      project_id: projectId,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(formatSupabaseError(error, 'createNote failed'));
  }

  return data;
}

export async function updateNote(
  supabase: SupabaseClient<Database>,
  noteId: string,
  input: NoteUpdateInput
) {
  const { data, error } = await supabase
    .from('notes')
    .update(input)
    .eq('id', noteId)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) {
    throw new Error(formatSupabaseError(error, 'updateNote failed'));
  }

  return data;
}

export async function softDeleteNote(
  supabase: SupabaseClient<Database>,
  noteId: string
) {
  const { data, error } = await supabase
    .from('notes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', noteId)
    .is('deleted_at', null)
    .select()
    .single();

  if (error) {
    throw new Error(formatSupabaseError(error, 'softDeleteNote failed'));
  }

  return data;
}

export type { Note };
