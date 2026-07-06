import type { QueryClient } from "@tanstack/react-query";
import type { Note } from '@/types/domain';
import type { NoteFilters } from "@/lib/query/keys";
import { queryKeys } from "@/lib/query/keys";
import type { NotesInfiniteData } from "@/hooks/queries/useNotesInfiniteQuery";
import { sortNotes } from "@/lib/query/selectors/sortNotes";
import { blurActiveElement } from "@/utils/blurActiveElement";

export function setNoteInCache(queryClient: QueryClient, note: Note) {
  queryClient.setQueryData(queryKeys.note(note.id), note);
}

export function prependNoteToCache(
  queryClient: QueryClient,
  projectId: string,
  filters: NoteFilters,
  note: Note
) {
  const key = queryKeys.notes(projectId, filters);

  queryClient.setQueryData<NotesInfiniteData>(key, (current) => {
    if (!current) {
      return {
        pages: [{ notes: [note], nextCursor: null }],
        pageParams: [undefined],
      };
    }

    const pages = [...current.pages];
    const firstPage = pages[0] ?? { notes: [], nextCursor: null };
    pages[0] = {
      ...firstPage,
      notes: [note, ...firstPage.notes],
    };

    return {
      ...current,
      pages,
    };
  });
}

export function updateNoteInCache(
  queryClient: QueryClient,
  projectId: string,
  noteId: string,
  updater: (note: Note) => Note
) {
  const queries = queryClient.getQueriesData<NotesInfiniteData>({
    queryKey: ["notes", projectId],
  });

  for (const [key, data] of queries) {
    if (!data) {
      continue;
    }

    const pages = data.pages.map((page) => ({
      ...page,
      notes: page.notes.map((note) => {
        if (note.id !== noteId) {
          return note;
        }

        return updater(note);
      }),
    }));

    queryClient.setQueryData(key, {
      ...data,
      pages,
    });
  }
}

export function reorderNotesInCache(queryClient: QueryClient, projectId: string) {
  const queries = queryClient.getQueriesData<NotesInfiniteData>({
    queryKey: ["notes", projectId],
  });

  for (const [key, data] of queries) {
    if (!data || data.pages.length === 0) {
      continue;
    }

    const pageLengths = data.pages.map((page) => page.notes.length);
    const sorted = sortNotes(data.pages.flatMap((page) => page.notes));
    let offset = 0;

    const pages = data.pages.map((page, index) => {
      const count = pageLengths[index] ?? 0;
      const notes = sorted.slice(offset, offset + count);
      offset += count;

      return {
        ...page,
        notes,
      };
    });

    queryClient.setQueryData(key, {
      ...data,
      pages,
    });
  }
}

export function finalizeNoteListReorder(queryClient: QueryClient, projectId: string) {
  reorderNotesInCache(queryClient, projectId);
  blurActiveElement();
}

export function removeNoteFromCache(queryClient: QueryClient, projectId: string, noteId: string) {
  const queries = queryClient.getQueriesData<NotesInfiniteData>({
    queryKey: ["notes", projectId],
  });

  for (const [key, data] of queries) {
    if (!data) {
      continue;
    }

    const pages = data.pages.map((page) => ({
      ...page,
      notes: page.notes.filter((note) => note.id !== noteId),
    }));

    queryClient.setQueryData(key, {
      ...data,
      pages,
    });
  }
}
