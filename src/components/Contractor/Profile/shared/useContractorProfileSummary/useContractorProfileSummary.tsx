import { useContractorsGet } from '@gusto/embedded-api/react-query/contractorsGet'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'

/**
 * Parameters for {@link useContractorProfileSummary}.
 *
 * @public
 */
export interface UseContractorProfileSummaryParams {
  /** The associated contractor identifier. */
  contractorId: string
}

/**
 * Ready-state shape returned by {@link useContractorProfileSummary} once the contractor has loaded.
 *
 * @public
 * @interface
 */
export type UseContractorProfileSummaryReady = BaseHookReady<
  { contractor: Contractor },
  { isFetching: boolean; isPending: boolean }
>

/**
 * Result of {@link useContractorProfileSummary} — a discriminated union of loading and ready states.
 *
 * @public
 */
export type UseContractorProfileSummaryResult = HookLoadingResult | UseContractorProfileSummaryReady

/**
 * Standalone data hook for a contractor's profile.
 *
 * @remarks
 * Read-only. Editing a contractor's profile goes through `useContractorDetailsForm`, so this hook
 * exposes no actions.
 *
 * The whole `Contractor` entity is returned rather than a narrowed projection, because which fields
 * identify a contractor depends on their type: an individual carries `firstName`/`lastName`, a
 * business carries `businessName`, and `type` discriminates the two.
 *
 * `status.isPending` is always `false` — it is present so the status shape matches the other
 * contractor summary hooks, one of which does run a mutation.
 *
 * @param params - See {@link UseContractorProfileSummaryParams}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseContractorProfileSummaryReady} once the contractor has arrived.
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
 *
 *   return (
 *     <dl>
 *       <dt>Name</dt>
 *       <dd>
 *         {contractor.businessName ?? [contractor.firstName, contractor.lastName].join(' ')}
 *       </dd>
 *       <dt>Start date</dt>
 *       <dd>{contractor.startDate}</dd>
 *     </dl>
 *   )
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

  const contractor = contractorQuery.data?.contractorShow

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
