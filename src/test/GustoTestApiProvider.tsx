import type { QueryClient } from '@tanstack/react-query'
import { GustoProvider } from '@/contexts'
import { createSdkQueryClient } from '@/contexts/ApiProvider/createSdkQueryClient'
import { API_BASE_URL } from '@/test/constants'

interface GustoTestProviderProps {
  children: React.ReactNode
  queryClient?: QueryClient
  readOnly?: boolean
}

export const GustoTestProvider = ({
  children,
  queryClient: queryClientFromProps,
  readOnly = false,
}: GustoTestProviderProps) => {
  const queryClient = queryClientFromProps ?? createSdkQueryClient()

  return (
    <GustoProvider queryClient={queryClient} config={{ baseUrl: API_BASE_URL }} readOnly={readOnly}>
      {children}
    </GustoProvider>
  )
}
