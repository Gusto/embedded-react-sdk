import { createContext, useContext } from 'react'
import type { FieldsMetadata } from './types'
import type { SDKError } from '@/types/sdkError'

export interface FormFieldsMetadataContextValue {
  metadata: FieldsMetadata
  errors: SDKError[]
}

export const FormFieldsMetadataContext = createContext<FormFieldsMetadataContextValue | null>(null)

export function useFormFieldsMetadataContext(): FormFieldsMetadataContextValue {
  const context = useContext(FormFieldsMetadataContext)
  if (!context) {
    throw new Error('useFormFieldsMetadataContext must be used within a FormFieldsMetadataProvider')
  }
  return context
}

export function useOptionalFormFieldsMetadataContext(): FormFieldsMetadataContextValue | null {
  return useContext(FormFieldsMetadataContext)
}
