import { useTaxRequirementsGetAll } from '@gusto/embedded-api/react-query/taxRequirementsGetAll'
import type { TaxRequirementStatesList } from '@gusto/embedded-api/models/components/taxrequirementstateslist'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/**
 * Parameters accepted by {@link useCompanyStateTaxesSummary}.
 *
 * @internal
 */
export interface UseCompanyStateTaxesSummaryParams {
  /** UUID of the company whose state tax requirements are being read. */
  companyId: string
}

type UseCompanyStateTaxesSummaryReady = BaseHookReady<
  { stateTaxRequirements: TaxRequirementStatesList[] },
  { isFetching: boolean; isPending: boolean }
>

/**
 * Discriminated union returned by {@link useCompanyStateTaxesSummary} — either the loading state or the ready state carrying the company's per-state tax requirements.
 *
 * @internal
 */
export type UseCompanyStateTaxesSummaryResult = HookLoadingResult | UseCompanyStateTaxesSummaryReady

/**
 * Read-only data hook for the company State taxes management card. Wraps
 * `useTaxRequirementsGetAll` and returns one entry per state the company has
 * tax requirements in, each carrying its setup status. Mutations live in
 * `CompanyOnboarding.StateTaxes`.
 *
 * @param params - See {@link UseCompanyStateTaxesSummaryParams}.
 * @returns See {@link UseCompanyStateTaxesSummaryResult}.
 * @internal
 */
export function useCompanyStateTaxesSummary({
  companyId,
}: UseCompanyStateTaxesSummaryParams): UseCompanyStateTaxesSummaryResult {
  const taxRequirementsQuery = useTaxRequirementsGetAll(
    { companyUuid: companyId },
    { staleTime: Infinity },
  )

  const errorHandling = composeErrorHandler([taxRequirementsQuery])

  if (taxRequirementsQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: {
      stateTaxRequirements: taxRequirementsQuery.data?.taxRequirementStatesList ?? [],
    },
    status: {
      isFetching: taxRequirementsQuery.isFetching,
      isPending: false,
    },
    errorHandling,
  }
}
