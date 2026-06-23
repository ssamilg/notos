import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

type AuthResponse = {
  ok: boolean;
  error?: string;
  message?: string;
  redirect?: string;
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();
  let response: AuthResponse = { ok: false, error: 'Invalid request' };
  let status = 400;

  if (intent === 'login') {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      response = { ok: false, error: error.message };
      status = 401;
    } else {
      response = { ok: true, redirect: '/dashboard' };
      status = 200;
    }
  } else if (intent === 'signup') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      response = { ok: false, error: error.message };
      status = 400;
    } else if (!data.session) {
      response = {
        ok: true,
        message: 'Check your email for a confirmation link before logging in.',
      };
      status = 200;
    } else {
      response = { ok: true, redirect: '/dashboard' };
      status = 200;
    }
  } else if (intent === 'logout') {
    const { error } = await supabase.auth.signOut();

    if (error) {
      response = { ok: false, error: error.message };
      status = 400;
    } else {
      response = { ok: true, redirect: '/login' };
      status = 200;
    }
  }

  return NextResponse.json(response, { status });
}
