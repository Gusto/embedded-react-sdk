import type { ResourceDictionary } from '@/types/Helpers'

/**
 * Override surface for {@link DeductionsForm}'s text. Surfaces (onboarding,
 * management, etc.) pass a resolved dictionary that fully replaces the form's
 * default English copy at render time.
 *
 * The underlying namespace (`Employee.DeductionsForm`) is an implementation
 * detail of the shared form — callers shouldn't reference it directly. Build
 * the dictionary inside a per-surface `useFormDictionary` hook that resolves
 * `t(...)` against the surface's own namespace, so partner overrides on that
 * namespace flow into the form text automatically.
 */
export type DeductionsFormDictionary = ResourceDictionary<'Employee.DeductionsForm'>
