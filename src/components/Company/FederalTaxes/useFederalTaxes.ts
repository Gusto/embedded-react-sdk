import { z } from 'zod'
import type { FederalTaxDetails } from '@gusto/embedded-api-v-2025-11-15/models/components/federaltaxdetails'
import {
  FilingForm,
  TaxPayerType,
} from '@gusto/embedded-api-v-2025-11-15/models/components/federaltaxdetails'
import { createCompoundContext } from '@/components/Base'
import type { RequireAtLeastOne } from '@/types/Helpers'

/** @internal */
export const FederalTaxFormSchema = z.object({
  federalEin: z.string().optional(),
  taxPayerType: z.enum(Object.values(TaxPayerType) as [string, ...string[]]).optional(),
  filingForm: z.enum(Object.values(FilingForm) as [string, ...string[]]).optional(),
  legalName: z.string().min(1),
})

/** @internal */
export type FederalTaxFormInputs = z.input<typeof FederalTaxFormSchema>

/**
 * Pre-populated values for the company federal tax form, supplied via {@link FederalTaxesProps}.
 * At least one of `taxPayerType`, `filingForm`, or `legalName` must be provided.
 *
 * @public
 */
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
