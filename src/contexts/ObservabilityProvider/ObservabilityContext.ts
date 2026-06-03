import { createContext } from 'react'
import type { ObservabilityHook } from '@/types/observability'

/**
 * Value provided by {@link ObservabilityContext}, exposing the configured observability hook to descendants.
 *
 * @public
 */
export interface ObservabilityContextValue {
  observability: ObservabilityHook | undefined
}

/**
 * React context that carries the partner-supplied observability hook through the SDK provider tree.
 *
 * @internal
 */
export const ObservabilityContext = createContext<ObservabilityContextValue | undefined>(undefined)
