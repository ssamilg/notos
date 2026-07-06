import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    async function completeAuth() {
      const next = searchParams.get('next') ?? '/dashboard';
      const { error } = await supabase.auth.getSession();

      if (error) {
        navigate('/login');
        return;
      }

      navigate(next);
    }

    void completeAuth();
  }, [navigate, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-caption text-muted-foreground">Completing sign in…</p>
    </main>
  );
}
