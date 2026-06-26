"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  buildDashboardPath,
  parseDashboardPath,
  type DashboardView,
} from "@/lib/navigation/dashboardView";

type DashboardNavigationState = {
  view: DashboardView;
  navigate: (nextView: DashboardView) => void;
  navigateToProjects: () => void;
  navigateToProject: (projectId: string) => void;
  navigateToNote: (noteId: string) => void;
};

const DashboardNavigationContext = createContext<DashboardNavigationState | null>(null);

export function DashboardNavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [view, setView] = useState<DashboardView>(() => parseDashboardPath(pathname));

  useEffect(() => {
    setView(parseDashboardPath(pathname));
  }, [pathname]);

  useEffect(() => {
    function handlePopState() {
      setView(parseDashboardPath(window.location.pathname));
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigate = useCallback((nextView: DashboardView) => {
    const path = buildDashboardPath(nextView);
    window.history.pushState(null, "", path);
    setView(nextView);
  }, []);

  const navigateToProjects = useCallback(() => {
    navigate({ type: "projects" });
  }, [navigate]);

  const navigateToProject = useCallback(
    (projectId: string) => {
      navigate({ type: "notes", projectId });
    },
    [navigate]
  );

  const navigateToNote = useCallback(
    (noteId: string) => {
      navigate({ type: "note", noteId });
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
    throw new Error("useDashboardNavigation must be used within DashboardNavigationProvider");
  }

  return context;
}
