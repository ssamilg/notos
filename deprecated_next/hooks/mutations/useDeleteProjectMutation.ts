import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProjectWithCount } from "@/data/projects";
import { cancelQuery, rollbackQuery, showMutationError } from "@/lib/query/optimistic";
import { syncQueriesWithApi } from "@/lib/query/mutationSync";
import { queryKeys } from "@/lib/query/keys";
import { apiFetch } from "@/utils/api/client";

type DeleteProjectInput = {
  id: string;
};

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteProjectInput) =>
      apiFetch<ProjectWithCount>(`/api/v1/projects/${input.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleted_at: new Date().toISOString() }),
      }),
    onMutate: async (input) => {
      const previous = await cancelQuery<ProjectWithCount[]>(queryClient, queryKeys.projects);

      queryClient.setQueryData<ProjectWithCount[]>(queryKeys.projects, (current) =>
        (current ?? []).filter((project) => project.id !== input.id)
      );

      return { previous };
    },
    onError: (error, _input, context) => {
      rollbackQuery(queryClient, queryKeys.projects, context?.previous);
      showMutationError(error, "Failed to delete project");
    },
    onSettled: () => {
      syncQueriesWithApi(queryClient, queryKeys.projects);
    },
  });
}
