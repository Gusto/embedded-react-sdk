import type { ReactNode } from 'react'
import { FormProvider } from 'react-hook-form'
import { FormFieldsMetadataProvider } from '../../FormFieldsContext'
import type { HomeAddressFormReady } from './useHomeAddressForm'

interface HomeAddressFormProviderProps {
  form: HomeAddressFormReady
  children: ReactNode
}

export function HomeAddressFormProvider({ form, children }: HomeAddressFormProviderProps) {
  return (
    <FormFieldsMetadataProvider metadata={form.fieldsMetadata}>
      <FormProvider {...form.hookFormInternals.formMethods}>{children}</FormProvider>
    </FormFieldsMetadataProvider>
  )
}
