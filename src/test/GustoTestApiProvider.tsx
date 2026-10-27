import type { QueryClient } from '@tanstack/react-query'
import { GustoProvider } from '@/contexts'
import { createSdkQueryClient } from '@/contexts/ApiProvider/createSdkQueryClient'
import type { UnstableFeatures } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'
import type { Features } from '@/contexts/FeaturesProvider/useFeature'
import { API_BASE_URL } from '@/test/constants'

interface GustoTestProviderProps {
  children: React.ReactNode
  queryClient?: QueryClient
  features?: Features
  unstableFeatures?: UnstableFeatures
}

export const GustoTestProvider = ({
  children,
  queryClient: queryClientFromProps,
  features,
  unstableFeatures,
}: GustoTestProviderProps) => {
  const queryClient = queryClientFromProps ?? createSdkQueryClient()

  return (
    <GustoProvider
      queryClient={queryClient}
      config={{ baseUrl: API_BASE_URL }}
      features={features}
      unstableFeatures={unstableFeatures}
    >
      {children}
    </GustoProvider>
  )
}
