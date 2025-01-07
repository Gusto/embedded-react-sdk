import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createContext, useContext } from 'react'
import { GustoClient } from './client'
import { ApiError } from './queries/helpers'

const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const apiError = error as ApiError
        if (failureCount >= 3) return false
        // 4xx errors (excecpt for 429) are unlikely to be fixed by retrying
        if (
          apiError.statusCode &&
          400 <= apiError.statusCode &&
          apiError.statusCode <= 499 &&
          apiError.statusCode !== 429
        ) {
          return false
        } else {
          return true
        }
      },
    },
  },
})

type GustoApiContextType = {
  GustoClient: GustoClient
}

const GustoApiContext = createContext<GustoApiContextType | null>(null)

export function GustoApiContextProvider({
  children,
  context,
  queryClient = defaultQueryClient,
}: {
  context: { GustoClient: GustoClient }
  queryClient?: QueryClient
  children: React.ReactNode
}) {
  return (
    <GustoApiContext.Provider value={context}>
      <QueryClientProvider client={queryClient}>
        {children} <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </GustoApiContext.Provider>
  )
}

export const useGustoApi = () => {
  const context = useContext(GustoApiContext)
  if (!context) throw Error('useGustoApi can only be used inside GustoApiProvider.')
  return context
}

export { defaultQueryClient as queryClient }
