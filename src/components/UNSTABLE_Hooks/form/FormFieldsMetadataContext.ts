import { createContext, useContext } from 'react'
import type { FieldsMetadata } from './types'
import type { SDKError } from '@/types/sdkError'

export interface FormFieldsMetadataContextValue {
  metadata: FieldsMetadata
  errors: SDKError[]
}

export const FormFieldsMetadataContext = createContext<FormFieldsMetadataContextValue | null>(null)

export function useFormFieldsMetadataContext(): FormFieldsMetadataContextValue | null {
  return useContext(FormFieldsMetadataContext)
}
