import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@notos/shared';
import { findOrCreateTags, syncNoteTags } from './tags.js';
import { formatSupabaseError, throwSupabaseError } from '../lib/supabase/errors.js';
import {
  decodeNoteListCursor,
  encodeNoteListCursor,
} from '../lib/notesCursor.js';

type NoteRow = Database['public']['Tables']['notes']['Row'];

export type NoteWithTags = NoteRow & {
  tags: string[];
};

export type NoteUpdateInput = {
  title?: string;
  text?: string;
  tags?: string[];
  is_completed?: boolean;
  deleted_at?: string | null;
};

export type NotesQueryInput = {
  projectId: string;
  cursor?: string;
  search?: string;
  tagId?: string;
  limit?: number;
};

export type NotesQueryResult = {
  notes: NoteWithTags[];
  nextCursor: string | null;
};

type NoteTagRelation = {
  tags: { name: string } | { name: string }[] | null;
};

type NoteRowWithRelations = NoteRow & {
  note_tags?: NoteTagRelation[];
};

const DEFAULT_LIMIT = 20;

function extractTagNames(noteTags: NoteTagRelation[] | undefined): string[] {
  if (!noteTags) {
    return [];
  }

  const names: string[] = [];

  for (const link of noteTags) {
    if (!link.tags) {
      continue;
    }

    if (Array.isArray(link.tags)) {
      for (const tag of link.tags) {
        names.push(tag.name);
      }
    } else {
      names.push(link.tags.name);
    }
  }

  return [...new Set(names)].sort();
}

function mapNoteRow(row: NoteRowWithRelations): NoteWithTags {
  const { note_tags, ...note } = row;

  return {
    ...note,
    tags: extractTagNames(note_tags),
  };
}

async function fetchNoteWithTags(
  supabase: SupabaseClient<Database>,
  noteId: string
): Promise<NoteWithTags | null> {
  const { data, error } = await supabase
    .from('notes')
    .select('*, note_tags ( tags ( name ) )')
    .eq('id', noteId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw new Error(formatSupabaseError(error, 'fetchNoteWithTags failed'));
  }

  if (!data) {
    return null;
  }

  return mapNoteRow(data as NoteRowWithRelations);
}

export async function getNotes(
  supabase: SupabaseClient<Database>,
  input: NotesQueryInput
): Promise<NotesQueryResult> {
  const limit = input.limit ?? DEFAULT_LIMIT;
  const selectClause = input.tagId
    ? '*, note_tags!inner ( tag_id, tags ( name ) )'
    : '*, note_tags ( tags ( name ) )';

  let query = supabase
    .from('notes')
    .select(selectClause)
    .eq('project_id', input.projectId)
    .is('deleted_at', null)
    .order('is_completed', { ascending: true })
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (input.tagId) {
    query = query.eq('note_tags.tag_id', input.tagId);
  }

  if (input.cursor) {
    const decodedCursor = decodeNoteListCursor(input.cursor);

    if (decodedCursor) {
      if (decodedCursor.is_completed) {
        query = query
          .eq('is_completed', true)
          .lt('updated_at', decodedCursor.updated_at);
      } else {
        query = query.or(
          `is_completed.eq.true,and(is_completed.eq.false,updated_at.lt."${decodedCursor.updated_at}")`
        );
      }
    } else {
      query = query.lt('updated_at', input.cursor);
    }
  }

  if (input.search && input.search.trim().length > 0) {
    const term = `%${input.search.trim()}%`;
    query = query.or(`title.ilike.${term},text.ilike.${term}`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(formatSupabaseError(error, 'getNotes failed'));
  }

  const rows = (data ?? []) as NoteRowWithRelations[];
  const notes = rows.map(mapNoteRow);
  let nextCursor: string | null = null;

  if (notes.length === limit) {
    const lastNote = notes[notes.length - 1];

    if (lastNote) {
      nextCursor = encodeNoteListCursor(lastNote.is_completed, lastNote.updated_at);
    }
  }

  return { notes, nextCursor };
}

export async function getNoteById(
  supabase: SupabaseClient<Database>,
  noteId: string
) {
  return fetchNoteWithTags(supabase, noteId);
}

export async function createNote(
  supabase: SupabaseClient<Database>,
  userId: string,
  id: string,
  projectId: string,
  title: string,
  text: string,
  tags?: string[],
  isCompleted?: boolean
): Promise<NoteWithTags> {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      id,
      title,
      text,
      project_id: projectId,
      user_id: userId,
      is_completed: isCompleted ?? false,
    })
    .select()
    .single();

  if (error) {
    throwSupabaseError(error, 'createNote failed');
  }

  if (tags && tags.length > 0) {
    const tagIds = await findOrCreateTags(supabase, userId, tags);

    try {
      await syncNoteTags(supabase, data.id, tagIds);
    } catch (syncError) {
      await supabase.from('notes').delete().eq('id', data.id);
      throw syncError;
    }
  }

  const note = await fetchNoteWithTags(supabase, data.id);

  if (!note) {
    throw new Error('createNote failed to load created note');
  }

  return note;
}

export async function updateNote(
  supabase: SupabaseClient<Database>,
  noteId: string,
  userId: string,
  input: NoteUpdateInput
): Promise<NoteWithTags> {
  const { tags, ...noteFields } = input;
  const hasNoteFields = Object.keys(noteFields).length > 0;

  if (hasNoteFields) {
    const { error } = await supabase
      .from('notes')
      .update(noteFields)
      .eq('id', noteId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(formatSupabaseError(error, 'updateNote failed'));
    }
  }

  if (tags !== undefined) {
    const tagIds = await findOrCreateTags(supabase, userId, tags);
    await syncNoteTags(supabase, noteId, tagIds);
  }

  const note = await fetchNoteWithTags(supabase, noteId);

  if (!note) {
    throw new Error('updateNote failed to load updated note');
  }

  return note;
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

  return {
    ...data,
    tags: [] as string[],
  };
}

export type Note = NoteWithTags;
