export interface FieldMetadata {
  name: string
  isRequired?: boolean
  isDisabled?: boolean
}

export interface FieldMetadataWithOptions<TEntry = unknown> extends FieldMetadata {
  options: Array<{ label: string; value: string }>
  entries?: TEntry[]
}

export type FieldsMetadata = { [key: string]: FieldMetadata | FieldMetadataWithOptions }

export function hasOptions(
  metadata: FieldMetadata | FieldMetadataWithOptions,
): metadata is FieldMetadataWithOptions {
  return 'options' in metadata && Array.isArray(metadata.options)
}

export function withOptions<TEntry = unknown>(
  base: FieldMetadata,
  options: Array<{ label: string; value: string }>,
  entries?: TEntry[],
): FieldMetadataWithOptions<TEntry> {
  if (entries !== undefined) {
    return { ...base, options, entries }
  }
  return { ...base, options }
}
