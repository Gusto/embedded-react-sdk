import type { ReactNode } from 'react'
import type { FieldsMetadata } from './types'
import { FormFieldsMetadataContext } from './FormFieldsMetadataContext'
import type { SDKError } from '@/types/sdkError'

interface FormFieldsMetadataProviderProps {
  metadata: FieldsMetadata
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
