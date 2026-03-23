import type { FieldMetadata } from './types'
import { useFormFieldsMetadataContext } from './FormFieldsMetadataContext'

export function useFieldMetadata<TEntry = unknown>(fieldName: string): FieldMetadata<TEntry> {
  const { metadata } = useFormFieldsMetadataContext()
  const fieldMetadata = metadata[fieldName]
  if (!fieldMetadata) {
    throw new Error(
      `useFieldMetadata: no metadata found for field "${fieldName}". ` +
        `Available fields: ${Object.keys(metadata).join(', ') || '(none)'}`,
    )
  }
  return fieldMetadata as FieldMetadata<TEntry>
}
