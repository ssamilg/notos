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
import type { Note } from "@/data/notes";
import { readNotes, writeNotes } from "@/lib/storage/indexedDb";
import { enqueueOperation, retryFailedOperations, setSyncListener } from "@/lib/sync/queue";
import { createClient } from "@/utils/supabase/client";
import { apiFetch } from "@/utils/api/client";

type NoteState = {
  notes: Note[];
  loading: boolean;
  error: string | null;
  pendingSync: number;
  failedSync: number;
  createNote: (title: string, text: string, tag?: string | null) => void;
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
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingSync, setPendingSync] = useState(0);
  const [failedSync, setFailedSync] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  const persistNotes = useCallback(
    async (nextNotes: Note[]) => {
      setNotes(nextNotes);

      if (userId) {
        await writeNotes(userId, projectId, nextNotes);
      }
    },
    [projectId, userId]
  );

  const hydrateFromApi = useCallback(
    async (currentUserId: string) => {
      const cached = (await readNotes(currentUserId, projectId)) as Note[];
      setNotes(cached);
      setLoading(false);

      try {
        const remote = await apiFetch<Note[]>(`/api/v1/notes?projectId=${projectId}`);
        setNotes(remote);
        await writeNotes(currentUserId, projectId, remote);
        setError(null);
      } catch (hydrateError) {
        const message = hydrateError instanceof Error ? hydrateError.message : "Failed to load notes";
        setError(cached.length === 0 ? message : null);
      }
    },
    [projectId]
  );

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
        projectId?: string;
        data: Record<string, unknown>;
      }>).detail;

      if (detail.entityType !== "note" || detail.projectId !== projectId) {
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

        if (userId) {
          void writeNotes(userId, projectId, next);
        }

        return next;
      });
    }

    window.addEventListener("notos:sync-resolved", handleSyncResolved);

    return () => {
      setSyncListener(null);
      window.removeEventListener("notos:sync-resolved", handleSyncResolved);
    };
  }, [hydrateFromApi, projectId, userId]);

  const createNote = useCallback(
    (title: string, text: string, tag?: string | null) => {
      if (!userId) {
        return;
      }

      const optimistic = createTempNote(projectId, userId, title, text, tag);
      const next = [optimistic, ...notes];
      void persistNotes(next);

      enqueueOperation({
        id: crypto.randomUUID(),
        method: "POST",
        url: "/api/v1/notes",
        body: {
          projectId,
          title,
          text,
          tag: tag ?? null,
        },
        entityType: "note",
        tempId: optimistic.id,
        projectId,
      });
    },
    [notes, persistNotes, projectId, userId]
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
        return;
      }

      enqueueOperation({
        id: crypto.randomUUID(),
        method: "PUT",
        url: `/api/v1/notes/${id}`,
        body: input,
        entityType: "note",
        projectId,
      });
    },
    [notes, persistNotes, projectId]
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
        projectId,
      });
    },
    [notes, persistNotes, projectId]
  );

  const getNote = useCallback(
    (id: string) => {
      return notes.find((note) => note.id === id);
    },
    [notes]
  );

  const refreshNotes = useCallback(async () => {
    if (!userId) {
      return;
    }

    setLoading(true);
    await hydrateFromApi(userId);
    setLoading(false);
  }, [hydrateFromApi, userId]);

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
