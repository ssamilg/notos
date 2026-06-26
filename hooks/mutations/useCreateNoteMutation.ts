import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Note } from "@/data/notes";
import type { NoteFilters } from "@/lib/query/keys";
import { queryKeys } from "@/lib/query/keys";
import { cancelQuery, rollbackQuery, showMutationError } from "@/lib/query/optimistic";
import { syncQueriesWithApi } from "@/lib/query/mutationSync";
import { prependNoteToCache, setNoteInCache, updateNoteInCache } from "@/lib/query/noteCache";
import type { NotesInfiniteData } from "@/hooks/queries/useNotesInfiniteQuery";
import { apiFetch } from "@/utils/api/client";

export type CreateNoteInput = {
  id: string;
  projectId: string;
  title: string;
  text: string;
  tags?: string[];
  is_completed?: boolean;
};

export function useCreateNoteMutation(projectId: string, filters: NoteFilters) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.notes(projectId, filters);

  return useMutation({
    mutationFn: (input: CreateNoteInput) =>
      apiFetch<Note>("/api/v1/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onMutate: async (input) => {
      const previous = await cancelQuery<NotesInfiniteData>(queryClient, queryKey);
      const now = new Date().toISOString();
      const optimistic: Note = {
        id: input.id,
        project_id: input.projectId,
        user_id: "",
        title: input.title,
        text: input.text,
        tags: input.tags ?? [],
        is_completed: input.is_completed ?? false,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };

      prependNoteToCache(queryClient, projectId, filters, optimistic);
      setNoteInCache(queryClient, optimistic);

      return { previous };
    },
    onError: (error, _input, context) => {
      rollbackQuery(queryClient, queryKey, context?.previous);
      showMutationError(error, "Failed to create note");
    },
    onSuccess: (serverNote, input) => {
      setNoteInCache(queryClient, serverNote);
      updateNoteInCache(queryClient, input.projectId, input.id, () => serverNote);
    },
    onSettled: (_data, _error, input) => {
      syncQueriesWithApi(queryClient, queryKeys.projects);
      syncQueriesWithApi(queryClient, ["notes", input.projectId]);
      syncQueriesWithApi(queryClient, queryKeys.note(input.id));
    },
  });
}
