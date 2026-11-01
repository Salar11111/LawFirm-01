
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMemo } from 'react'

// Create a QueryClient instance with sensible defaults
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // For auth-related queries: staleTime: 30s
        // For data queries: staleTime: 2min (120s)
        // We'll set a default and override in specific queries if needed
        staleTime: 120 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

// Memoize the QueryClient to avoid creating a new instance on every render
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(createQueryClient, [])
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export { useQueryClient } from '@tanstack/react-query'

