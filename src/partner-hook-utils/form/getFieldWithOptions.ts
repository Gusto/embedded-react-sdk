import type { FieldMetadataWithOptions, FieldsMetadata } from '../types'

/**
 * Narrows a {@link FieldsMetadata} entry to {@link FieldMetadataWithOptions} when
 * the field carries an `options` list.
 *
 * @typeParam TEntry - Shape of the underlying records that produced the options.
 * @param metadata - Map of field metadata indexed by form-field name.
 * @param name - Name of the field to look up.
 * @returns The field's metadata typed as {@link FieldMetadataWithOptions}, or
 *   `undefined` when the field is absent or has no `options` list.
 * @internal
 */
export function getFieldWithOptions<TEntry = unknown>(
  metadata: FieldsMetadata,
  name: string,
): FieldMetadataWithOptions<TEntry> | undefined {
  const field = metadata[name]
  if (field && 'options' in field) return field as FieldMetadataWithOptions<TEntry>
  return undefined
}
