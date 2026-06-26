import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProjectWithCount } from "@/data/projects";
import { cancelQuery, rollbackQuery, showMutationError } from "@/lib/query/optimistic";
import { syncQueriesWithApi } from "@/lib/query/mutationSync";
import { queryKeys } from "@/lib/query/keys";
import { apiFetch } from "@/utils/api/client";

type UpdateProjectInput = {
  id: string;
  name: string;
};

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProjectInput) =>
      apiFetch<ProjectWithCount>(`/api/v1/projects/${input.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: input.name }),
      }),
    onMutate: async (input) => {
      const previous = await cancelQuery<ProjectWithCount[]>(queryClient, queryKeys.projects);

      queryClient.setQueryData<ProjectWithCount[]>(queryKeys.projects, (current) =>
        (current ?? []).map((project) => {
          if (project.id !== input.id) {
            return project;
          }

          return {
            ...project,
            name: input.name,
            updated_at: new Date().toISOString(),
          };
        })
      );

      return { previous };
    },
    onError: (error, _input, context) => {
      rollbackQuery(queryClient, queryKeys.projects, context?.previous);
      showMutationError(error, "Failed to update project");
    },
    onSuccess: (serverProject) => {
      queryClient.setQueryData<ProjectWithCount[]>(queryKeys.projects, (current) =>
        (current ?? []).map((project) => (project.id === serverProject.id ? serverProject : project))
      );
    },
    onSettled: () => {
      syncQueriesWithApi(queryClient, queryKeys.projects);
    },
  });
}
