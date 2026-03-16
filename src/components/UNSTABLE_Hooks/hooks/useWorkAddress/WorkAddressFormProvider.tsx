import type { ReactNode } from 'react'
import { FormProvider } from 'react-hook-form'
import { FormFieldsMetadataProvider } from '../../FormFieldsContext'
import type { WorkAddressFormReady } from './useWorkAddressForm'

interface WorkAddressFormProviderProps {
  form: WorkAddressFormReady
  children: ReactNode
}

export function WorkAddressFormProvider({ form, children }: WorkAddressFormProviderProps) {
  return (
    <FormFieldsMetadataProvider metadata={form.fieldsMetadata}>
      <FormProvider {...form.hookFormInternals.formMethods}>{children}</FormProvider>
    </FormFieldsMetadataProvider>
  )
}
