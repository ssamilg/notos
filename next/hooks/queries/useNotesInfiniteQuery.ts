import { useInfiniteQuery } from "@tanstack/react-query";
import type { Note } from "@/data/notes";
import { sessionQueryOptions } from "@/lib/query/defaults";
import { queryKeys, type NoteFilters } from "@/lib/query/keys";
import { flattenNotesPages } from "@/lib/query/selectors/sortNotes";
import { apiFetchWithMeta } from "@/utils/api/client";

function buildNotesUrl(projectId: string, filters: NoteFilters, cursor?: string) {
  const params = new URLSearchParams({ projectId });

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.tagId) {
    params.set("tag_id", filters.tagId);
  }

  if (cursor) {
    params.set("cursor", cursor);
  }

  return `/api/v1/notes?${params.toString()}`;
}

export function useNotesInfiniteQuery(projectId: string, filters: NoteFilters) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.notes(projectId, filters),
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === "string" ? pageParam : undefined;
      const result = await apiFetchWithMeta<Note[]>(buildNotesUrl(projectId, filters, cursor));
      const nextCursor = result.meta?.nextCursor;

      return {
        notes: result.data,
        nextCursor: typeof nextCursor === "string" ? nextCursor : null,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(projectId),
    ...sessionQueryOptions,
  });

  const notes = query.data ? flattenNotesPages(query.data.pages.map((page) => page.notes)) : [];

  return {
    ...query,
    notes,
  };
}

export type NotesInfiniteData = {
  pages: Array<{ notes: Note[]; nextCursor: string | null }>;
  pageParams: Array<string | undefined>;
};
