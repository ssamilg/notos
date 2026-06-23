import type { PostgrestError } from '@supabase/supabase-js';

export function formatSupabaseError(error: PostgrestError, context: string) {
  const parts = [context, error.message, error.code, error.details, error.hint].filter(Boolean);
  return parts.join(' | ');
}
