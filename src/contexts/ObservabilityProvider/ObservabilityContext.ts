import { createContext } from 'react'
import type { ObservabilityHook } from '@/types/observability'

export interface ObservabilityContextValue {
  observability: ObservabilityHook | undefined
}

export const ObservabilityContext = createContext<ObservabilityContextValue | undefined>(
  undefined,
)
