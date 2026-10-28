import { createContext, useContext, useState } from 'react'
import { FEATURES_VALUES } from './generated-registry-data'
import type { Features } from '@/contexts/FeaturesProvider/useFeature'

export const FEATURE_KEYS = Object.keys(FEATURES_VALUES) as (keyof Features)[]

export interface FeaturesPanelContextValue {
  features: Features
  setFeature: (key: keyof Features, enabled: boolean) => void
}

export const FeaturesPanelContext = createContext<FeaturesPanelContextValue>({
  features: {},
  setFeature: () => {},
})

export const useFeaturesPanel = () => useContext(FeaturesPanelContext)

export function useFeaturesPanelState(): FeaturesPanelContextValue {
  const [features, setFeatures] = useState<Features>(FEATURES_VALUES)

  const setFeature = (key: keyof Features, enabled: boolean) => {
    setFeatures(prev => ({ ...prev, [key]: enabled }))
  }

  return { features, setFeature }
}
