import type { ReactElement } from 'react'
import { FieldElementRegistryProvider } from '@/components/Common/Fields/hooks/FieldElementRegistryProvider'
import type { FieldElementRegistry } from '@/components/Common/Fields/hooks/fieldElementRegistry'

/**
 * Wraps a HookField's rendered output with `FieldElementRegistryProvider` when the field is connected via a `formHookResult` prop.
 *
 * @remarks
 * When the field is connected via the `formHookResult` prop (Option A path),
 * `SDKFormProvider` is absent and the registry has no other way to reach
 * `useField`. When no registry is provided (Option B / `SDKFormProvider`
 * path), this is a pass-through so the outer provider's registry remains in
 * scope.
 *
 * @param registry - Per-form `FieldElementRegistry` from the hook's `hookFormInternals`, or `undefined` when an outer `SDKFormProvider` already publishes one.
 * @param element - The rendered field element to wrap.
 * @returns The element wrapped in `FieldElementRegistryProvider` when `registry` is defined, otherwise the original element.
 * @internal
 */
export function withFieldElementRegistry(
  registry: FieldElementRegistry | undefined,
  element: ReactElement,
): ReactElement {
  if (!registry) return element
  return <FieldElementRegistryProvider registry={registry}>{element}</FieldElementRegistryProvider>
}
