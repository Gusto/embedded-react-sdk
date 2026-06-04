import type { ReactNode } from 'react'
import type { FieldMetadata, FieldMetadataWithOptions } from '../types'
import { FormFieldsMetadataContext } from './FormFieldsMetadataContext'
import type { SDKError } from '@/types/sdkError'

interface FormFieldsMetadataProviderProps {
  metadata: Record<string, FieldMetadata | FieldMetadataWithOptions>
  errors: SDKError[]
  children: ReactNode
}

/**
 * Publishes field metadata and current form errors via {@link FormFieldsMetadataContext}
 * so descendant hook fields can resolve their requiredness, options, and inline
 * error messages without prop drilling.
 *
 * @internal
 */
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
