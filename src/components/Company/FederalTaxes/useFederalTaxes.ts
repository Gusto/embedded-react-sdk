import { z } from 'zod'
import type { FederalTaxDetails } from '@gusto/embedded-api/models/components/federaltaxdetails'
import {
  FilingForm,
  TaxPayerType,
} from '@gusto/embedded-api/models/operations/putv1companiescompanyidfederaltaxdetails'
import { createCompoundContext } from '@/components/Base'
import type { RequireAtLeastOne } from '@/types/Helpers'

export const FederalTaxFormSchema = z.object({
  federalEin: z.string().optional(),
  taxPayerType: z.enum(Object.values(TaxPayerType) as [string, ...string[]]).optional(),
  filingForm: z.enum(Object.values(FilingForm) as [string, ...string[]]).optional(),
  legalName: z.string().min(1),
})

export type FederalTaxFormInputs = z.input<typeof FederalTaxFormSchema>

export type FederalTaxesDefaultValues = RequireAtLeastOne<{
  taxPayerType?: FederalTaxFormInputs['taxPayerType']
  filingForm?: FederalTaxFormInputs['filingForm']
  legalName?: FederalTaxFormInputs['legalName']
}>

type FederalTaxesContextType = {
  isPending: boolean
  federalTaxDetails?: FederalTaxDetails
}

const [useFederalTaxes, FederalTaxesProvider] = createCompoundContext<FederalTaxesContextType>(
  'CompanyFederalTaxesContext',
)

export { useFederalTaxes, FederalTaxesProvider }
