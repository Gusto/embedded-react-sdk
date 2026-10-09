import { useMemo } from 'react'
import { keepPreviousData } from '@tanstack/react-query'
import { usePayrollsList } from '@gusto/embedded-api/react-query/payrollsList'
import {
  usePayrollsCancelMutation,
  type PayrollsCancelMutationData,
} from '@gusto/embedded-api/react-query/payrollsCancel'
import { useWireInRequestsList } from '@gusto/embedded-api/react-query/wireInRequestsList'
import {
  ProcessingStatuses,
  QueryParamPayrollTypes,
  QueryParamSortOrder,
} from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'
import type { WireInRequest } from '@gusto/embedded-api/models/components/wireinrequest'
import type { Payroll } from '@gusto/embedded-api/models/components/payrollshow'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { usePagination } from '@/hooks/usePagination/usePagination'
import {
  useDateRangeFilter,
  type UseDateRangeFilterResult,
} from '@/hooks/useDateRangeFilter/useDateRangeFilter'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

/**
 * Inputs for the in-development payroll history hook.
 *
 * @internal
 */
export interface UsePayrollHistoryProps {
  companyId: string
  /**
   * Enables legacy component query behavior: payroll errors reach the boundary, while wire errors
   * do so only without cached data. Cached wire refresh errors are omitted from `errorHandling`.
   * Defaults to returning all query errors to headless consumers without throwing them.
   */
  throwOnQueryError?: boolean
}

/**
 * Cancellation result retaining the full API response used by the existing component event.
 *
 * @internal
 */
export interface PayrollHistoryCancelResult {
  payrollId: string
  result: PayrollsCancelMutationData
}

/**
 * Loaded historical payroll data, mutation state, and list controls.
 *
 * @internal
 */
export interface UsePayrollHistoryReady extends BaseHookReady<
  { payrollHistory: Payroll[]; wireInRequests: WireInRequest[] },
  { isPending: boolean }
> {
  pagination: PaginationControlProps
  dateRangeFilter: UseDateRangeFilterResult
  actions: {
    /** Runs the success callback inside submit error handling before returning the API response. */
    onCancel: (
      payrollId: string,
      onSuccess?: (result: PayrollHistoryCancelResult) => void,
    ) => Promise<PayrollHistoryCancelResult | undefined>
  }
}

/**
 * Fetches historical payrolls and cancels payrolls without rendering UI.
 *
 * @remarks
 * Queries processed payrolls with totals and status metadata in descending order. The date range
 * defaults to six months back through three months ahead. Previous rows remain visible during
 * pagination and filter changes. Cancellation runs an optional synchronous success callback within
 * submit error handling and returns the full API response after the callback completes. Handled
 * failures return `undefined` and appear in `errorHandling`; unexpected errors reach a React boundary.
 * Row rendering helpers consume the returned payrolls and wire requests without enriching API models.
 * This in-development hook is consumed by `UNSTABLE_PayrollHistory` and is not exported publicly.
 *
 * @param props - Company identifier and optional component-boundary query error behavior.
 * @returns Loading/error state or history rows, filters, pagination, cancellation, and pending state.
 * @internal
 */
export function usePayrollHistory({
  companyId,
  throwOnQueryError = false,
}: UsePayrollHistoryProps): HookLoadingResult | UsePayrollHistoryReady {
  const { error, setError, baseSubmitHandler } = useBaseSubmit()
  const { currentPage, itemsPerPage, getPaginationProps, resetPage } = usePagination()
  const initialDates = useMemo(() => {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 6)
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 3)
    return { startDate, endDate }
  }, [])
  const dateRangeFilter = useDateRangeFilter({
    initialStartDate: initialDates.startDate,
    initialEndDate: initialDates.endDate,
    onFilterChange: resetPage,
  })
  const payrollsQuery = usePayrollsList(
    {
      companyId,
      processingStatuses: [ProcessingStatuses.Processed],
      payrollTypes: [
        QueryParamPayrollTypes.Regular,
        QueryParamPayrollTypes.OffCycle,
        QueryParamPayrollTypes.External,
      ],
      includeOffCycle: true,
      include: ['totals', 'payroll_status_meta'],
      sortOrder: QueryParamSortOrder.Desc,
      ...dateRangeFilter.getApiDateParams(),
      page: currentPage,
      per: itemsPerPage,
    },
    { placeholderData: keepPreviousData, throwOnError: throwOnQueryError },
  )
  const wiresQuery = useWireInRequestsList(
    { companyUuid: companyId },
    { throwOnError: (_error, query) => throwOnQueryError && query.state.data === undefined },
  )
  const cancelMutation = usePayrollsCancelMutation()
  const errorHandling = composeErrorHandler(
    throwOnQueryError ? [payrollsQuery] : [payrollsQuery, wiresQuery],
    {
      submitError: error,
      setSubmitError: setError,
    },
  )

  const onCancel = async (
    payrollId: string,
    onSuccess?: (result: PayrollHistoryCancelResult) => void,
  ) => {
    let result: PayrollHistoryCancelResult | undefined
    await baseSubmitHandler(payrollId, async id => {
      const response = await cancelMutation.mutateAsync({ request: { companyId, payrollId: id } })
      const cancelledPayroll = { payrollId: id, result: response }
      onSuccess?.(cancelledPayroll)
      result = cancelledPayroll
    })
    return result
  }

  if (!payrollsQuery.data || !wiresQuery.data) return { isLoading: true, errorHandling }

  const wireInRequests = wiresQuery.data.wireInRequestList ?? []
  return {
    isLoading: false,
    data: {
      payrollHistory: payrollsQuery.data.payrollList ?? [],
      wireInRequests,
    },
    status: { isPending: cancelMutation.isPending },
    pagination: getPaginationProps(
      payrollsQuery.data.httpMeta.response.headers,
      payrollsQuery.isFetching,
    ),
    dateRangeFilter,
    actions: { onCancel },
    errorHandling,
  }
}
