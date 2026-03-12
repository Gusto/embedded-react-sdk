import type { ReactNode } from 'react'
import { FormProvider } from 'react-hook-form'
import type { WorkAddressFormReady } from './useWorkAddress'

interface WorkAddressFormProviderProps {
  form: WorkAddressFormReady
  children: ReactNode
}

export function WorkAddressFormProvider({ form, children }: WorkAddressFormProviderProps) {
  return <FormProvider {...form.hookFormInternals.formMethods}>{children}</FormProvider>
}
