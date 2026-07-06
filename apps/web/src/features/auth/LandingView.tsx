import { Link } from 'react-router-dom';
import { GlowButton } from '@/components/glow-button';

export function LandingView() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-display glow-text mb-6">NOTOS</h1>
      <p className="text-body mb-10 max-w-xl">
        Noise to Signal — a minimal note app for capturing thoughts without friction.
      </p>
      <Link to="/login">
        <GlowButton type="button">Get started</GlowButton>
      </Link>
    </main>
  );
}
