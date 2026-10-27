import { createContext, useContext } from 'react'

/**
 * Opt-out flags for released SDK functionality.
 *
 * @remarks
 * Pass to {@link GustoProvider} via the `features` prop. Every flag defaults to enabled when
 * omitted; set a flag to `false` to opt out and keep the behavior that preceded it. The
 * functionality behind each flag is ready for production use. Flags are temporary: each one is
 * removed in a future release, after which its functionality can no longer be turned off.
 *
 * @public
 * @page providers
 */
export interface Features {
  /**
   * Enables the regular-rate-of-pay experience: per-workweek hours and earnings editing in
   * `PayrollEditEmployee`, gross pay from the payroll calculation in `PayrollConfiguration`, and
   * the workweek start day field on `PaySchedule` that overtime calculations depend on. Defaults
   * to `true`.
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
