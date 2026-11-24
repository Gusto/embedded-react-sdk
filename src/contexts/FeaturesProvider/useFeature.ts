import { createContext, useContext } from 'react'

/**
 * Flags for turning released SDK functionality on or off.
 *
 * @remarks
 * Pass to {@link GustoProvider} via the `features` prop. Each flag documents its default and what
 * changes when you set it. Omitted flags use their default.
 *
 * @internal
 * @page providers
 */
export interface Features {
  /**
   * @defaultValue `true`
   * @internal
   */
  regularRateOfPay?: boolean
}

/**
 * React context backing {@link useFeature}.
 *
 * @internal
 */
export const FeaturesContext = createContext<Features>({})

/**
 * Reads whether `feature` is enabled via {@link GustoProvider}'s `features` prop.
 *
 * @remarks
 * Only an explicit `false` disables a flag, so omitting it — or rendering outside a
 * `GustoProvider` — leaves the functionality on.
 *
 * @param feature - The {@link Features} flag to read.
 * @returns `false` when `feature` is explicitly set to `false`, otherwise `true`.
 * @internal
 */
export const useFeature = (feature: keyof Features): boolean => {
  const features = useContext(FeaturesContext)
  return features[feature] !== false
}
