import type { ReactNode } from 'react'
import { FormProvider } from 'react-hook-form'
import { FormFieldsMetadataProvider } from '../../FormFieldsContext'
import type { CompensationFormReady } from './useCompensationForm'

interface CompensationFormProviderProps {
  form: CompensationFormReady
  children: ReactNode
}

export function CompensationFormProvider({ form, children }: CompensationFormProviderProps) {
  return (
    <FormFieldsMetadataProvider metadata={form.fieldsMetadata}>
      <FormProvider {...form.hookFormInternals.formMethods}>{children}</FormProvider>
    </FormFieldsMetadataProvider>
  )
}
