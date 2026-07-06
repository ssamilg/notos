import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export function LogoutButton() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate('/login');
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-label fixed bottom-4 left-1/2 z-50 -translate-x-1/2 text-muted-foreground hover:text-foreground"
      onClick={handleLogout}
    >
      Log out
    </Button>
  );
}
