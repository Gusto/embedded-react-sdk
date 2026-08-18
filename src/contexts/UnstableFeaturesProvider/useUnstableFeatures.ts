import { createContext, useContext } from 'react'

/* eslint-disable @typescript-eslint/no-empty-object-type -- may have no active flags at any given time; see @remarks below */
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
export interface UnstableFeatures {}
/* eslint-enable @typescript-eslint/no-empty-object-type */
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
