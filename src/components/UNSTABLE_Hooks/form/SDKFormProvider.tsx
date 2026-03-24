import { type ReactNode, useEffect } from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import { FormProvider } from 'react-hook-form'
import type { HookFormInternals } from '../types'
import { FormFieldsMetadataProvider } from './FormFieldsMetadataProvider'
import type { FieldMetadata, FieldMetadataWithOptions } from './types'
import type { SDKError, SDKFieldError } from '@/types/sdkError'

function useSyncFieldErrors<
  TFormData extends FieldValues,
  TFieldsMetadata extends {
    [K in keyof TFieldsMetadata]: FieldMetadata | FieldMetadataWithOptions
  },
>(
  fieldErrors: SDKFieldError[],
  form: {
    fieldsMetadata: TFieldsMetadata
    hookFormInternals: HookFormInternals<TFormData>
  },
) {
  const { fieldsMetadata } = form
  const { setError } = form.hookFormInternals.formMethods

  useEffect(() => {
    if (!fieldErrors.length) return
    const knownFields = new Set(Object.keys(fieldsMetadata))
    for (const fieldError of fieldErrors) {
      if (knownFields.has(fieldError.field)) {
        setError(fieldError.field as FieldPath<TFormData>, {
          type: 'custom',
          message: fieldError.message,
        })
      }
    }
  }, [fieldErrors, setError, fieldsMetadata])
}

interface SDKFormProviderProps<
  TFormData extends FieldValues = FieldValues,
  TFieldsMetadata extends {
    [K in keyof TFieldsMetadata]: FieldMetadata | FieldMetadataWithOptions
  } = Record<string, FieldMetadata | FieldMetadataWithOptions>,
> {
  formHookResult: {
    errors: SDKError[]
    form: {
      fieldsMetadata: TFieldsMetadata
      hookFormInternals: HookFormInternals<TFormData>
    }
  }
  children: ReactNode
}

export function SDKFormProvider<
  TFormData extends FieldValues = FieldValues,
  TFieldsMetadata extends {
    [K in keyof TFieldsMetadata]: FieldMetadata | FieldMetadataWithOptions
  } = Record<string, FieldMetadata | FieldMetadataWithOptions>,
>({ formHookResult, children }: SDKFormProviderProps<TFormData, TFieldsMetadata>) {
  const { errors, form } = formHookResult
  const allFieldErrors = errors.flatMap(e => e.fieldErrors)
  useSyncFieldErrors(allFieldErrors, form)

  return (
    <FormFieldsMetadataProvider metadata={form.fieldsMetadata} errors={errors}>
      <FormProvider {...form.hookFormInternals.formMethods}>{children}</FormProvider>
    </FormFieldsMetadataProvider>
  )
}
