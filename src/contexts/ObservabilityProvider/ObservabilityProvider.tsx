import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { ObservabilityContext } from './ObservabilityContext'
import type { ObservabilityHook } from '@/types/observability'

/**
 * Props for {@link ObservabilityProvider}.
 *
 * @public
 */
export interface ObservabilityProviderProps {
  children: ReactNode
  observability?: ObservabilityHook
}

/**
 * Makes a partner-supplied observability hook available to SDK components for error and metric reporting.
 *
 * @remarks
 * Typically mounted by `GustoProvider` when the `observability` config option is set. Errors and metrics
 * emitted by SDK components are routed through {@link useObservability}, which applies PII sanitization
 * before invoking the partner's `onError` and `onMetric` callbacks.
 *
 * @param props - {@link ObservabilityProviderProps} containing the children and optional observability hook.
 * @returns The provider element wrapping `children` with the observability context.
 * @public
 */
export const ObservabilityProvider = ({ children, observability }: ObservabilityProviderProps) => {
  const value = useMemo(() => ({ observability }), [observability])

  return <ObservabilityContext.Provider value={value}>{children}</ObservabilityContext.Provider>
}
