import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TagWithCount } from "@/data/tags";
import { cancelQuery, rollbackQuery, showMutationError } from "@/lib/query/optimistic";
import { syncQueriesWithApi } from "@/lib/query/mutationSync";
import { queryKeys } from "@/lib/query/keys";
import { apiFetch } from "@/utils/api/client";

function sortTags(tags: TagWithCount[]): TagWithCount[] {
  return [...tags].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

type CreateTagInput = {
  name: string;
};

export function useCreateTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTagInput) =>
      apiFetch<TagWithCount>("/api/v1/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onMutate: async (input) => {
      const previous = await cancelQuery<TagWithCount[]>(queryClient, queryKeys.tags);
      const optimisticId = crypto.randomUUID();
      const optimistic: TagWithCount = {
        id: optimisticId,
        name: input.name,
        note_count: 0,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<TagWithCount[]>(queryKeys.tags, (current) =>
        sortTags([optimistic, ...(current ?? [])])
      );

      return { previous, optimisticId };
    },
    onError: (error, _input, context) => {
      rollbackQuery(queryClient, queryKeys.tags, context?.previous);
      showMutationError(error, "Failed to create tag");
    },
    onSuccess: (serverTag, _input, context) => {
      const optimisticId = context?.optimisticId;

      if (!optimisticId) {
        return;
      }

      queryClient.setQueryData<TagWithCount[]>(queryKeys.tags, (current) =>
        sortTags(
          (current ?? []).map((tag) => (tag.id === optimisticId ? serverTag : tag))
        )
      );
    },
    onSettled: () => {
      syncQueriesWithApi(queryClient, queryKeys.tags);
    },
  });
}
