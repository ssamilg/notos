import { initializeUser } from '@/services/userInit';
import { createClient } from '@/utils/supabase/server';

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (user && !error) {
    await initializeUser(supabase, user.id);
  }

  return { supabase, user, error };
}
