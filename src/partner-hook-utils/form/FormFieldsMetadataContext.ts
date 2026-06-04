import { createContext, useContext } from 'react'
import type { FieldsMetadata } from '../types'
import type { SDKError } from '@/types/sdkError'

/**
 * Value published by {@link FormFieldsMetadataProvider} to descendant hook fields.
 *
 * @internal
 */
export interface FormFieldsMetadataContextValue {
  metadata: FieldsMetadata
  errors: SDKError[]
}

/**
 * React context that carries form field metadata and current error state down to
 * descendant hook fields rendered inside an SDK form provider.
 *
 * @internal
 */
export const FormFieldsMetadataContext = createContext<FormFieldsMetadataContextValue | null>(null)

/**
 * Reads the nearest {@link FormFieldsMetadataContext} value, or `null` when no
 * provider is mounted above.
 *
 * @returns The provider value when one is mounted, otherwise `null`.
 * @internal
 */
export function useFormFieldsMetadataContext(): FormFieldsMetadataContextValue | null {
  return useContext(FormFieldsMetadataContext)
}
