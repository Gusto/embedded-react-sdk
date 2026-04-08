import type React from 'react'
import type { UseFormReturn, FieldValues } from 'react-hook-form'
import type { SDKError } from '@/types/sdkError'

export interface FieldMetadata {
  name: string
  isRequired?: boolean
  isDisabled?: boolean
  hasRedactedValue?: boolean
}

export interface FieldMetadataWithOptions<TEntry = unknown> extends FieldMetadata {
  options: Array<{ label: string; value: string }>
  entries?: TEntry[]
}

export type FieldsMetadata = { [key: string]: FieldMetadata | FieldMetadataWithOptions }

/** Maps every error code a schema field can produce to a partner-supplied display string. */
export type ValidationMessages<
  TErrorCode extends string,
  TOptionalErrorCode extends string = never,
> = Record<TErrorCode, string> & Partial<Record<TOptionalErrorCode, string>>

export interface BaseFieldProps {
  label: string
  description?: React.ReactNode
}

/** Strips `name` from a HookField props type for domain-specific field components that bind `name` internally. */
export type HookFieldProps<TProps extends { name: string }> = Omit<TProps, 'name'>

/** Exposes react-hook-form internals for SDK utilities and advanced partner use cases. */
export interface HookFormInternals<TFormData extends FieldValues = FieldValues> {
  formMethods: UseFormReturn<TFormData>
}

/** Discriminated union member returned while async data is being fetched. */
export interface HookLoadingResult {
  isLoading: true
  errorHandling: HookErrorHandling
}

/** Result shape returned by a successful form submission. */
export interface HookSubmitResult<T> {
  mode: 'create' | 'update'
  data: T
}

/** Error state and recovery actions returned by all hooks. */
export interface HookErrorHandling {
  errors: SDKError[]
  retryQueries: () => void
  clearSubmitError: () => void
}

/** Base shape for non-form hooks. Individual hooks override `data`. */
export interface BaseHookReady {
  isLoading: false
  data: Record<string, unknown>
  status: Record<string, unknown>
  errorHandling?: HookErrorHandling
}

/** Base shape for form hooks. Individual hooks override `data`, `actions`, and `form`. */
export interface BaseFormHookReady<TFieldsMetadata extends FieldsMetadata = FieldsMetadata> {
  isLoading: false
  data: Record<string, unknown>
  status: { isPending: boolean; mode: 'create' | 'update' }
  actions: Record<string, unknown>
  errorHandling: HookErrorHandling
  form: {
    Fields: Record<string, unknown>
    fieldsMetadata: TFieldsMetadata
    hookFormInternals: HookFormInternals
    getFormSubmissionValues: () => Record<string, unknown> | undefined
  }
}
