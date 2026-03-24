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
}

/** Result shape returned by a successful form submission. */
export interface HookSubmitResult<T> {
  mode: 'create' | 'update'
  data: T
}

/** Flat error state for hooks. `errors` combines query and submit errors. `clearSubmitError` clears the stateful submit error. */
export interface HookErrors {
  errors: SDKError[]
  clearSubmitError: () => void
}

/** Base shape for non-form hooks. Individual hooks override `data`. */
export interface BaseHookReady {
  isLoading: false
  data: Record<string, unknown>
  status: { isPending: boolean }
  errors: SDKError[]
  clearSubmitError: () => void
}

/** Base shape for form hooks. Individual hooks override `data`, `actions`, and `form`. */
export interface BaseFormHookReady<TFieldsMetadata extends FieldsMetadata = FieldsMetadata> {
  isLoading: false
  data: Record<string, unknown>
  status: { isPending: boolean; mode: 'create' | 'update' }
  actions: Record<string, unknown>
  errors: SDKError[]
  clearSubmitError: () => void
  form: {
    Fields: Record<string, unknown>
    fieldsMetadata: TFieldsMetadata
    hookFormInternals: HookFormInternals
  }
}
