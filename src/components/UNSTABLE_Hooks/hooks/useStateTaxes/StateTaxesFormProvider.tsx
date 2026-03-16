import type { ReactNode } from 'react'
import { FormProvider } from 'react-hook-form'
import { FormFieldsMetadataProvider, type FieldMetadataEntry } from '../../FormFieldsContext'
import type { StateTaxesFormReady } from './useStateTaxesForm'

interface StateTaxesFormProviderProps {
  form: StateTaxesFormReady
  children: ReactNode
}

export function StateTaxesFormProvider({ form, children }: StateTaxesFormProviderProps) {
  return (
    <FormFieldsMetadataProvider
      metadata={form.fieldsMetadata as Record<string, FieldMetadataEntry>}
    >
      <FormProvider {...form.hookFormInternals.formMethods}>{children}</FormProvider>
    </FormFieldsMetadataProvider>
  )
}
