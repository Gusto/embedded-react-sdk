import { useContractorsGet } from '@gusto/embedded-api/react-query/contractorsGet'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/**
 * Options for {@link useContractorProfileSummary}.
 *
 * @public
 */
export interface UseContractorProfileSummaryParams {
  /** The associated contractor identifier. */
  contractorId: string
}

type UseContractorProfileSummaryReady = BaseHookReady<
  { contractor: Contractor },
  { isFetching: boolean; isPending: boolean }
>

/**
 * Return type of {@link useContractorProfileSummary}.
 *
 * @public
 */
export type UseContractorProfileSummaryResult = HookLoadingResult | UseContractorProfileSummaryReady

/**
 * Read-only data hook for the basic-details contractor Profile card.
 *
 * @remarks
 * Fetches a single contractor record scoped to the fields the basic-details
 * surface displays. Pair with {@link useContractorDetailsForm} to render an
 * edit form against the same record.
 *
 * @param input - See {@link UseContractorProfileSummaryParams}.
 * @returns A {@link HookLoadingResult} while loading, or the ready result with the loaded contractor once available.
 * @public
 *
 * @example
 * ```tsx
 * import { useContractorProfileSummary } from '@gusto/embedded-react-sdk'
 *
 * function ProfileSummary({ contractorId }: { contractorId: string }) {
 *   const summary = useContractorProfileSummary({ contractorId })
 *
 *   if (summary.isLoading) return <div>Loading...</div>
 *
 *   const { contractor } = summary.data
 *   return <h2>{contractor.firstName} {contractor.lastName}</h2>
 * }
 * ```
 */
export function useContractorProfileSummary({
  contractorId,
}: UseContractorProfileSummaryParams): UseContractorProfileSummaryResult {
  const contractorQuery = useContractorsGet(
    { contractorUuid: contractorId },
    { staleTime: Infinity },
  )

  const errorHandling = composeErrorHandler([contractorQuery])

  const contractor = contractorQuery.data?.contractor

  if (contractorQuery.isLoading || !contractor) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: { contractor },
    status: {
      isFetching: contractorQuery.isFetching,
      isPending: false,
    },
    errorHandling,
  }
}
