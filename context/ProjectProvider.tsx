"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ProjectWithCount } from "@/data/projects";
import {
  getCachedProjects,
  hasCachedProjects,
  hasFetchedProjects,
  markProjectsFetched,
  resolveUserId,
  setCachedProjects,
} from "@/lib/cache/clientCache";
import { readProjects, writeProjects } from "@/lib/storage/indexedDb";
import { addSyncListener, enqueueOperation, removeSyncListener, retryFailedOperations } from "@/lib/sync/queue";
import { apiFetch } from "@/utils/api/client";

type ProjectState = {
  projects: ProjectWithCount[];
  loading: boolean;
  ready: boolean;
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
  const cachedProjects = getCachedProjects();
  const [projects, setProjects] = useState<ProjectWithCount[]>(cachedProjects ?? []);
  const [loading, setLoading] = useState(!cachedProjects);
  const [ready, setReady] = useState(() => hasCachedProjects());
  const [error, setError] = useState<string | null>(null);
  const [pendingSync, setPendingSync] = useState(0);
  const [failedSync, setFailedSync] = useState(0);
  const userIdRef = useRef<string | null>(null);
  const bootstrapStartedRef = useRef(false);

  const persistProjects = useCallback(async (nextProjects: ProjectWithCount[]) => {
    setProjects(nextProjects);
    setCachedProjects(nextProjects);

    if (userIdRef.current) {
      await writeProjects(userIdRef.current, nextProjects);
    }
  }, []);

  const fetchRemoteProjects = useCallback(async (currentUserId: string) => {
    const remote = await apiFetch<ProjectWithCount[]>("/api/v1/projects");
    setProjects(remote);
    setCachedProjects(remote);
    markProjectsFetched();
    await writeProjects(currentUserId, remote);
    setError(null);
  }, []);

  const hydrateProjects = useCallback(
    async (currentUserId: string, forceRemote: boolean) => {
      const memoryCached = getCachedProjects();

      if (memoryCached) {
        setProjects(memoryCached);
        setLoading(false);

        if (!forceRemote && hasFetchedProjects()) {
          setReady(true);
          return;
        }
      }

      const idbCached = (await readProjects(currentUserId)) as ProjectWithCount[];

      if (idbCached.length > 0) {
        setProjects(idbCached);
        setCachedProjects(idbCached);
        setLoading(false);

        if (!forceRemote && hasFetchedProjects()) {
          setReady(true);
          return;
        }
      }

      if (!forceRemote && hasFetchedProjects()) {
        setLoading(false);
        setReady(true);
        return;
      }

      try {
        await fetchRemoteProjects(currentUserId);
      } catch (hydrateError) {
        const message =
          hydrateError instanceof Error ? hydrateError.message : "Failed to load projects";
        setError(idbCached.length === 0 && !memoryCached ? message : null);
      } finally {
        setLoading(false);
        setReady(true);
      }
    },
    [fetchRemoteProjects]
  );

  useEffect(() => {
    if (bootstrapStartedRef.current) {
      return;
    }

    bootstrapStartedRef.current = true;

    void resolveUserId().then((resolvedUserId) => {
      if (!resolvedUserId) {
        setLoading(false);
        setReady(true);
        setError("Not authenticated");
        return;
      }

      userIdRef.current = resolvedUserId;
      void hydrateProjects(resolvedUserId, false);
    });

    const syncListener = (pending: number, failed: number) => {
      setPendingSync(pending);
      setFailedSync(failed);
    };

    addSyncListener(syncListener);

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

        setCachedProjects(next);

        if (userIdRef.current) {
          void writeProjects(userIdRef.current, next);
        }

        return next;
      });
    }

    window.addEventListener("notos:sync-resolved", handleSyncResolved);

    return () => {
      removeSyncListener(syncListener);
      window.removeEventListener("notos:sync-resolved", handleSyncResolved);
    };
  }, [hydrateProjects]);

  const createProject = useCallback(
    (name: string) => {
      const currentUserId = userIdRef.current;

      if (!currentUserId) {
        return;
      }

      const optimistic = createTempProject(name, currentUserId);
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
    [persistProjects, projects]
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
    if (!userIdRef.current) {
      return;
    }

    setLoading(true);
    setReady(false);
    await hydrateProjects(userIdRef.current, true);
  }, [hydrateProjects]);

  const value = useMemo(
    () => ({
      projects,
      loading,
      ready,
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
      ready,
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
