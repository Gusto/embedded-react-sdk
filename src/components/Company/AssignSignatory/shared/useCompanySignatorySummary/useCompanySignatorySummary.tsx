import { useSignatoriesList } from '@gusto/embedded-api/react-query/signatoriesList'
import type { Signatory } from '@gusto/embedded-api/models/components/signatory'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/**
 * Parameters accepted by {@link useCompanySignatorySummary}.
 *
 * @internal
 */
export interface UseCompanySignatorySummaryParams {
  /** UUID of the company whose signatory is being read. */
  companyId: string
}

type UseCompanySignatorySummaryReady = BaseHookReady<
  { signatory: Signatory | undefined },
  { isFetching: boolean; isPending: boolean }
>

/**
 * Discriminated union returned by {@link useCompanySignatorySummary} — either the loading state or the ready state carrying the company's signatory.
 *
 * @internal
 */
export type UseCompanySignatorySummaryResult = HookLoadingResult | UseCompanySignatorySummaryReady

/**
 * Read-only data hook for the company Signatory management card. Wraps
 * `useSignatoriesList` and returns the company's signatory. Mutations live in
 * `CompanyOnboarding.AssignSignatory`.
 *
 * @param params - See {@link UseCompanySignatorySummaryParams}.
 * @returns See {@link UseCompanySignatorySummaryResult}.
 * @internal
 */
export function useCompanySignatorySummary({
  companyId,
}: UseCompanySignatorySummaryParams): UseCompanySignatorySummaryResult {
  const signatoriesQuery = useSignatoriesList({ companyUuid: companyId }, { staleTime: Infinity })

  const errorHandling = composeErrorHandler([signatoriesQuery])

  if (signatoriesQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    // A company has at most one signatory, so the list endpoint returns either an
    // empty array or a single record.
    data: { signatory: signatoriesQuery.data?.signatories?.[0] },
    status: {
      isFetching: signatoriesQuery.isFetching,
      isPending: false,
    },
    errorHandling,
  }
}
