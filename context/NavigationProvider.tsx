"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";

type PendingView =
  | { type: "projects" }
  | { type: "notes"; projectId: string }
  | { type: "note"; projectId: string; noteId: string };

type NavigationState = {
  pending: PendingView | null;
  navigateToProjects: () => void;
  navigateToProject: (projectId: string) => void;
  navigateToNote: (projectId: string, noteId: string, options?: { instant?: boolean }) => void;
  clearPending: () => void;
  isPendingProjects: boolean;
  isPendingNotes: (projectId: string) => boolean;
  isPendingNote: (projectId: string, noteId: string) => boolean;
};

const NavigationContext = createContext<NavigationState | null>(null);

function pendingMatches(pending: PendingView | null, target: PendingView) {
  if (!pending) {
    return false;
  }

  if (pending.type !== target.type) {
    return false;
  }

  if (target.type === "projects") {
    return pending.type === "projects";
  }

  if (target.type === "notes") {
    return pending.type === "notes" && pending.projectId === target.projectId;
  }

  return (
    pending.type === "note" &&
    pending.projectId === target.projectId &&
    pending.noteId === target.noteId
  );
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, setPending] = useState<PendingView | null>(null);

  const startPending = useCallback((view: PendingView) => {
    flushSync(() => {
      setPending(view);
    });
  }, []);

  const clearPending = useCallback(() => {
    setPending(null);
  }, []);

  const navigateToProjects = useCallback(() => {
    startPending({ type: "projects" });
    router.push("/dashboard");
  }, [router, startPending]);

  const navigateToProject = useCallback(
    (projectId: string) => {
      startPending({ type: "notes", projectId });
      router.push(`/project/${projectId}`);
    },
    [router, startPending]
  );

  const navigateToNote = useCallback(
    (projectId: string, noteId: string, options?: { instant?: boolean }) => {
      if (!options?.instant) {
        startPending({ type: "note", projectId, noteId });
      }

      router.push(`/project/${projectId}/note/${noteId}`);
    },
    [router, startPending]
  );

  const isPendingProjects = pendingMatches(pending, { type: "projects" });

  const isPendingNotes = useCallback(
    (projectId: string) => pendingMatches(pending, { type: "notes", projectId }),
    [pending]
  );

  const isPendingNote = useCallback(
    (projectId: string, noteId: string) =>
      pendingMatches(pending, { type: "note", projectId, noteId }),
    [pending]
  );

  const value = useMemo(
    () => ({
      pending,
      navigateToProjects,
      navigateToProject,
      navigateToNote,
      clearPending,
      isPendingProjects,
      isPendingNotes,
      isPendingNote,
    }),
    [
      pending,
      navigateToProjects,
      navigateToProject,
      navigateToNote,
      clearPending,
      isPendingProjects,
      isPendingNotes,
      isPendingNote,
    ]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }

  return context;
}
