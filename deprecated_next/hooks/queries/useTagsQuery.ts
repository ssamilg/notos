import { useQuery } from "@tanstack/react-query";
import { sessionQueryOptions } from "@/lib/query/defaults";
import { fetchTags } from "@/lib/query/fetchers";
import { queryKeys } from "@/lib/query/keys";

export function useTagsQuery() {
  return useQuery({
    queryKey: queryKeys.tags,
    queryFn: fetchTags,
    ...sessionQueryOptions,
  });
}
