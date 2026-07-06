import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@notos/shared';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      supabase?: SupabaseClient<Database>;
      requestId?: string;
    }
  }
}

export {};
