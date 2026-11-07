import { useFederalTaxDetailsGet } from '@gusto/embedded-api/react-query/federalTaxDetailsGet'
import type { FederalTaxDetails } from '@gusto/embedded-api/models/components/federaltaxdetails'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/**
 * Parameters accepted by {@link useCompanyFederalTaxesSummary}.
 *
 * @internal
 */
export interface UseCompanyFederalTaxesSummaryParams {
  /** UUID of the company whose federal tax details are being read. */
  companyId: string
}

type UseCompanyFederalTaxesSummaryReady = BaseHookReady<
  { federalTaxDetails: FederalTaxDetails | undefined },
  { isFetching: boolean; isPending: boolean }
>

/**
 * Discriminated union returned by {@link useCompanyFederalTaxesSummary} — either the loading state or the ready state carrying the company's federal tax details.
 *
 * @internal
 */
export type UseCompanyFederalTaxesSummaryResult =
  HookLoadingResult | UseCompanyFederalTaxesSummaryReady

/**
 * Read-only data hook for the company Federal taxes management card. Wraps
 * `useFederalTaxDetailsGet` and returns the loaded federal tax details.
 * Mutations live in `CompanyOnboarding.FederalTaxes`.
 *
 * @param params - See {@link UseCompanyFederalTaxesSummaryParams}.
 * @returns See {@link UseCompanyFederalTaxesSummaryResult}.
 * @internal
 */
export function useCompanyFederalTaxesSummary({
  companyId,
}: UseCompanyFederalTaxesSummaryParams): UseCompanyFederalTaxesSummaryResult {
  const federalTaxesQuery = useFederalTaxDetailsGet({ companyId }, { staleTime: Infinity })

  const errorHandling = composeErrorHandler([federalTaxesQuery])

  if (federalTaxesQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: { federalTaxDetails: federalTaxesQuery.data?.federalTaxDetails },
    status: {
      isFetching: federalTaxesQuery.isFetching,
      isPending: false,
    },
    errorHandling,
  }
}
