import type { FieldMetadata } from '../types'

/**
 * Apply presentation flags (e.g. `isDisabled`) to a base {@link FieldMetadata}
 * entry while preserving the `FieldMetadata` type.
 *
 * @remarks
 * Use when building the `fieldsMetadata` returned by a custom form hook to
 * override flags on an entry derived from `useDeriveFieldsMetadata`. A bare
 * object spread (`{ ...base, isDisabled }`) widens the entry to an anonymous
 * object type; routing it through this helper keeps it typed as
 * {@link FieldMetadata} so the hook's inferred metadata type stays precise.
 *
 * @param base - The existing field metadata entry to extend.
 * @param flags - Presentation flags to override on the entry.
 * @returns The merged entry, typed as {@link FieldMetadata}.
 * @internal
 */
export function withFlags(base: FieldMetadata, flags: Partial<FieldMetadata>): FieldMetadata {
  return { ...base, ...flags }
}
