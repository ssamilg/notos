"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, type ReactNode } from "react";
import { sessionQueryOptions } from "@/lib/query/defaults";
import { fetchProjects, fetchTags } from "@/lib/query/fetchers";
import { queryKeys } from "@/lib/query/keys";

type DashboardBootstrapProps = {
  children: ReactNode;
};

export function DashboardBootstrap({ children }: DashboardBootstrapProps) {
  const queryClient = useQueryClient();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;

    void queryClient.prefetchQuery({
      queryKey: queryKeys.projects,
      queryFn: fetchProjects,
      ...sessionQueryOptions,
    });
    void queryClient.prefetchQuery({
      queryKey: queryKeys.tags,
      queryFn: fetchTags,
      ...sessionQueryOptions,
    });
  }, [queryClient]);

  return children;
}
