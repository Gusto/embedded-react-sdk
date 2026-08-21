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
 * React context backing {@link useUnstableFeature}.
 *
 * @internal
 */
export const UnstableFeaturesContext = createContext<UnstableFeatures>({})

/**
 * Reads whether `feature` is enabled via {@link GustoProvider}'s `unstableFeatures` prop.
 *
 * @remarks
 * With `throwIfDisabled: true`, call unconditionally at the top of an alpha component's body —
 * not inside {@link WithUnstableFeature} — so mounting the component without opting in fails
 * loudly and immediately. This throws in every environment, including production: using an alpha
 * component without its flag is an integration mistake, not a runtime state, the same as
 * {@link useComponentContext} throwing when called outside a `ComponentsProvider`.
 *
 * @param feature - The {@link UnstableFeatures} flag to read.
 * @param options - Set `throwIfDisabled` to throw instead of returning `false` when `feature` is disabled.
 * @throws When `options.throwIfDisabled` is set and `feature` is not enabled.
 * @internal
 */
export const useUnstableFeature = (
  feature: keyof UnstableFeatures,
  options: { throwIfDisabled?: boolean } = { throwIfDisabled: false },
): boolean => {
  const features = useContext(UnstableFeaturesContext)
  const isEnabled = !!features[feature]

  if (options.throwIfDisabled && !isEnabled) {
    throw new Error(
      `This component requires the unstable feature flag "${feature}" to be enabled via GustoProvider's \`unstableFeatures\` prop.`,
    )
  }

  return isEnabled
}
