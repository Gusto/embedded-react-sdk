import { useContractorPaymentsGetV1ContractorsContractorUuidPayments } from '@gusto/embedded-api/react-query/contractorPaymentsGetV1ContractorsContractorUuidPayments'
import type { GetV1ContractorsContractorUuidPaymentsResponse } from '@gusto/embedded-api/models/operations/getv1contractorscontractoruuidpayments'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { usePagination } from '@/hooks/usePagination/usePagination'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'
import type {
  PaginationControlProps,
  PaginationItemsPerPage,
} from '@/components/Common/PaginationControl/PaginationControlTypes'

/**
 * A single payment entry returned by {@link useContractorPaymentsList}.
 *
 * @public
 */
export type ContractorPaymentHistoryEntry = NonNullable<
  GetV1ContractorsContractorUuidPaymentsResponse['contractorPaymentListings']
>[number]

/**
 * Parameters for {@link useContractorPaymentsList}.
 *
 * @public
 */
export interface UseContractorPaymentsListParams {
  /** The associated contractor identifier. */
  contractorId: string
  /** Items per page for the payments list. Defaults to 5. */
  defaultItemsPerPage?: PaginationItemsPerPage
}

/**
 * Ready-state shape returned by {@link useContractorPaymentsList} once the payments have loaded.
 *
 * @public
 */
export interface UseContractorPaymentsListReady extends BaseHookReady<
  { payments: ContractorPaymentHistoryEntry[] },
  { isFetching: boolean }
> {
  /** Pagination controls for the payments list. */
  pagination: { payments?: PaginationControlProps }
}

/**
 * Result of {@link useContractorPaymentsList} — a discriminated union of loading and ready states.
 *
 * @public
 */
export type UseContractorPaymentsListResult = HookLoadingResult | UseContractorPaymentsListReady

/**
 * Standalone data hook for a single contractor's payment history, most recent first.
 *
 * @remarks
 * Wraps the `get-v1-contractors-contractor_uuid-payments` query in the standard
 * {@link BaseHookReady} shape, sorted by `check_date:desc` and paginated via the
 * API's `x-total-pages` / `x-total-count` response headers. Read-only — this
 * hook exposes no actions.
 *
 * Note that this endpoint returns **cancelled payments alongside active ones**,
 * and its response carries no field distinguishing them (`status` is only
 * `Funded` or `Unfunded`), so cancelled payments cannot be filtered out here.
 *
 * @param params - See {@link UseContractorPaymentsListParams}.
 * @returns A {@link HookLoadingResult} while loading, or the ready state with `data.payments` once loaded.
 * @public
 *
 * @example
 * ```tsx
 * import { useContractorPaymentsList } from '@gusto/embedded-react-sdk'
 *
 * function ContractorPayments({ contractorId }: { contractorId: string }) {
 *   const result = useContractorPaymentsList({ contractorId })
 *
 *   if (result.isLoading) return <div>Loading...</div>
 *
 *   return (
 *     <ul>
 *       {result.data.payments.map(payment => (
 *         <li key={payment.uuid}>{payment.wageTotal}</li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */
export function useContractorPaymentsList({
  contractorId,
  defaultItemsPerPage = 5,
}: UseContractorPaymentsListParams): UseContractorPaymentsListResult {
  const { currentPage, itemsPerPage, getPaginationProps } = usePagination({ defaultItemsPerPage })

  // staleTime: Infinity — the SDK QueryClient invalidates on any mutation
  // success, so a long stale time avoids redundant refetches on remount.
  const paymentsQuery = useContractorPaymentsGetV1ContractorsContractorUuidPayments(
    {
      contractorUuid: contractorId,
      sortBy: 'check_date:desc',
      page: currentPage,
      per: itemsPerPage,
    },
    { staleTime: Infinity },
  )

  const paymentsHeaders = paymentsQuery.data?.httpMeta.response.headers
  const paymentsPagination = paymentsHeaders
    ? getPaginationProps(paymentsHeaders, paymentsQuery.isFetching)
    : undefined

  const errorHandling = composeErrorHandler([paymentsQuery])

  if (paymentsQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: { payments: paymentsQuery.data?.contractorPaymentListings ?? [] },
    status: { isFetching: paymentsQuery.isFetching },
    pagination: { payments: paymentsPagination },
    errorHandling,
  }
}
