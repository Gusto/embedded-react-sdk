import type { ReactElement } from 'react'
import { FieldElementRegistryProvider } from '../FieldElementRegistryProvider'
import type { FieldElementRegistry } from '../fieldElementRegistry'

/**
 * Wraps a HookField's rendered output with `FieldElementRegistryProvider` when
 * the field is connected via a `formHookResult` prop (Option A path). In that
 * mode `SDKFormProvider` is absent, so the registry has no other way to reach
 * `useField`. When no registry is provided (Option B / `SDKFormProvider` path),
 * this is a pass-through so the outer provider's registry remains in scope.
 */
export function withFieldElementRegistry(
  registry: FieldElementRegistry | undefined,
  element: ReactElement,
): ReactElement {
  if (!registry) return element
  return <FieldElementRegistryProvider registry={registry}>{element}</FieldElementRegistryProvider>
}
