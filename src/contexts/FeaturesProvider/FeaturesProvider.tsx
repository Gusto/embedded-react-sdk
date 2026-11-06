import type { ReactNode } from 'react'
import { useRef } from 'react'
import { FeaturesContext, type Features } from './useFeature'

/** @internal */
export interface FeaturesProviderProps {
  children: ReactNode
  value?: Features
}

/**
 * Provides the {@link Features} flags to SDK components via {@link FeaturesContext}.
 *
 * @remarks
 * Composed by `GustoProvider` so the `features` prop flows down to any SDK Flow or Block that
 * checks {@link useFeature}. The context value is keyed on its sorted, serialized content rather
 * than the `value` object's identity — the returned reference only changes when a flag's value
 * actually changes, and adding a new flag to {@link Features} needs no update here.
 *
 * @param props - See {@link FeaturesProviderProps}.
 * @returns A React subtree with the features context applied.
 * @internal
 */
export function FeaturesProvider({ children, value }: FeaturesProviderProps) {
  const resolvedValue = value ?? {}
  const key = JSON.stringify(resolvedValue, Object.keys(resolvedValue).sort())

  const stableRef = useRef<{ key: string; value: Features }>({
    key,
    value: resolvedValue,
  })
  if (stableRef.current.key !== key) {
    stableRef.current = { key, value: resolvedValue }
  }

  return (
    <FeaturesContext.Provider value={stableRef.current.value}>{children}</FeaturesContext.Provider>
  )
}
