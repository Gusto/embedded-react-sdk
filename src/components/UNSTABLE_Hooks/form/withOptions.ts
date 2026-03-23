import type { FieldMetadata, FieldMetadataWithOptions } from './types'

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
