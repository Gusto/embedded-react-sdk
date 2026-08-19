import { createContext, useContext } from 'react'

/**
 * Opt-in flags for SDK functionality that is still in active development.
 *
 * @remarks
 * Pass to {@link GustoProvider} via the `unstableFeatures` prop to enable a feature ahead of its
 * public release. Every flag defaults to disabled when omitted. When a feature graduates to
 * public release, its flag is deleted from this interface along with the conditional checks that
 * read it — there is no deprecation step. This interface may have no flags at all at any given
 * time — e.g. immediately after the last active flag graduates and before the next one is added —
 * the opt-in mechanism itself is permanent even when nothing is currently gated behind it.
 *
 * @alpha
 */
export interface UnstableFeatures {
  /** Enables recording past payments to contractors within the `ContractorManagement` flows. */
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

/**
 * Asserts that every flag in `features` is enabled, throwing if any is not.
 *
 * @remarks
 * Call unconditionally at the top of an alpha component's body — not inside
 * {@link WithUnstableFeature} — so mounting the component without opting in via
 * {@link GustoProvider}'s `unstableFeatures` prop fails loudly and immediately. This throws in
 * every environment, including production: using an alpha component without its flag is an
 * integration mistake, not a runtime state, the same as {@link useComponentContext} throwing when
 * called outside a `ComponentsProvider`.
 *
 * @param features - The {@link UnstableFeatures} flags the calling component requires, as individual arguments.
 * @throws When any flag in `features` is not enabled.
 * @internal
 */
export function useRequiredUnstableFeatures(...features: (keyof UnstableFeatures)[]): void {
  const unstableFeatures = useUnstableFeatures()
  const missing = features.filter(feature => !unstableFeatures[feature])

  if (missing.length > 0) {
    throw new Error(
      `This component requires the following unstable feature flag(s) to be enabled via GustoProvider's \`unstableFeatures\` prop: ${missing.join(', ')}.`,
    )
  }
}
