import type { ReactNode } from 'react'
import type { FieldMetadata, FieldMetadataWithOptions } from './types'
import { FormFieldsMetadataContext } from './FormFieldsMetadataContext'
import type { SDKError } from '@/types/sdkError'

interface FormFieldsMetadataProviderProps {
  metadata: Record<string, FieldMetadata | FieldMetadataWithOptions>
  errors: SDKError[]
  children: ReactNode
}

export function FormFieldsMetadataProvider({
  metadata,
  errors,
  children,
}: FormFieldsMetadataProviderProps) {
  return (
    <FormFieldsMetadataContext.Provider value={{ metadata, errors }}>
      {children}
    </FormFieldsMetadataContext.Provider>
  )
}
