import * as v from 'valibot'
import type { FederalTaxDetails } from '@gusto/embedded-api/models/components/federaltaxdetails'
import {
  FilingForm,
  TaxPayerType,
} from '@gusto/embedded-api/models/operations/putv1companiescompanyidfederaltaxdetails'
import { createCompoundContext } from '@/components/Base'
import type { RequireAtLeastOne } from '@/types/Helpers'

export const FederalTaxFormSchema = v.object({
  federalEin: v.optional(v.string()),
  taxPayerType: v.optional(
    v.union(Object.values(TaxPayerType).map(taxPayerType => v.literal(taxPayerType))),
  ),
  filingForm: v.optional(
    v.union(Object.values(FilingForm).map(filingForm => v.literal(filingForm))),
  ),
  legalName: v.pipe(v.string(), v.nonEmpty()),
})

export type FederalTaxFormInputs = v.InferInput<typeof FederalTaxFormSchema>

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
