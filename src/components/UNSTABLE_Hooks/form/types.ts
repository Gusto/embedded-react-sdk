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
export type ValidationMessages<TErrorCode extends string> = Record<TErrorCode, string>

export interface BaseFieldProps {
  label: string
  description?: React.ReactNode
}

/** Strips `name` from a HookField props type for domain-specific field components that bind `name` internally. */
export type HookFieldProps<TProps extends { name: string }> = Omit<TProps, 'name'>

/**
 * Minimal structural type representing the subset of any form hook's ready state
 * that HookField components need to render without context providers.
 *
 * Any hook returning `BaseFormHookReady` satisfies this interface via structural
 * typing — no casts needed. This is the same shape `SDKFormProvider` accepts.
 *
 * @example
 * ```tsx
 * const compensation = useCompensationForm({ employeeId })
 * if (compensation.isLoading) return <Loading />
 *
 * // Pass directly to fields — same object SDKFormProvider would receive
 * <Fields.JobTitle label="Job Title" formHookResult={compensation} />
 * ```
 */
export interface FormHookResultLike<TFormData extends FieldValues = FieldValues> {
  errorHandling: { errors: SDKError[] }
  form: {
    fieldsMetadata: FieldsMetadata
    hookFormInternals: { formMethods: UseFormReturn<TFormData> }
  }
}
