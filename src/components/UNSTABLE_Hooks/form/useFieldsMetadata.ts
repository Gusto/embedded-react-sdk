import type { FieldMetadata, FieldMetadataWithOptions } from './types'
import { useFormFieldsMetadataContext } from './FormFieldsMetadataContext'

export function useFieldsMetadata<
  TFieldsMetadata extends {
    [K in keyof TFieldsMetadata]: FieldMetadata | FieldMetadataWithOptions
  },
>(): TFieldsMetadata {
  const { metadata } = useFormFieldsMetadataContext()
  return metadata as TFieldsMetadata
}
