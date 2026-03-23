import type { ReactNode } from 'react'
import type { FieldMetadata, FieldMetadataWithOptions } from './types'
import { FormFieldsMetadataContext } from './FormFieldsMetadataContext'
import type { SDKError } from '@/types/sdkError'

interface FormFieldsMetadataProviderProps {
  metadata: Record<string, FieldMetadata | FieldMetadataWithOptions>
  error: SDKError | null
  children: ReactNode
}

export function FormFieldsMetadataProvider({
  metadata,
  error,
  children,
}: FormFieldsMetadataProviderProps) {
  return (
    <FormFieldsMetadataContext.Provider value={{ metadata, error }}>
      {children}
    </FormFieldsMetadataContext.Provider>
  )
}
