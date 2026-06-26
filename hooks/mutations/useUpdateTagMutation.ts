import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TagWithCount } from "@/data/tags";
import { cancelQuery, rollbackQuery, showMutationError } from "@/lib/query/optimistic";
import { syncQueriesWithApi } from "@/lib/query/mutationSync";
import { queryKeys } from "@/lib/query/keys";
import { apiFetch } from "@/utils/api/client";

function sortTags(tags: TagWithCount[]): TagWithCount[] {
  return [...tags].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

type UpdateTagInput = {
  id: string;
  name: string;
};

export function useUpdateTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTagInput) =>
      apiFetch<TagWithCount>(`/api/v1/tags/${input.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: input.name }),
      }),
    onMutate: async (input) => {
      const previous = await cancelQuery<TagWithCount[]>(queryClient, queryKeys.tags);

      queryClient.setQueryData<TagWithCount[]>(queryKeys.tags, (current) =>
        sortTags(
          (current ?? []).map((tag) => {
            if (tag.id !== input.id) {
              return tag;
            }

            return {
              ...tag,
              name: input.name,
            };
          })
        )
      );

      return { previous };
    },
    onError: (error, _input, context) => {
      rollbackQuery(queryClient, queryKeys.tags, context?.previous);
      showMutationError(error, "Failed to update tag");
    },
    onSuccess: (serverTag) => {
      queryClient.setQueryData<TagWithCount[]>(queryKeys.tags, (current) =>
        sortTags(
          (current ?? []).map((tag) => (tag.id === serverTag.id ? serverTag : tag))
        )
      );
    },
    onSettled: () => {
      syncQueriesWithApi(queryClient, queryKeys.tags);
    },
  });
}
