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
  hasCachedNotes,
  hasFetchedNotes,
  markNotesFetched,
  resolveUserId,
  setCachedNotes,
} from "@/lib/cache/clientCache";
import { readNotes, writeNotes } from "@/lib/storage/indexedDb";
import {
  addSyncListener,
  enqueueOperation,
  removeSyncListener,
  retryFailedOperations,
} from "@/lib/sync/queue";
import { apiFetch } from "@/utils/api/client";

type NoteInput = {
  title?: string;
  text?: string;
  tag?: string | null;
};

type NoteState = {
  notes: Note[];
  loading: boolean;
  ready: boolean;
  error: string | null;
  pendingSync: number;
  failedSync: number;
  createDraftNote: () => string | undefined;
  saveDraftNote: (id: string, input: NoteInput) => void;
  cancelDraftNote: (id: string) => void;
  isDraftNote: (id: string) => boolean;
  updateNote: (id: string, input: NoteInput) => void;
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
  const [draftNotes, setDraftNotes] = useState<Record<string, Note>>({});
  const [loading, setLoading] = useState(!cachedNotes);
  const [ready, setReady] = useState(() => hasCachedNotes(projectId));
  const [error, setError] = useState<string | null>(null);
  const [pendingSync, setPendingSync] = useState(0);
  const [failedSync, setFailedSync] = useState(0);
  const userIdRef = useRef<string | null>(null);
  const projectIdRef = useRef(projectId);

  const persistNotes = useCallback(async (nextNotes: Note[]) => {
    setNotes(nextNotes);
    setCachedNotes(projectIdRef.current, nextNotes);

    if (userIdRef.current) {
      await writeNotes(userIdRef.current, projectIdRef.current, nextNotes);
    }
  }, []);

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
          setReady(true);
          return;
        }
      }

      const idbCached = (await readNotes(currentUserId, currentProjectId)) as Note[];

      if (idbCached.length > 0) {
        setNotes(idbCached);
        setCachedNotes(currentProjectId, idbCached);
        setLoading(false);

        if (!forceRemote && hasFetchedNotes(currentProjectId)) {
          setReady(true);
          return;
        }
      }

      if (!forceRemote && hasFetchedNotes(currentProjectId)) {
        setLoading(false);
        setReady(true);
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
        setReady(true);
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
        setReady(true);
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

  const createDraftNote = useCallback(() => {
    const currentUserId = userIdRef.current;

    if (!currentUserId) {
      return undefined;
    }

    const draft = createTempNote(projectIdRef.current, currentUserId, "Untitled", "", null);

    setDraftNotes((current) => ({
      ...current,
      [draft.id]: draft,
    }));

    return draft.id;
  }, []);

  const saveDraftNote = useCallback(
    (id: string, input: NoteInput) => {
      const draft = draftNotes[id];

      if (!draft) {
        return;
      }

      const saved: Note = {
        ...draft,
        title: input.title ?? draft.title,
        text: input.text ?? draft.text,
        tag: input.tag !== undefined ? input.tag : draft.tag,
        updated_at: new Date().toISOString(),
      };

      setDraftNotes((current) => {
        const nextDrafts = { ...current };
        delete nextDrafts[id];
        return nextDrafts;
      });

      const next = [saved, ...notes];
      void persistNotes(next);

      enqueueOperation({
        id: crypto.randomUUID(),
        method: "POST",
        url: "/api/v1/notes",
        body: {
          projectId: projectIdRef.current,
          title: saved.title,
          text: saved.text,
          tag: saved.tag,
        },
        entityType: "note",
        tempId: saved.id,
        projectId: projectIdRef.current,
      });
    },
    [draftNotes, notes, persistNotes]
  );

  const cancelDraftNote = useCallback((id: string) => {
    setDraftNotes((current) => {
      if (!current[id]) {
        return current;
      }

      const nextDrafts = { ...current };
      delete nextDrafts[id];
      return nextDrafts;
    });
  }, []);

  const isDraftNote = useCallback(
    (id: string) => {
      return Boolean(draftNotes[id]);
    },
    [draftNotes]
  );

  const updateNote = useCallback(
    (id: string, input: NoteInput) => {
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
      if (draftNotes[id]) {
        cancelDraftNote(id);
        return;
      }

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
    [cancelDraftNote, draftNotes, notes, persistNotes]
  );

  const getNote = useCallback(
    (id: string) => {
      if (draftNotes[id]) {
        return draftNotes[id];
      }

      return notes.find((note) => note.id === id);
    },
    [draftNotes, notes]
  );

  const refreshNotes = useCallback(async () => {
    if (!userIdRef.current) {
      return;
    }

    setLoading(true);
    setReady(false);
    await hydrateNotes(userIdRef.current, projectIdRef.current, true);
  }, [hydrateNotes]);

  const value = useMemo(
    () => ({
      notes,
      loading,
      ready,
      error,
      pendingSync,
      failedSync,
      createDraftNote,
      saveDraftNote,
      cancelDraftNote,
      isDraftNote,
      updateNote,
      deleteNote,
      getNote,
      refreshNotes,
      retrySync: retryFailedOperations,
    }),
    [
      notes,
      loading,
      ready,
      error,
      pendingSync,
      failedSync,
      createDraftNote,
      saveDraftNote,
      cancelDraftNote,
      isDraftNote,
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
