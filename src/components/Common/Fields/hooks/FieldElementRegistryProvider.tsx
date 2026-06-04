import type { ReactNode } from 'react'
import { FieldElementRegistryContext, type FieldElementRegistry } from './fieldElementRegistry'

interface FieldElementRegistryProviderProps {
  registry: FieldElementRegistry | null | undefined
  children: ReactNode
}

/**
 * Publishes a `FieldElementRegistry` via context so `useField` can populate it.
 * `SDKFormProvider` wires this automatically; partners who build their own form
 * surface can wrap with this provider directly to opt into cross-form focus.
 *
 * @internal
 */
export function FieldElementRegistryProvider({
  registry,
  children,
}: FieldElementRegistryProviderProps) {
  return (
    <FieldElementRegistryContext.Provider value={registry ?? null}>
      {children}
    </FieldElementRegistryContext.Provider>
  )
}
