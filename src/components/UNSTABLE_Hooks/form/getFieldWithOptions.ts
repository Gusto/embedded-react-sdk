import type { FieldMetadataWithOptions, FieldsMetadata } from './types'

export function getFieldWithOptions<TEntry = unknown>(
  metadata: FieldsMetadata,
  name: string,
): FieldMetadataWithOptions<TEntry> | undefined {
  const field = metadata[name]
  if (field && 'options' in field) return field as FieldMetadataWithOptions<TEntry>
  return undefined
}
