import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { GustoEmbedded } from '@gusto/embedded-api'
import { GustoEmbeddedProvider } from '@gusto/embedded-api/react-query'
import { createContext, useContext } from 'react'
import { GustoClient } from './client'

type GustoApiContextType = {
  GustoClient: GustoClient
}

const defaultGustoClient = new GustoEmbedded()
const GustoApiContext = createContext<GustoApiContextType | null>(null)

export function GustoApiContextProvider({
  children,
  context,
  gustoClient = defaultGustoClient,
}: {
  context: { GustoClient: GustoClient }
  gustoClient?: GustoEmbedded
  children: React.ReactNode
}) {
  const queryClient = new QueryClient()
  queryClient.setQueryDefaults(['@gusto/embedded-api'], { retry: false })
  queryClient.setMutationDefaults(['@gusto/embedded-api'], { retry: false })

  return (
    <GustoApiContext.Provider value={context}>
      <QueryClientProvider client={queryClient}>
        <GustoEmbeddedProvider client={gustoClient}>
          {children} <ReactQueryDevtools initialIsOpen={false} />
        </GustoEmbeddedProvider>
      </QueryClientProvider>
    </GustoApiContext.Provider>
  )
}

export const useGustoApi = () => {
  const context = useContext(GustoApiContext)
  if (!context) throw Error('useGustoApi can only be used inside GustoApiProvider.')
  return context
}
