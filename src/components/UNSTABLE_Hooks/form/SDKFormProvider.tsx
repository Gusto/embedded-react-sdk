import type { ReactNode } from 'react'
import type { FieldValues } from 'react-hook-form'
import { FormProvider } from 'react-hook-form'
import type { HookFormInternals, HookErrors } from '../types'
import { FormFieldsMetadataProvider } from './FormFieldsMetadataProvider'
import type { FieldsMetadata } from './types'

interface SDKFormProviderProps<TFormData extends FieldValues = FieldValues> {
  errors: HookErrors
  form: {
    fieldsMetadata: FieldsMetadata
    hookFormInternals: HookFormInternals<TFormData>
  }
  children: ReactNode
}

export function SDKFormProvider<TFormData extends FieldValues = FieldValues>({
  errors,
  form,
  children,
}: SDKFormProviderProps<TFormData>) {
  return (
    <FormFieldsMetadataProvider metadata={form.fieldsMetadata} error={errors.error}>
      <FormProvider {...form.hookFormInternals.formMethods}>{children}</FormProvider>
    </FormFieldsMetadataProvider>
  )
}
