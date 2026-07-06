import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/database.types';
import { formatSupabaseError } from '@/utils/supabase/errors';

export type TagWithCount = {
  id: string;
  name: string;
  note_count: number;
  created_at: string;
};

type TagRowWithRelations = {
  id: string;
  name: string;
  created_at: string;
  note_tags: Array<{
    note_id: string;
    notes: { deleted_at: string | null } | null;
  }>;
};

export async function getTagsWithCounts(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<TagWithCount[]> {
  const { data, error } = await supabase
    .from('tags')
    .select(`
      id,
      name,
      created_at,
      note_tags (
        note_id,
        notes ( deleted_at )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(formatSupabaseError(error, 'getTagsWithCounts failed'));
  }

  const rows = (data ?? []) as TagRowWithRelations[];
  const result = rows.map((row) => {
    const activeCount = row.note_tags.filter(
      (link) => link.notes !== null && link.notes.deleted_at === null
    ).length;

    return {
      id: row.id,
      name: row.name,
      note_count: activeCount,
      created_at: row.created_at,
    };
  });

  return result;
}

export async function createTag(
  supabase: SupabaseClient<Database>,
  userId: string,
  name: string
): Promise<TagWithCount> {
  const trimmed = name.trim();

  const { data, error } = await supabase
    .from('tags')
    .insert({ user_id: userId, name: trimmed })
    .select('id, name, created_at')
    .single();

  if (error) {
    throw new Error(formatSupabaseError(error, 'createTag failed'));
  }

  return {
    id: data.id,
    name: data.name,
    note_count: 0,
    created_at: data.created_at,
  };
}

export async function updateTag(
  supabase: SupabaseClient<Database>,
  tagId: string,
  name: string
): Promise<{ id: string; name: string; created_at: string }> {
  const trimmed = name.trim();

  const { data, error } = await supabase
    .from('tags')
    .update({ name: trimmed })
    .eq('id', tagId)
    .select('id, name, created_at')
    .single();

  if (error) {
    throw new Error(formatSupabaseError(error, 'updateTag failed'));
  }

  return data;
}

export async function deleteTag(
  supabase: SupabaseClient<Database>,
  tagId: string
) {
  const { data, error } = await supabase
    .from('tags')
    .delete()
    .eq('id', tagId)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(formatSupabaseError(error, 'deleteTag failed'));
  }

  return data;
}

export async function findOrCreateTags(
  supabase: SupabaseClient<Database>,
  userId: string,
  names: string[]
): Promise<string[]> {
  const normalized = [
    ...new Set(names.map((name) => name.trim()).filter((name) => name.length > 0)),
  ];
  const tagIds: string[] = [];

  for (const name of normalized) {
    const { data: existing, error: lookupError } = await supabase
      .from('tags')
      .select('id')
      .eq('user_id', userId)
      .eq('name', name)
      .maybeSingle();

    if (lookupError) {
      throw new Error(formatSupabaseError(lookupError, 'findOrCreateTags lookup failed'));
    }

    if (existing) {
      tagIds.push(existing.id);
    } else {
      const { data: created, error: insertError } = await supabase
        .from('tags')
        .insert({ user_id: userId, name })
        .select('id')
        .single();

      if (insertError) {
        throw new Error(formatSupabaseError(insertError, 'findOrCreateTags insert failed'));
      }

      tagIds.push(created.id);
    }
  }

  return tagIds;
}

export async function syncNoteTags(
  supabase: SupabaseClient<Database>,
  noteId: string,
  tagIds: string[]
) {
  const { data: existing, error: fetchError } = await supabase
    .from('note_tags')
    .select('tag_id')
    .eq('note_id', noteId);

  if (fetchError) {
    throw new Error(formatSupabaseError(fetchError, 'syncNoteTags fetch failed'));
  }

  const existingIds = new Set((existing ?? []).map((row) => row.tag_id));
  const newIds = new Set(tagIds);
  const toAdd = tagIds.filter((id) => !existingIds.has(id));
  const toRemove = [...existingIds].filter((id) => !newIds.has(id));

  if (toRemove.length > 0) {
    const { error: deleteError } = await supabase
      .from('note_tags')
      .delete()
      .eq('note_id', noteId)
      .in('tag_id', toRemove);

    if (deleteError) {
      throw new Error(formatSupabaseError(deleteError, 'syncNoteTags delete failed'));
    }
  }

  if (toAdd.length > 0) {
    const { error: insertError } = await supabase
      .from('note_tags')
      .insert(toAdd.map((tagId) => ({ note_id: noteId, tag_id: tagId })));

    if (insertError) {
      throw new Error(formatSupabaseError(insertError, 'syncNoteTags insert failed'));
    }
  }
}
