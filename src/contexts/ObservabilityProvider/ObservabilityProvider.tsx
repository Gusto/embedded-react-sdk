import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { ObservabilityContext } from './ObservabilityContext'
import type { ObservabilityHook } from '@/types/observability'

export interface ObservabilityProviderProps {
  children: ReactNode
  observability?: ObservabilityHook
}

export const ObservabilityProvider = ({ children, observability }: ObservabilityProviderProps) => {
  const value = useMemo(() => ({ observability }), [observability])

  return <ObservabilityContext.Provider value={value}>{children}</ObservabilityContext.Provider>
}
