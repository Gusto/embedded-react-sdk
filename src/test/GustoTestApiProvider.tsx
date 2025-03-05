import { QueryClient } from '@tanstack/react-query'
import { GustoApiProvider } from '@/contexts'
import { API_BASE_URL } from '@/api/constants'

interface GustoTestApiProviderProps {
  children: React.ReactNode
  queryClient?: QueryClient
}

export const GustoTestApiProvider = ({
  children,
  queryClient: queryClientFromProps,
}: GustoTestApiProviderProps) => {
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
    <GustoApiProvider queryClient={queryClient} config={{ baseUrl: API_BASE_URL }}>
      {children}
    </GustoApiProvider>
  )
}
