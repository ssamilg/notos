import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get, set, del } from 'idb-keyval';
import { useState, type ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { sessionQueryOptions } from '@/lib/query/defaults';

type QueryProviderProps = {
  children: ReactNode;
};

const persister = createAsyncStoragePersister({
  storage: {
    getItem: async (key) => get(key),
    setItem: async (key, value) => set(key, value),
    removeItem: async (key) => del(key),
  },
});

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: sessionQueryOptions,
        },
      })
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: sessionQueryOptions.gcTime,
      }}
    >
      {children}
      <Toaster richColors closeButton position="bottom-center" />
    </PersistQueryClientProvider>
  );
}
