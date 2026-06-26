import { useQuery } from "@tanstack/react-query";
import { sessionQueryOptions } from "@/lib/query/defaults";
import { fetchProjects } from "@/lib/query/fetchers";
import { queryKeys } from "@/lib/query/keys";

export function useProjectsQuery() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: fetchProjects,
    ...sessionQueryOptions,
  });
}
