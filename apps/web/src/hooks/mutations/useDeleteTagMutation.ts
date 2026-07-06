import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TagWithCount } from "@/types/domain";
import { cancelQuery, rollbackQuery, showMutationError } from "@/lib/query/optimistic";
import { syncQueriesWithApi } from "@/lib/query/mutationSync";
import { queryKeys } from "@/lib/query/keys";
import { apiFetch } from "@/lib/apiClient";

type DeleteTagInput = {
  id: string;
};

export function useDeleteTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteTagInput) =>
      apiFetch<TagWithCount>(`/api/v1/tags/${input.id}`, {
        method: "DELETE",
      }),
    onMutate: async (input) => {
      const previous = await cancelQuery<TagWithCount[]>(queryClient, queryKeys.tags);

      queryClient.setQueryData<TagWithCount[]>(queryKeys.tags, (current) =>
        (current ?? []).filter((tag) => tag.id !== input.id)
      );

      return { previous };
    },
    onError: (error, _input, context) => {
      rollbackQuery(queryClient, queryKeys.tags, context?.previous);
      showMutationError(error, "Failed to delete tag");
    },
    onSettled: () => {
      syncQueriesWithApi(queryClient, queryKeys.tags);
    },
  });
}
