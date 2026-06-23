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
import type { ProjectWithCount } from "@/data/projects";
import { readProjects, writeProjects } from "@/lib/storage/indexedDb";
import { enqueueOperation, retryFailedOperations, setSyncListener } from "@/lib/sync/queue";
import { createClient } from "@/utils/supabase/client";
import { apiFetch } from "@/utils/api/client";

type ProjectState = {
  projects: ProjectWithCount[];
  loading: boolean;
  error: string | null;
  pendingSync: number;
  failedSync: number;
  createProject: (name: string) => void;
  updateProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  refreshProjects: () => Promise<void>;
  retrySync: () => void;
};

const ProjectContext = createContext<ProjectState | null>(null);

function isTempId(id: string) {
  return id.startsWith("temp-");
}

function createTempProject(name: string, userId: string): ProjectWithCount {
  const now = new Date().toISOString();
  return {
    id: `temp-${crypto.randomUUID()}`,
    user_id: userId,
    name,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    note_count: 0,
  };
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingSync, setPendingSync] = useState(0);
  const [failedSync, setFailedSync] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  const persistProjects = useCallback(
    async (nextProjects: ProjectWithCount[]) => {
      setProjects(nextProjects);

      if (userId) {
        await writeProjects(userId, nextProjects);
      }
    },
    [userId]
  );

  const hydrateFromApi = useCallback(async (currentUserId: string) => {
    const cached = (await readProjects(currentUserId)) as ProjectWithCount[];
    setProjects(cached);
    setLoading(false);

    try {
      const remote = await apiFetch<ProjectWithCount[]>("/api/v1/projects");
      setProjects(remote);
      await writeProjects(currentUserId, remote);
      setError(null);
    } catch (hydrateError) {
      const message = hydrateError instanceof Error ? hydrateError.message : "Failed to load projects";
      setError(cached.length === 0 ? message : null);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        void hydrateFromApi(data.user.id);
      } else {
        setLoading(false);
        setError("Not authenticated");
      }
    });

    setSyncListener((pending, failed) => {
      setPendingSync(pending);
      setFailedSync(failed);
    });

    function handleSyncResolved(event: Event) {
      const detail = (event as CustomEvent<{
        entityType: string;
        tempId: string;
        serverId: string;
        data: Record<string, unknown>;
      }>).detail;

      if (detail.entityType !== "project") {
        return;
      }

      setProjects((current) => {
        const next = current.map((project) => {
          if (project.id !== detail.tempId) {
            return project;
          }

          return {
            ...project,
            ...detail.data,
            id: detail.serverId,
            note_count: project.note_count,
          } as ProjectWithCount;
        });

        if (userId) {
          void writeProjects(userId, next);
        }

        return next;
      });
    }

    window.addEventListener("notos:sync-resolved", handleSyncResolved);

    return () => {
      setSyncListener(null);
      window.removeEventListener("notos:sync-resolved", handleSyncResolved);
    };
  }, [hydrateFromApi, userId]);

  const createProject = useCallback(
    (name: string) => {
      if (!userId) {
        return;
      }

      const optimistic = createTempProject(name, userId);
      const next = [optimistic, ...projects];
      void persistProjects(next);

      enqueueOperation({
        id: crypto.randomUUID(),
        method: "POST",
        url: "/api/v1/projects",
        body: { name },
        entityType: "project",
        tempId: optimistic.id,
      });
    },
    [persistProjects, projects, userId]
  );

  const updateProject = useCallback(
    (id: string, name: string) => {
      const next = projects.map((project) => {
        if (project.id !== id) {
          return project;
        }

        return {
          ...project,
          name,
          updated_at: new Date().toISOString(),
        };
      });
      void persistProjects(next);

      if (isTempId(id)) {
        return;
      }

      enqueueOperation({
        id: crypto.randomUUID(),
        method: "PUT",
        url: `/api/v1/projects/${id}`,
        body: { name },
        entityType: "project",
      });
    },
    [persistProjects, projects]
  );

  const deleteProject = useCallback(
    (id: string) => {
      const next = projects.filter((project) => project.id !== id);
      void persistProjects(next);

      if (isTempId(id)) {
        return;
      }

      enqueueOperation({
        id: crypto.randomUUID(),
        method: "PUT",
        url: `/api/v1/projects/${id}`,
        body: { deleted_at: new Date().toISOString() },
        entityType: "project",
      });
    },
    [persistProjects, projects]
  );

  const refreshProjects = useCallback(async () => {
    if (!userId) {
      return;
    }

    setLoading(true);
    await hydrateFromApi(userId);
    setLoading(false);
  }, [hydrateFromApi, userId]);

  const value = useMemo(
    () => ({
      projects,
      loading,
      error,
      pendingSync,
      failedSync,
      createProject,
      updateProject,
      deleteProject,
      refreshProjects,
      retrySync: retryFailedOperations,
    }),
    [
      projects,
      loading,
      error,
      pendingSync,
      failedSync,
      createProject,
      updateProject,
      deleteProject,
      refreshProjects,
    ]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error("useProjects must be used within ProjectProvider");
  }

  return context;
}
