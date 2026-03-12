import type { ReactNode } from 'react'
import { FormProvider } from 'react-hook-form'
import type { EmployeeDetailsFormReady } from './useEmployeeDetails'

interface EmployeeDetailsFormProviderProps {
  form: EmployeeDetailsFormReady
  children: ReactNode
}

export function EmployeeDetailsFormProvider({ form, children }: EmployeeDetailsFormProviderProps) {
  return <FormProvider {...form.hookFormInternals.formMethods}>{children}</FormProvider>
}
