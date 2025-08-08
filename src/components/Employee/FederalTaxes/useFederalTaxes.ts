import { z } from 'zod'
import type { EmployeeFederalTax } from '@gusto/embedded-api/models/components/employeefederaltax'
import { createCompoundContext } from '@/components/Base'

export const FederalTaxFormSchema = z.object({
  filingStatus: z.string().min(1),
  twoJobs: z.string().min(1),
  dependentsAmount: z.number().transform(String),
  otherIncome: z.number().transform(String),
  deductions: z.number().transform(String),
  extraWithholding: z.number().transform(String),
  w4DataType: z.enum(['pre_2020_w4', 'rev_2020_w4']),
})

export type FederalTaxFormInputs = z.input<typeof FederalTaxFormSchema>
export type FederalTaxFormPayload = z.output<typeof FederalTaxFormSchema>

type FederalTaxesContextType = {
  employeeFederalTax: EmployeeFederalTax
  isPending: boolean
  isAdmin?: boolean
}

const [useFederalTaxes, FederalTaxesProvider] = createCompoundContext<FederalTaxesContextType>('FederalTaxes')

export { useFederalTaxes, FederalTaxesProvider }
