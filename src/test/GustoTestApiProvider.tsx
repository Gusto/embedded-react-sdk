import { GustoApiProvider } from '@/contexts'
import { QueryClient } from '@tanstack/react-query'

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

  return <GustoApiProvider queryClient={queryClient}>{children}</GustoApiProvider>
}
