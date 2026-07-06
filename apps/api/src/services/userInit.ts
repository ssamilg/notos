import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@notos/shared';
import { ensureDefaultProject } from './projects.js';

export async function initializeUser(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  return ensureDefaultProject(supabase, userId);
}
