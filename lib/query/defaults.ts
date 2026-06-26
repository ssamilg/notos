export const SESSION_STALE_MS = 1000 * 60 * 30;

export const sessionQueryOptions = {
  staleTime: SESSION_STALE_MS,
  gcTime: SESSION_STALE_MS * 2,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
} as const;
