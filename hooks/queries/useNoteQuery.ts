import { useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionQueryOptions } from "@/lib/query/defaults";
import { fetchNote } from "@/lib/query/fetchers";
import { queryKeys } from "@/lib/query/keys";
import { findNoteInListCache } from "@/hooks/queries/useNoteFromCache";

export function useNoteQuery(noteId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.note(noteId),
    queryFn: () => fetchNote(noteId),
    enabled: Boolean(noteId),
    placeholderData: () => findNoteInListCache(queryClient, noteId),
    ...sessionQueryOptions,
  });
}
