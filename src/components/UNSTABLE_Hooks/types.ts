import type { UseFormReturn, FieldValues } from 'react-hook-form'
import type { FieldsMetadata } from './form/types'
import type { SDKError } from '@/types/sdkError'

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
  status: { isPending: boolean }
  errorHandling: HookErrorHandling
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
    getFormSubmissionValues: () => Record<string, unknown>
  }
}
