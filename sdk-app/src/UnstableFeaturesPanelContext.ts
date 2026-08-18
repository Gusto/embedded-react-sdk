import { createContext, useContext, useState } from 'react'
import { UNSTABLE_FEATURES_VALUES } from './generated-registry-data'
import type { UnstableFeatures } from '@/contexts/UnstableFeaturesProvider/useUnstableFeatures'

export const UNSTABLE_FEATURE_KEYS = Object.keys(
  UNSTABLE_FEATURES_VALUES,
) as (keyof UnstableFeatures)[]

export interface UnstableFeaturesPanelContextValue {
  unstableFeatures: UnstableFeatures
  setUnstableFeature: (key: keyof UnstableFeatures, enabled: boolean) => void
}

export const UnstableFeaturesPanelContext = createContext<UnstableFeaturesPanelContextValue>({
  unstableFeatures: {},
  setUnstableFeature: () => {},
})

export const useUnstableFeaturesPanel = () => useContext(UnstableFeaturesPanelContext)

export function useUnstableFeaturesPanelState(): UnstableFeaturesPanelContextValue {
  const [unstableFeatures, setUnstableFeatures] =
    useState<UnstableFeatures>(UNSTABLE_FEATURES_VALUES)

  const setUnstableFeature = (key: keyof UnstableFeatures, enabled: boolean) => {
    setUnstableFeatures(prev => ({ ...prev, [key]: enabled }))
  }

  return { unstableFeatures, setUnstableFeature }
}
