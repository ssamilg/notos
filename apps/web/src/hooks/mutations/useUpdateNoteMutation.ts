import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Note } from "@/types/domain";
import { showMutationError } from "@/lib/query/optimistic";
import { setNoteInCache, updateNoteInCache, reorderNotesInCache } from "@/lib/query/noteCache";
import { queryKeys } from "@/lib/query/keys";
import {
  restoreNotesQueries,
  snapshotNotesQueries,
} from "@/hooks/queries/useNoteFromCache";
import { apiFetch } from "@/lib/apiClient";

type UpdateNoteInput = {
  projectId: string;
  id: string;
  title?: string;
  text?: string;
  tags?: string[];
  is_completed?: boolean;
};

function isCompleteOnlyUpdate(input: UpdateNoteInput) {
  return (
    input.is_completed !== undefined &&
    input.title === undefined &&
    input.text === undefined &&
    input.tags === undefined
  );
}

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
      const completeOnly = isCompleteOnlyUpdate(input);

      updateNoteInCache(queryClient, input.projectId, input.id, (note) => {
        let updatedAt = note.updated_at;

        if (!completeOnly) {
          updatedAt = new Date().toISOString();
        } else if (input.is_completed === false) {
          updatedAt = new Date().toISOString();
        }

        return {
          ...note,
          title: input.title ?? note.title,
          text: input.text ?? note.text,
          tags: input.tags ?? note.tags,
          is_completed: input.is_completed ?? note.is_completed,
          updated_at: updatedAt,
        };
      });

      if (completeOnly && input.is_completed === false) {
        reorderNotesInCache(queryClient, input.projectId);
      }

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
      void queryClient.invalidateQueries({ queryKey: ["notes", input.projectId] });
    },
    onSettled: (_data, _error, input) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.note(input.id) });
    },
  });
}
