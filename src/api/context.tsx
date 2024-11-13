import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { GustoClient } from './client'
import { queryClient } from './queryClient'
import { GustoApiContext } from './gustoApiContext'

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
