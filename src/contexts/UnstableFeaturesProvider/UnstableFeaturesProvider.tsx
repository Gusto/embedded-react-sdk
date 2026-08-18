import type { ReactNode } from 'react'
import { useRef } from 'react'
import { UnstableFeaturesContext, type UnstableFeatures } from './useUnstableFeatures'

/** @internal */
export interface UnstableFeaturesProviderProps {
  children: ReactNode
  value?: UnstableFeatures
}

/**
 * Provides the {@link UnstableFeatures} flags to SDK components via {@link UnstableFeaturesContext}.
 *
 * @remarks
 * Composed by `GustoProvider` so the `unstableFeatures` prop flows down to any SDK Flow or Block
 * that checks {@link useUnstableFeatures} before rendering alpha functionality. Partners typically
 * pass an inline literal that gets a new identity on every render of their app, so the context
 * value is keyed on its sorted, serialized content (same approach as `useApplicableFieldErrors` in
 * `SDKFormProvider`) rather than the `value` object's identity — the returned reference only
 * changes when a flag's value actually changes, and adding a new flag to {@link UnstableFeatures}
 * needs no update here.
 *
 * @param props - See {@link UnstableFeaturesProviderProps}.
 * @returns A React subtree with the unstable-features context applied.
 * @internal
 */
export function UnstableFeaturesProvider({ children, value }: UnstableFeaturesProviderProps) {
  const resolvedValue = value ?? {}
  const key = JSON.stringify(resolvedValue, Object.keys(resolvedValue).sort())

  const stableRef = useRef<{ key: string; value: UnstableFeatures }>({
    key,
    value: resolvedValue,
  })
  if (stableRef.current.key !== key) {
    stableRef.current = { key, value: resolvedValue }
  }

  return (
    <UnstableFeaturesContext.Provider value={stableRef.current.value}>
      {children}
    </UnstableFeaturesContext.Provider>
  )
}
