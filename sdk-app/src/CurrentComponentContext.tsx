import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  CurrentComponentContext,
  type CurrentComponentRegistry,
  type CurrentComponentValue,
} from './useCurrentComponent'

interface ProviderProps {
  children: ReactNode
}

export function CurrentComponentProvider({ children }: ProviderProps) {
  const [current, setCurrent] = useState<CurrentComponentValue | null>(null)

  const register = useCallback((next: CurrentComponentValue) => {
    setCurrent(next)
  }, [])

  const unregister = useCallback(() => {
    setCurrent(null)
  }, [])

  const value = useMemo<CurrentComponentRegistry>(
    () => ({ current, register, unregister }),
    [current, register, unregister],
  )

  return (
    <CurrentComponentContext.Provider value={value}>{children}</CurrentComponentContext.Provider>
  )
}
