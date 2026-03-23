import type { FieldMetadata, FieldMetadataWithOptions, FieldsMetadata } from './types'
import { useFormFieldsMetadataContext } from './FormFieldsMetadataContext'

export function useFieldsMetadata<
  TFieldsMetadata extends {
    [K in keyof TFieldsMetadata]: FieldMetadata | FieldMetadataWithOptions
  } = FieldsMetadata,
>(): TFieldsMetadata {
  const { metadata } = useFormFieldsMetadataContext()
  return metadata as TFieldsMetadata
}
