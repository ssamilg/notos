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
import type { Note } from "@/data/notes";
import {
  getCachedNotes,
  hasFetchedNotes,
  markNotesFetched,
  resolveUserId,
  setCachedNotes,
} from "@/lib/cache/clientCache";
import { readNotes, writeNotes } from "@/lib/storage/indexedDb";
import {
  addSyncListener,
  coalescePendingPost,
  enqueueOperation,
  removeSyncListener,
  retryFailedOperations,
} from "@/lib/sync/queue";
import { apiFetch } from "@/utils/api/client";

type NoteState = {
  notes: Note[];
  loading: boolean;
  error: string | null;
  pendingSync: number;
  failedSync: number;
  createNote: (title: string, text: string, tag?: string | null) => string | undefined;
  updateNote: (id: string, input: { title?: string; text?: string; tag?: string | null }) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
  refreshNotes: () => Promise<void>;
  retrySync: () => void;
};

const NoteContext = createContext<NoteState | null>(null);

function isTempId(id: string) {
  return id.startsWith("temp-");
}

function createTempNote(
  projectId: string,
  userId: string,
  title: string,
  text: string,
  tag?: string | null
): Note {
  const now = new Date().toISOString();
  return {
    id: `temp-${crypto.randomUUID()}`,
    project_id: projectId,
    user_id: userId,
    title,
    text,
    tag: tag ?? null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  };
}

type NoteProviderProps = {
  projectId: string;
  children: ReactNode;
};

export function NoteProvider({ projectId, children }: NoteProviderProps) {
  const cachedNotes = getCachedNotes(projectId);
  const [notes, setNotes] = useState<Note[]>(cachedNotes ?? []);
  const [loading, setLoading] = useState(!cachedNotes);
  const [error, setError] = useState<string | null>(null);
  const [pendingSync, setPendingSync] = useState(0);
  const [failedSync, setFailedSync] = useState(0);
  const userIdRef = useRef<string | null>(null);
  const projectIdRef = useRef(projectId);

  const persistNotes = useCallback(
    async (nextNotes: Note[]) => {
      setNotes(nextNotes);
      setCachedNotes(projectIdRef.current, nextNotes);

      if (userIdRef.current) {
        await writeNotes(userIdRef.current, projectIdRef.current, nextNotes);
      }
    },
    []
  );

  const fetchRemoteNotes = useCallback(async (currentUserId: string, currentProjectId: string) => {
    const remote = await apiFetch<Note[]>(`/api/v1/notes?projectId=${currentProjectId}`);
    setNotes(remote);
    setCachedNotes(currentProjectId, remote);
    markNotesFetched(currentProjectId);
    await writeNotes(currentUserId, currentProjectId, remote);
    setError(null);
  }, []);

  const hydrateNotes = useCallback(
    async (currentUserId: string, currentProjectId: string, forceRemote: boolean) => {
      const memoryCached = getCachedNotes(currentProjectId);

      if (memoryCached) {
        setNotes(memoryCached);
        setLoading(false);

        if (!forceRemote && hasFetchedNotes(currentProjectId)) {
          return;
        }
      }

      const idbCached = (await readNotes(currentUserId, currentProjectId)) as Note[];

      if (idbCached.length > 0) {
        setNotes(idbCached);
        setCachedNotes(currentProjectId, idbCached);
        setLoading(false);

        if (!forceRemote && hasFetchedNotes(currentProjectId)) {
          return;
        }
      }

      if (!forceRemote && hasFetchedNotes(currentProjectId)) {
        setLoading(false);
        return;
      }

      try {
        await fetchRemoteNotes(currentUserId, currentProjectId);
      } catch (hydrateError) {
        const message =
          hydrateError instanceof Error ? hydrateError.message : "Failed to load notes";
        setError(idbCached.length === 0 && !memoryCached ? message : null);
      } finally {
        setLoading(false);
      }
    },
    [fetchRemoteNotes]
  );

  useEffect(() => {
    projectIdRef.current = projectId;

    let cancelled = false;

    void resolveUserId().then((resolvedUserId) => {
      if (cancelled) {
        return;
      }

      if (!resolvedUserId) {
        setLoading(false);
        setError("Not authenticated");
        return;
      }

      userIdRef.current = resolvedUserId;
      void hydrateNotes(resolvedUserId, projectId, false);
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
        projectId?: string;
        data: Record<string, unknown>;
      }>).detail;

      if (detail.entityType !== "note" || detail.projectId !== projectIdRef.current) {
        return;
      }

      setNotes((current) => {
        const next = current.map((note) => {
          if (note.id !== detail.tempId) {
            return note;
          }

          return {
            ...note,
            ...detail.data,
            id: detail.serverId,
          } as Note;
        });

        setCachedNotes(projectIdRef.current, next);

        if (userIdRef.current) {
          void writeNotes(userIdRef.current, projectIdRef.current, next);
        }

        return next;
      });
    }

    window.addEventListener("notos:sync-resolved", handleSyncResolved);

    return () => {
      cancelled = true;
      removeSyncListener(syncListener);
      window.removeEventListener("notos:sync-resolved", handleSyncResolved);
    };
  }, [hydrateNotes, projectId]);

  const createNote = useCallback(
    (title: string, text: string, tag?: string | null) => {
      const currentUserId = userIdRef.current;

      if (!currentUserId) {
        return undefined;
      }

      const optimistic = createTempNote(projectIdRef.current, currentUserId, title, text, tag);
      const next = [optimistic, ...notes];
      void persistNotes(next);

      enqueueOperation({
        id: crypto.randomUUID(),
        method: "POST",
        url: "/api/v1/notes",
        body: {
          projectId: projectIdRef.current,
          title,
          text,
          tag: tag ?? null,
        },
        entityType: "note",
        tempId: optimistic.id,
        projectId: projectIdRef.current,
      });

      return optimistic.id;
    },
    [notes, persistNotes]
  );

  const updateNote = useCallback(
    (id: string, input: { title?: string; text?: string; tag?: string | null }) => {
      const next = notes.map((note) => {
        if (note.id !== id) {
          return note;
        }

        return {
          ...note,
          ...input,
          updated_at: new Date().toISOString(),
        };
      });
      void persistNotes(next);

      if (isTempId(id)) {
        const updated = next.find((note) => note.id === id);

        if (updated) {
          coalescePendingPost(id, {
            title: updated.title,
            text: updated.text,
            tag: updated.tag,
          });
        }

        return;
      }

      enqueueOperation({
        id: crypto.randomUUID(),
        method: "PUT",
        url: `/api/v1/notes/${id}`,
        body: input,
        entityType: "note",
        projectId: projectIdRef.current,
      });
    },
    [notes, persistNotes]
  );

  const deleteNote = useCallback(
    (id: string) => {
      const next = notes.filter((note) => note.id !== id);
      void persistNotes(next);

      if (isTempId(id)) {
        return;
      }

      enqueueOperation({
        id: crypto.randomUUID(),
        method: "PUT",
        url: `/api/v1/notes/${id}`,
        body: { deleted_at: new Date().toISOString() },
        entityType: "note",
        projectId: projectIdRef.current,
      });
    },
    [notes, persistNotes]
  );

  const getNote = useCallback(
    (id: string) => {
      return notes.find((note) => note.id === id);
    },
    [notes]
  );

  const refreshNotes = useCallback(async () => {
    if (!userIdRef.current) {
      return;
    }

    setLoading(notes.length === 0);
    await hydrateNotes(userIdRef.current, projectIdRef.current, true);
    setLoading(false);
  }, [hydrateNotes, notes.length]);

  const value = useMemo(
    () => ({
      notes,
      loading,
      error,
      pendingSync,
      failedSync,
      createNote,
      updateNote,
      deleteNote,
      getNote,
      refreshNotes,
      retrySync: retryFailedOperations,
    }),
    [
      notes,
      loading,
      error,
      pendingSync,
      failedSync,
      createNote,
      updateNote,
      deleteNote,
      getNote,
      refreshNotes,
    ]
  );

  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
}

export function useNotes() {
  const context = useContext(NoteContext);

  if (!context) {
    throw new Error("useNotes must be used within NoteProvider");
  }

  return context;
}
