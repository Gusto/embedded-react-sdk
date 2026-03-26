import type { FieldMetadata, FieldMetadataWithOptions, FieldsMetadata } from './types'
import { useFormFieldsMetadataContext } from './FormFieldsMetadataContext'

export function useFieldsMetadata<
  TFieldsMetadata extends {
    [K in keyof TFieldsMetadata]: FieldMetadata | FieldMetadataWithOptions
  } = FieldsMetadata,
>(): TFieldsMetadata {
  const context = useFormFieldsMetadataContext()
  return (context?.metadata ?? {}) as TFieldsMetadata
}
