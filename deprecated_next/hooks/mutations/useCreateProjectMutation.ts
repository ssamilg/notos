import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProjectWithCount } from "@/data/projects";
import { cancelQuery, rollbackQuery, showMutationError } from "@/lib/query/optimistic";
import { syncQueriesWithApi } from "@/lib/query/mutationSync";
import { queryKeys } from "@/lib/query/keys";
import { apiFetch } from "@/utils/api/client";

type CreateProjectInput = {
  id: string;
  name: string;
};

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      apiFetch<ProjectWithCount>("/api/v1/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onMutate: async (input) => {
      const previous = await cancelQuery<ProjectWithCount[]>(queryClient, queryKeys.projects);
      const now = new Date().toISOString();
      const optimistic: ProjectWithCount = {
        id: input.id,
        user_id: "",
        name: input.name,
        created_at: now,
        updated_at: now,
        deleted_at: null,
        note_count: 0,
      };

      queryClient.setQueryData<ProjectWithCount[]>(queryKeys.projects, (current) => [
        optimistic,
        ...(current ?? []),
      ]);

      return { previous };
    },
    onError: (error, _input, context) => {
      rollbackQuery(queryClient, queryKeys.projects, context?.previous);
      showMutationError(error, "Failed to create project");
    },
    onSuccess: (serverProject, input) => {
      queryClient.setQueryData<ProjectWithCount[]>(queryKeys.projects, (current) =>
        (current ?? []).map((project) => (project.id === input.id ? serverProject : project))
      );
    },
    onSettled: () => {
      syncQueriesWithApi(queryClient, queryKeys.projects);
    },
  });
}
