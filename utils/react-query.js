'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// configure the QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,  
    },
  },
});

export default function QueryClientProviders({children}) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
