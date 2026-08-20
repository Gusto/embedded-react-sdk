import type { QueryClient } from '@tanstack/react-query'
import { GustoProvider } from '@/contexts'
import { createSdkQueryClient } from '@/contexts/ApiProvider/createSdkQueryClient'
import type { UnstableFeatures } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
import { API_BASE_URL } from '@/test/constants'

interface GustoTestProviderProps {
  children: React.ReactNode
  queryClient?: QueryClient
  unstableFeatures?: UnstableFeatures
}

export const GustoTestProvider = ({
  children,
  queryClient: queryClientFromProps,
  unstableFeatures,
}: GustoTestProviderProps) => {
  const queryClient = queryClientFromProps ?? createSdkQueryClient()

  return (
    <GustoProvider
      queryClient={queryClient}
      config={{ baseUrl: API_BASE_URL }}
      unstableFeatures={unstableFeatures}
    >
      {children}
    </GustoProvider>
  )
}
