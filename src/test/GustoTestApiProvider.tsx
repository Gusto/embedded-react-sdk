import { QueryClient } from '@tanstack/react-query'
import { GustoProvider } from '@/contexts'
import { API_BASE_URL } from '@/test/constants'

interface GustoTestProviderProps {
  children: React.ReactNode
  queryClient?: QueryClient
}

export const GustoTestProvider = ({
  children,
  queryClient: queryClientFromProps,
}: GustoTestProviderProps) => {
  let queryClient = queryClientFromProps

  if (!queryClientFromProps) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  }

  return (
    <GustoProvider queryClient={queryClient} config={{ baseUrl: API_BASE_URL }}>
      {children}
    </GustoProvider>
  )
}
