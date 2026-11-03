import { useIndustrySelectionGet } from '@gusto/embedded-api/react-query/industrySelectionGet'
import type { GetV1CompanyIndustryResponse } from '@gusto/embedded-api/models/operations/getv1companyindustry'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

type CompanyIndustry = NonNullable<GetV1CompanyIndustryResponse['industry']>

/**
 * Parameters accepted by {@link useCompanyIndustrySummary}.
 *
 * @internal
 */
export interface UseCompanyIndustrySummaryParams {
  /** UUID of the company whose industry classification is being read. */
  companyId: string
}

type UseCompanyIndustrySummaryReady = BaseHookReady<
  { industry: CompanyIndustry | undefined },
  { isFetching: boolean; isPending: boolean }
>

/**
 * Discriminated union returned by {@link useCompanyIndustrySummary} — either the loading state or the ready state carrying the loaded industry classification.
 *
 * @internal
 */
export type UseCompanyIndustrySummaryResult = HookLoadingResult | UseCompanyIndustrySummaryReady

/**
 * Read-only data hook for the company Industry management card. Wraps
 * `useIndustrySelectionGet` and returns the loaded industry classification.
 * Mutations live in `CompanyOnboarding.Industry`.
 *
 * @param params - See {@link UseCompanyIndustrySummaryParams}.
 * @returns See {@link UseCompanyIndustrySummaryResult}.
 * @internal
 */
export function useCompanyIndustrySummary({
  companyId,
}: UseCompanyIndustrySummaryParams): UseCompanyIndustrySummaryResult {
  const industryQuery = useIndustrySelectionGet({ companyId }, { staleTime: Infinity })

  const errorHandling = composeErrorHandler([industryQuery])

  if (industryQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: { industry: industryQuery.data?.industry },
    status: {
      isFetching: industryQuery.isFetching,
      isPending: false,
    },
    errorHandling,
  }
}
