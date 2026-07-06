import type { QueryClient, QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiRequestError } from '@/lib/apiClient';

export type OptimisticContext<T> = {
  previous: T | undefined;
};

export async function cancelQuery<T>(queryClient: QueryClient, queryKey: QueryKey) {
  await queryClient.cancelQueries({ queryKey });
  return queryClient.getQueryData<T>(queryKey);
}

export function rollbackQuery<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  previous: T | undefined
) {
  if (previous !== undefined) {
    queryClient.setQueryData(queryKey, previous);
  }
}

export function showMutationError(error: unknown, fallbackMessage: string) {
  let message = fallbackMessage;

  if (error instanceof ApiRequestError) {
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  toast.error(message);
}
