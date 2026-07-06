import type { QueryClient, QueryKey } from "@tanstack/react-query";

export function syncQueriesWithApi(queryClient: QueryClient, queryKey: QueryKey) {
  void queryClient.invalidateQueries({ queryKey });
}
