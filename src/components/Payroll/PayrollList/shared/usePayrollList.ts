import { useMemo, useState } from 'react'
import { keepPreviousData } from '@tanstack/react-query'
import { usePayrollsList } from '@gusto/embedded-api/react-query/payrollsList'
import { usePaySchedulesGetAll } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePaySchedulesGetPayPeriods } from '@gusto/embedded-api/react-query/paySchedulesGetPayPeriods'
import { usePayrollsSkipMutation } from '@gusto/embedded-api/react-query/payrollsSkip'
import { usePayrollsDeleteMutation } from '@gusto/embedded-api/react-query/payrollsDelete'
import { usePayrollsGetBlockers } from '@gusto/embedded-api/react-query/payrollsGetBlockers'
import { useWireInRequestsList } from '@gusto/embedded-api/react-query/wireInRequestsList'
import { PayrollType } from '@gusto/embedded-api/models/operations/postcompaniespayrollskipcompanyuuid'
import {
  ProcessingStatuses,
  QueryParamPayrollTypes,
} from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'
import { PayrollTypes } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayperiods'
import type { Payroll } from '@gusto/embedded-api/models/components/payrollshow'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import type { PayPeriod } from '@gusto/embedded-api/models/components/payperiod'
import type { WireInRequest } from '@gusto/embedded-api/models/components/wireinrequest'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import type { ApiPayrollBlocker } from '../../PayrollBlocker/payrollHelpers'
import type { BaseHookReady, HookLoadingResult } from '@/partner-hook-utils/types'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { usePagination } from '@/hooks/usePagination/usePagination'
import {
  useDateRangeFilter,
  type UseDateRangeFilterResult,
} from '@/hooks/useDateRangeFilter/useDateRangeFilter'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

const FUTURE_LOOKAHEAD_MONTHS = 3
const TRANSITION_LOOK_AHEAD_DAYS = 90
const TRANSITION_OFF_CYCLE_REASON = 'Transition from old pay schedule'

/**
 * Inputs for the in-development payroll list hook.
 *
 * @internal
 */
export interface UsePayrollListProps {
  companyId: string
  /**
   * Enables legacy component query behavior: payroll list errors reach the component boundary,
   * and supporting-query errors do so only without cached data. Defaults to returning all query
   * errors to headless consumers through `errorHandling` without throwing them.
   */
  throwOnQueryError?: boolean
}

/**
 * Loaded unprocessed payrolls, supporting company data, mutation state, and list controls.
 *
 * @internal
 */
export interface UsePayrollListReady extends BaseHookReady<
  {
    payrolls: Payroll[]
    paySchedules: PayScheduleShow[]
    blockers: ApiPayrollBlocker[]
    wireInRequests: WireInRequest[]
  },
  {
    hasUnprocessedTransitions: boolean
    skippingPayrollId: string | null
    deletingPayrollId: string | null
  }
> {
  pagination: PaginationControlProps
  dateRangeFilter: UseDateRangeFilterResult
  actions: {
    /** Skips the payroll, running the optional success callback inside submit error handling. */
    onSkip: (payrollUuid: string, onSuccess?: () => void) => Promise<void>
    /** Deletes the cancellable off-cycle payroll, running the optional success callback inside submit error handling. */
    onDelete: (payrollId: string, onSuccess?: () => void) => Promise<void>
  }
}

/**
 * Fetches upcoming (unprocessed) payrolls and skips or deletes them without rendering UI.
 *
 * @remarks
 * Queries unprocessed regular, off-cycle, and external payrolls. The date range defaults to today
 * through three months ahead, and changing it returns pagination to the first page. Previous rows
 * remain visible during pagination and filter changes. `hasUnprocessedTransitions` reflects
 * unprocessed transition pay periods within the next 90 days. Handled mutation failures appear in
 * `errorHandling`; unexpected errors reach a React boundary. This in-development hook is consumed
 * by `UNSTABLE_PayrollList` and is not exported publicly.
 *
 * @param props - Company identifier and optional component-boundary query error behavior.
 * @returns Loading/error state or payrolls, company data, filters, pagination, and skip/delete actions.
 * @internal
 */
export function usePayrollList({
  companyId,
  throwOnQueryError = false,
}: UsePayrollListProps): HookLoadingResult | UsePayrollListReady {
  const { error, setError, baseSubmitHandler } = useBaseSubmit()
  const { currentPage, itemsPerPage, getPaginationProps, resetPage } = usePagination()
  const [skippingPayrollId, setSkippingPayrollId] = useState<string | null>(null)
  const [deletingPayrollId, setDeletingPayrollId] = useState<string | null>(null)

  const initialDates = useMemo(() => {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + FUTURE_LOOKAHEAD_MONTHS)
    return { startDate, endDate }
  }, [])
  const dateRangeFilter = useDateRangeFilter({
    initialStartDate: initialDates.startDate,
    initialEndDate: initialDates.endDate,
    onFilterChange: resetPage,
  })

  const transitionLookAheadEndDate = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + TRANSITION_LOOK_AHEAD_DAYS)
    return new RFCDate(date)
  }, [])

  const throwWithoutCachedData = (_error: Error, query: { state: { data: unknown } }) =>
    throwOnQueryError && query.state.data === undefined

  const payrollsQuery = usePayrollsList(
    {
      companyId,
      processingStatuses: [ProcessingStatuses.Unprocessed],
      payrollTypes: [
        QueryParamPayrollTypes.Regular,
        QueryParamPayrollTypes.OffCycle,
        QueryParamPayrollTypes.External,
      ],
      includeOffCycle: true,
      ...dateRangeFilter.getApiDateParams(),
      page: currentPage,
      per: itemsPerPage,
    },
    { placeholderData: keepPreviousData, throwOnError: throwOnQueryError },
  )
  const paySchedulesQuery = usePaySchedulesGetAll(
    { companyId },
    { throwOnError: throwWithoutCachedData },
  )
  const blockersQuery = usePayrollsGetBlockers(
    { companyUuid: companyId },
    { throwOnError: throwWithoutCachedData },
  )
  const wiresQuery = useWireInRequestsList(
    { companyUuid: companyId },
    { throwOnError: throwWithoutCachedData },
  )
  const transitionPayPeriodsQuery = usePaySchedulesGetPayPeriods(
    {
      companyId,
      payrollTypes: PayrollTypes.Transition,
      endDate: transitionLookAheadEndDate,
    },
    { throwOnError: throwWithoutCachedData },
  )

  const skipMutation = usePayrollsSkipMutation()
  const deleteMutation = usePayrollsDeleteMutation()

  const errorHandling = composeErrorHandler(
    throwOnQueryError
      ? []
      : [payrollsQuery, paySchedulesQuery, blockersQuery, wiresQuery, transitionPayPeriodsQuery],
    { submitError: error, setSubmitError: setError },
  )

  const payrolls = payrollsQuery.data?.payrollList ?? []

  const onSkip = async (payrollUuid: string, onSuccess?: () => void) => {
    const payroll = payrolls.find(item => item.payrollUuid === payrollUuid)
    if (!payroll?.payPeriod) return

    setSkippingPayrollId(payrollUuid)
    const payrollType =
      payroll.offCycleReason === TRANSITION_OFF_CYCLE_REASON
        ? PayrollType.TransitionFromOldPaySchedule
        : PayrollType.Regular

    try {
      await baseSubmitHandler({}, async () => {
        await skipMutation.mutateAsync({
          request: {
            companyUuid: companyId,
            requestBody: {
              payrollType,
              startDate: payroll.payPeriod?.startDate ?? undefined,
              endDate: payroll.payPeriod?.endDate ?? undefined,
              payScheduleUuid: payroll.payPeriod?.payScheduleUuid ?? undefined,
            },
          },
        })
        onSuccess?.()
      })
    } finally {
      setSkippingPayrollId(null)
    }
  }

  const onDelete = async (payrollId: string, onSuccess?: () => void) => {
    setDeletingPayrollId(payrollId)
    try {
      await baseSubmitHandler({}, async () => {
        await deleteMutation.mutateAsync({ request: { companyId, payrollId } })
        onSuccess?.()
      })
    } finally {
      setDeletingPayrollId(null)
    }
  }

  if (
    !payrollsQuery.data ||
    !paySchedulesQuery.data ||
    !blockersQuery.data ||
    !wiresQuery.data ||
    !transitionPayPeriodsQuery.data
  ) {
    return { isLoading: true, errorHandling }
  }

  const blockers: ApiPayrollBlocker[] = (blockersQuery.data.payrollBlockers ?? []).map(
    (blocker: { key?: string; message?: string }) => ({
      key: blocker.key ?? 'unknown',
      message: blocker.message,
    }),
  )
  const hasUnprocessedTransitions = (transitionPayPeriodsQuery.data.payPeriods ?? []).some(
    (payPeriod: PayPeriod) => !payPeriod.payroll?.processed,
  )

  return {
    isLoading: false,
    data: {
      payrolls,
      paySchedules: paySchedulesQuery.data.payScheduleShowResponse ?? [],
      blockers,
      wireInRequests: wiresQuery.data.wireInRequestList ?? [],
    },
    status: { hasUnprocessedTransitions, skippingPayrollId, deletingPayrollId },
    pagination: getPaginationProps(
      payrollsQuery.data.httpMeta.response.headers,
      payrollsQuery.isFetching,
    ),
    dateRangeFilter,
    actions: { onSkip, onDelete },
    errorHandling,
  }
}
