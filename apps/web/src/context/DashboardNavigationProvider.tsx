import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  buildDashboardPath,
  parseDashboardPath,
  type DashboardView,
} from '@/lib/navigation/dashboardView';

type DashboardNavigationState = {
  view: DashboardView;
  navigate: (nextView: DashboardView) => void;
  navigateToProjects: () => void;
  navigateToProject: (projectId: string) => void;
  navigateToNote: (noteId: string) => void;
};

const DashboardNavigationContext = createContext<DashboardNavigationState | null>(null);

export function DashboardNavigationProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigateRouter = useNavigate();
  const pathname = `${location.pathname}${location.search}`;
  const [view, setView] = useState<DashboardView>(() => parseDashboardPath(pathname));

  useEffect(() => {
    setView(parseDashboardPath(`${location.pathname}${location.search}`));
  }, [location.pathname, location.search]);

  const navigate = useCallback(
    (nextView: DashboardView) => {
      const path = buildDashboardPath(nextView);
      navigateRouter(path);
      setView(nextView);
    },
    [navigateRouter]
  );

  const navigateToProjects = useCallback(() => {
    navigate({ type: 'projects' });
  }, [navigate]);

  const navigateToProject = useCallback(
    (projectId: string) => {
      navigate({ type: 'notes', projectId });
    },
    [navigate]
  );

  const navigateToNote = useCallback(
    (noteId: string) => {
      navigate({ type: 'note', noteId });
    },
    [navigate]
  );

  const value = useMemo(
    () => ({
      view,
      navigate,
      navigateToProjects,
      navigateToProject,
      navigateToNote,
    }),
    [view, navigate, navigateToProjects, navigateToProject, navigateToNote]
  );

  return (
    <DashboardNavigationContext.Provider value={value}>{children}</DashboardNavigationContext.Provider>
  );
}

export function useDashboardNavigation() {
  const context = useContext(DashboardNavigationContext);

  if (!context) {
    throw new Error('useDashboardNavigation must be used within DashboardNavigationProvider');
  }

  return context;
}
