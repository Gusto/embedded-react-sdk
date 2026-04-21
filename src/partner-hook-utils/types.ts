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

/**
 * Base shape for non-form hooks in the ready (loaded) state.
 * Pass `TData` / `TStatus` so each hook narrows payload and status without `Omit` + rewrite.
 */
export interface BaseHookReady<
  TData extends Record<string, unknown> = Record<string, unknown>,
  TStatus extends Record<string, unknown> = Record<string, unknown>,
> {
  isLoading: false
  data: TData
  status: TStatus
  errorHandling: HookErrorHandling
}

/**
 * Base shape for form hooks in the ready state.
 * Individual hooks override `data`, `actions`, and `form`.
 *
 * `status.mode` matches {@link HookSubmitResult} (`create` | `update`). Document-sign hooks
 * surface `mode: 'create'` only — that reflects the submit/API contract, not “create entity”
 * in the domain sense.
 */
export interface BaseFormHookReady<
  TFieldsMetadata extends FieldsMetadata = FieldsMetadata,
  TFormData extends FieldValues = FieldValues,
  TFields extends object = Record<string, unknown>,
> {
  isLoading: false
  data: Record<string, unknown>
  status: { isPending: boolean; mode: 'create' | 'update' }
  actions: Record<string, unknown>
  errorHandling: HookErrorHandling
  form: {
    Fields: TFields
    fieldsMetadata: TFieldsMetadata
    hookFormInternals: HookFormInternals<TFormData>
    getFormSubmissionValues: () => Record<string, unknown> | undefined
  }
}

/**
 * Narrowed shape for `formHookResult` props on HookField components.
 *
 * Derived from {@link BaseFormHookReady} so `errorHandling` and `fieldsMetadata`
 * stay in sync with hook return types. `control` is typed as `unknown` because
 * react-hook-form's `Control<T>` is invariant on `T` — the single `as Control`
 * cast lives in {@link useHookFieldResolution}, the only consumer.
 */
export type FormHookResult = {
  errorHandling: Pick<BaseFormHookReady['errorHandling'], 'errors'>
  form: Pick<BaseFormHookReady['form'], 'fieldsMetadata'> & {
    hookFormInternals: {
      formMethods: { control: unknown }
    }
  }
}
