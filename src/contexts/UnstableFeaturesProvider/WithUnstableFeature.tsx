import type { ReactNode } from 'react'
import { useUnstableFeatures, type UnstableFeatures } from './useUnstableFeatures'

/** @internal */
export interface WithUnstableFeatureProps {
  feature: keyof UnstableFeatures
  children: ReactNode
}

/**
 * Renders `children` only when `feature` is enabled in {@link UnstableFeatures}.
 *
 * @param props - See {@link WithUnstableFeatureProps}.
 * @returns `children` when the flag is enabled, otherwise `null`.
 * @internal
 */
export function WithUnstableFeature({ feature, children }: WithUnstableFeatureProps) {
  const unstableFeatures = useUnstableFeatures()
  return unstableFeatures[feature] ? children : null
}
