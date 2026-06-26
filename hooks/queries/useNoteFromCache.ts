import type { QueryClient } from "@tanstack/react-query";
import type { Note } from "@/data/notes";
import { queryKeys } from "@/lib/query/keys";
import type { NotesInfiniteData } from "@/hooks/queries/useNotesInfiniteQuery";

export function findNoteInListCache(queryClient: QueryClient, noteId: string): Note | undefined {
  const cached = queryClient.getQueryData<Note>(queryKeys.note(noteId));

  if (cached) {
    return cached;
  }

  const queries = queryClient.getQueriesData<NotesInfiniteData>({
    queryKey: ["notes"],
  });

  for (const [, data] of queries) {
    if (!data) {
      continue;
    }

    for (const page of data.pages) {
      const match = page.notes.find((note) => note.id === noteId);

      if (match) {
        return match;
      }
    }
  }

  return undefined;
}

export async function snapshotNotesQueries(queryClient: QueryClient, projectId: string) {
  const queries = queryClient.getQueriesData<NotesInfiniteData>({
    queryKey: ["notes", projectId],
  });

  return queries.map(([key, data]) => ({ key, data }));
}

export function restoreNotesQueries(
  queryClient: QueryClient,
  snapshots: Array<{ key: readonly unknown[]; data: NotesInfiniteData | undefined }>
) {
  for (const snapshot of snapshots) {
    queryClient.setQueryData(snapshot.key, snapshot.data);
  }
}
