import type { ReactNode } from 'react'
import { FormProvider } from 'react-hook-form'
import type { HomeAddressFormReady } from './useHomeAddress'

interface HomeAddressFormProviderProps {
  form: HomeAddressFormReady
  children: ReactNode
}

export function HomeAddressFormProvider({ form, children }: HomeAddressFormProviderProps) {
  return <FormProvider {...form.hookFormInternals.formMethods}>{children}</FormProvider>
}
