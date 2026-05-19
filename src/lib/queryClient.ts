import { QueryClient } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME.default,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
