import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createContext, useContext } from 'react'
import { GustoClient } from './client'
import { ApiError } from './queries/helpers'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: ApiError) => {
        if (failureCount >= 3) return false
        // 4xx errors (excecpt for 429) are unlikely to be fixed by retrying
        if (
          error.statusCode &&
          400 <= error.statusCode &&
          error.statusCode <= 499 &&
          error.statusCode !== 429
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
}: {
  context: { GustoClient: GustoClient }
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
