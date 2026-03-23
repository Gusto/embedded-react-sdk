import { type ReactNode, useEffect } from 'react'
import type { FieldValues, UseFormSetError } from 'react-hook-form'
import { FormProvider } from 'react-hook-form'
import type { HookFormInternals, HookErrors } from '../types'
import { FormFieldsMetadataProvider } from './FormFieldsMetadataProvider'
import type { FieldMetadata, FieldMetadataWithOptions } from './types'
import type { SDKFieldError } from '@/types/sdkError'

function useSyncFieldErrors(
  fieldErrors: SDKFieldError[] | undefined,
  setError: UseFormSetError<FieldValues>,
) {
  useEffect(() => {
    if (fieldErrors && fieldErrors.length > 0) {
      fieldErrors.forEach(fieldError => {
        setError(fieldError.field, { type: 'custom', message: fieldError.message })
      })
    }
  }, [fieldErrors, setError])
}

interface SDKFormProviderProps<
  TFormData extends FieldValues = FieldValues,
  TFieldsMetadata extends {
    [K in keyof TFieldsMetadata]: FieldMetadata | FieldMetadataWithOptions
  } = Record<string, FieldMetadata | FieldMetadataWithOptions>,
> {
  errors: HookErrors
  form: {
    fieldsMetadata: TFieldsMetadata
    hookFormInternals: HookFormInternals<TFormData>
  }
  children: ReactNode
}

export function SDKFormProvider<
  TFormData extends FieldValues = FieldValues,
  TFieldsMetadata extends {
    [K in keyof TFieldsMetadata]: FieldMetadata | FieldMetadataWithOptions
  } = Record<string, FieldMetadata | FieldMetadataWithOptions>,
>({ errors, form, children }: SDKFormProviderProps<TFormData, TFieldsMetadata>) {
  useSyncFieldErrors(
    errors.error?.fieldErrors,
    form.hookFormInternals.formMethods.setError as UseFormSetError<FieldValues>,
  )

  return (
    <FormFieldsMetadataProvider metadata={form.fieldsMetadata} error={errors.error}>
      <FormProvider {...form.hookFormInternals.formMethods}>{children}</FormProvider>
    </FormFieldsMetadataProvider>
  )
}
