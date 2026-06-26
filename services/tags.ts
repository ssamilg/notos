import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/database.types';
import { createTag, deleteTag, getTagsWithCounts, updateTag } from '@/data/tags';

export async function listTagsForUser(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  return getTagsWithCounts(supabase, userId);
}

export async function createTagForUser(
  supabase: SupabaseClient<Database>,
  userId: string,
  name: string
) {
  return createTag(supabase, userId, name);
}

export async function deleteTagForUser(
  supabase: SupabaseClient<Database>,
  tagId: string
) {
  return deleteTag(supabase, tagId);
}

export async function updateTagForUser(
  supabase: SupabaseClient<Database>,
  tagId: string,
  name: string
) {
  return updateTag(supabase, tagId, name);
}
