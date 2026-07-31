import { DefaultOptions, QueryClient } from '@tanstack/react-query'
import { hashFn } from 'wagmi/query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: true,
      staleTime: 0,
      gcTime: 1_000 * 60 * 60 * 24,
      queryKeyHashFn: hashFn,
      // Don't pause on the browser's unreliable navigator.onLine (false on many VPNs /
      // captive portals / flaky mobile). Rely on actual fetch results: a request runs,
      // and on failure retries then errors — instead of sitting 'paused'/pending
      // forever, which our useQuery wrapper renders as an eternal loading spinner.
      networkMode: 'always',
      retry: (failureCount, error) => {
        if (error?.message?.includes('Cannot decode zero data')) return false
        return failureCount < 3
      },
      throwOnError: false,
    },
  },
})

export const refetchOptions: DefaultOptions<Error> = {
  queries: {
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60,
    networkMode: 'always',
    staleTime: 0,
    meta: {
      isRefetchQuery: true,
    },
    refetchOnMount: true,
    queryKeyHashFn: hashFn,
  },
}

export const queryClientWithRefetch = new QueryClient({
  queryCache: queryClient.getQueryCache(),
  defaultOptions: refetchOptions,
  mutationCache: queryClient.getMutationCache(),
})
