import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Note } from "@/data/notes";
import { showMutationError } from "@/lib/query/optimistic";
import { syncQueriesWithApi } from "@/lib/query/mutationSync";
import { setNoteInCache, updateNoteInCache } from "@/lib/query/noteCache";
import { queryKeys } from "@/lib/query/keys";
import {
  restoreNotesQueries,
  snapshotNotesQueries,
} from "@/hooks/queries/useNoteFromCache";
import { apiFetch } from "@/utils/api/client";

type UpdateNoteInput = {
  projectId: string;
  id: string;
  title?: string;
  text?: string;
  tags?: string[];
  is_completed?: boolean;
};

export function useUpdateNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateNoteInput) => {
      const body: Record<string, unknown> = {};

      if (input.title !== undefined) {
        body.title = input.title;
      }

      if (input.text !== undefined) {
        body.text = input.text;
      }

      if (input.tags !== undefined) {
        body.tags = input.tags;
      }

      if (input.is_completed !== undefined) {
        body.is_completed = input.is_completed;
      }

      return apiFetch<Note>(`/api/v1/notes/${input.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["notes", input.projectId] });
      const previous = await snapshotNotesQueries(queryClient, input.projectId);

      updateNoteInCache(queryClient, input.projectId, input.id, (note) => ({
        ...note,
        title: input.title ?? note.title,
        text: input.text ?? note.text,
        tags: input.tags ?? note.tags,
        is_completed: input.is_completed ?? note.is_completed,
        updated_at: new Date().toISOString(),
      }));

      return { previous };
    },
    onError: (error, input, context) => {
      if (context?.previous) {
        restoreNotesQueries(queryClient, context.previous);
      }

      showMutationError(error, "Failed to update note");
    },
    onSuccess: (serverNote, input) => {
      setNoteInCache(queryClient, serverNote);
      updateNoteInCache(queryClient, input.projectId, input.id, () => serverNote);
    },
    onSettled: (_data, _error, input) => {
      syncQueriesWithApi(queryClient, queryKeys.note(input.id));
      syncQueriesWithApi(queryClient, ["notes", input.projectId]);
    },
  });
}
