import type { FieldMetadata, FieldMetadataWithOptions } from '../types'

/**
 * Extends a {@link FieldMetadata} entry with the option list used to render a select-like field.
 *
 * @remarks
 * Use when building the `fieldsMetadata` returned by a custom form hook to
 * attach `label`/`value` pairs (and optionally the raw underlying records) to
 * a field's metadata entry. Hook field components for select-like inputs read
 * `options` and, when present, `entries` off the resulting
 * {@link FieldMetadataWithOptions}.
 *
 * @typeParam TEntry - Shape of the underlying records that produced `options`.
 * @param base - The existing field metadata entry to extend.
 * @param options - Display options as `label`/`value` pairs to render in the field.
 * @param entries - Optional raw records the options were derived from, exposed alongside `options` for callers that need additional attributes.
 * @returns A {@link FieldMetadataWithOptions} carrying the original metadata plus `options` and, when supplied, `entries`.
 * @internal
 *
 * @example
 * ```ts
 * const typeOptions = PAYMENT_METHOD_TYPES.map(value => ({ value, label: value }))
 * const fieldsMetadata = {
 *   type: withOptions(baseMetadata.type, typeOptions, [...PAYMENT_METHOD_TYPES]),
 * }
 * ```
 */
export function withOptions<TEntry = unknown>(
  base: FieldMetadata,
  options: Array<{ label: string; value: string }>,
  entries?: readonly TEntry[],
): FieldMetadataWithOptions<TEntry> {
  if (entries !== undefined) {
    return { ...base, options, entries }
  }
  return { ...base, options }
}
