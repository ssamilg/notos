import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SkipLink } from '@/components/a11y/SkipLink';
import { QueryProvider } from '@/providers/QueryProvider';
import { DashboardBootstrap } from '@/features/dashboard/DashboardBootstrap';
import { DashboardShell } from '@/features/dashboard/DashboardShell';
import { LandingView } from '@/features/auth/LandingView';
import { LoginPage } from '@/features/auth/LoginPage';
import { AuthCallbackPage } from '@/features/auth/AuthCallbackPage';
import { AuthGate } from '@/features/auth/AuthGate';

function DashboardApp() {
  return (
    <AuthGate>
      <DashboardBootstrap>
        <DashboardShell />
      </DashboardBootstrap>
    </AuthGate>
  );
}

export function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <SkipLink />
        <Routes>
          <Route path="/" element={<LandingView />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/dashboard" element={<DashboardApp />} />
          <Route path="/project/:id" element={<DashboardApp />} />
          <Route path="/note/:id" element={<DashboardApp />} />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  );
}
