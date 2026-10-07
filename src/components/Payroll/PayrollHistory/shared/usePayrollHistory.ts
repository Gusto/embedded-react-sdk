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
import { getPayrollHistoryDetails, type PayrollHistoryItem } from './payrollHistoryHelpers'
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
  /** Match the component's query boundaries, retaining cached wire data after refresh failures. */
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
 * Loaded historical payroll data, derived row values, mutation state, and list controls.
 *
 * @internal
 */
export interface UsePayrollHistoryReady extends BaseHookReady<
  { payrollHistory: PayrollHistoryItem[]; wireInRequests: WireInRequest[] },
  { isFetching: boolean; isPending: boolean }
> {
  pagination: PaginationControlProps
  dateRangeFilter: UseDateRangeFilterResult
  actions: {
    onCancel: (payrollId: string) => Promise<PayrollHistoryCancelResult | undefined>
  }
}

/**
 * Fetches historical payrolls, exposes row rendering data, and cancels payrolls without rendering UI.
 *
 * @remarks
 * Queries processed payrolls with totals and status metadata in descending order. The date range
 * defaults to six months back through three months ahead. Previous rows remain visible during
 * pagination and filter changes. Cancellation returns the full API response only after success;
 * handled failures return `undefined` and appear in `errorHandling`.
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

  const onCancel = async (payrollId: string) => {
    let result: PayrollHistoryCancelResult | undefined
    await baseSubmitHandler(payrollId, async id => {
      const response = await cancelMutation.mutateAsync({ request: { companyId, payrollId: id } })
      result = { payrollId: id, result: response }
    })
    return result
  }

  if (!payrollsQuery.data || !wiresQuery.data) return { isLoading: true, errorHandling }

  const wireInRequests = wiresQuery.data.wireInRequestList ?? []
  return {
    isLoading: false,
    data: {
      payrollHistory: (payrollsQuery.data.payrollList ?? []).map(payroll => ({
        ...payroll,
        historyDetails: getPayrollHistoryDetails(payroll, wireInRequests),
      })),
      wireInRequests,
    },
    status: { isFetching: payrollsQuery.isFetching, isPending: cancelMutation.isPending },
    pagination: getPaginationProps(
      payrollsQuery.data.httpMeta.response.headers,
      payrollsQuery.isFetching,
    ),
    dateRangeFilter,
    actions: { onCancel },
    errorHandling,
  }
}
