import { initializeUser } from '@/services/userInit';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  let response = NextResponse.redirect(`${origin}${next}`);

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      await initializeUser(supabase, data.user.id);
      response = NextResponse.redirect(`${origin}${next}`);
    } else if (error) {
      response = NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  return response;
}
