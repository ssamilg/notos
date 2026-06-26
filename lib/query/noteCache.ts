import type { QueryClient } from "@tanstack/react-query";
import type { Note } from "@/data/notes";
import type { NoteFilters } from "@/lib/query/keys";
import { queryKeys } from "@/lib/query/keys";
import type { NotesInfiniteData } from "@/hooks/queries/useNotesInfiniteQuery";
import { sortNotes } from "@/lib/query/selectors/sortNotes";

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
      notes: sortNotes([note, ...firstPage.notes]),
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
      notes: sortNotes(
        page.notes.map((note) => {
          if (note.id !== noteId) {
            return note;
          }

          return updater(note);
        })
      ),
    }));

    queryClient.setQueryData(key, {
      ...data,
      pages,
    });
  }
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
