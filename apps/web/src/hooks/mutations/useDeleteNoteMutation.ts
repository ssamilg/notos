import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Note } from "@/types/domain";
import { showMutationError } from "@/lib/query/optimistic";
import { syncQueriesWithApi } from "@/lib/query/mutationSync";
import { queryKeys } from "@/lib/query/keys";
import { removeNoteFromCache } from "@/lib/query/noteCache";
import {
  restoreNotesQueries,
  snapshotNotesQueries,
} from "@/hooks/queries/useNoteFromCache";
import { apiFetch } from "@/lib/apiClient";

type DeleteNoteInput = {
  projectId: string;
  id: string;
};

export function useDeleteNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteNoteInput) =>
      apiFetch<Note>(`/api/v1/notes/${input.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleted_at: new Date().toISOString() }),
      }),
    onMutate: async (input) => {
      const previous = await snapshotNotesQueries(queryClient, input.projectId);
      removeNoteFromCache(queryClient, input.projectId, input.id);

      return { previous };
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        restoreNotesQueries(queryClient, context.previous);
      }

      showMutationError(error, "Failed to delete note");
    },
    onSettled: (_data, _error, input) => {
      queryClient.removeQueries({ queryKey: queryKeys.note(input.id) });
      syncQueriesWithApi(queryClient, queryKeys.projects);
      syncQueriesWithApi(queryClient, ["notes", input.projectId]);
    },
  });
}
