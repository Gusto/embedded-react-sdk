import { createContext, useContext } from 'react'

/**
 * Opt-in flags for SDK functionality that is still in active development.
 *
 * @remarks
 * Pass to {@link GustoProvider} via the `unstableFeatures` prop to enable a feature ahead of its
 * public release. Every flag defaults to disabled when omitted. When a feature graduates to
 * public release, its flag is deleted from this interface along with the conditional checks that
 * read it — there is no deprecation step.
 *
 * @alpha
 */
export interface UnstableFeatures {
  /**
   * Enables `HistoricalPaymentFlow` within `ContractorManagement.PaymentFlow`,
   * which allows users to record payments made to contractors outside of Gusto.
   */
  historicalPayments?: boolean
}

/**
 * React context backing {@link useUnstableFeatures}.
 *
 * @internal
 */
export const UnstableFeaturesContext = createContext<UnstableFeatures>({})

/**
 * Reads the {@link UnstableFeatures} flags supplied to {@link GustoProvider}.
 *
 * @returns The active {@link UnstableFeatures} map, or `{}` when {@link GustoProvider} was not given one.
 * @internal
 */
export const useUnstableFeatures = (): UnstableFeatures => useContext(UnstableFeaturesContext)
