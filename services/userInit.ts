import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/database.types';
import { ensureDefaultProject } from '@/services/projects';

export async function initializeUser(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  return ensureDefaultProject(supabase, userId);
}
