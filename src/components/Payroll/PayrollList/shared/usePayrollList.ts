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
import {
  OffCycleReasonType,
  type Payroll,
} from '@gusto/embedded-api/models/components/unprocessedpayroll'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payschedulelistitem'
import type { PayPeriod } from '@gusto/embedded-api/models/components/payperiod'
import type { WireInRequest } from '@gusto/embedded-api/models/components/wireinrequest'
import type { ApiPayrollBlocker } from '../../PayrollBlocker/payrollHelpers'
import type { BaseHookReady, HookLoadingResult, HookSubmitResult } from '@/partner-hook-utils/types'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { usePagination } from '@/hooks/usePagination/usePagination'
import {
  useDateRangeFilter,
  type UseDateRangeFilterResult,
} from '@/hooks/useDateRangeFilter/useDateRangeFilter'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { addDays, toRFCDate } from '@/helpers/dateFormatting'

const FUTURE_LOOKAHEAD_MONTHS = 3
const TRANSITION_LOOK_AHEAD_DAYS = 90

const getDefaultStartDate = (): Date => new Date()

const getDefaultEndDate = (): Date => {
  const date = new Date()
  date.setMonth(date.getMonth() + FUTURE_LOOKAHEAD_MONTHS)
  return date
}

/**
 * Props for {@link usePayrollList}.
 *
 * @public
 */
export interface UsePayrollListProps {
  /** The associated company identifier. */
  companyId: string
}

/**
 * Outcome of {@link UsePayrollListReady.actions | a skip or delete action} on a payroll.
 *
 * @remarks
 * Both endpoints reply with an empty body — `202 Accepted` for skip, `204 No Content` for
 * delete — so there is no server-returned entity to hand back. `payroll` is the record as it
 * appeared in the list when the action ran, which identifies what changed.
 *
 * @public
 */
export interface PayrollListActionResult {
  /** Identifier of the payroll the action applied to. */
  payrollId: string
  /** The payroll record the action applied to, as it appeared in the list beforehand. */
  payroll: Payroll
}

/**
 * Ready state of {@link usePayrollList}.
 *
 * @public
 */
export interface UsePayrollListReady extends BaseHookReady<
  {
    /** Unprocessed regular and off-cycle payrolls on the current page. */
    payrolls: Payroll[]
    /** The company's pay schedules, used to label each row's schedule. */
    paySchedules: PayScheduleShow[]
    /** Issues that must be resolved before any payroll can be run. */
    blockers: ApiPayrollBlocker[]
    /** Open wire-in requests, used to show funding status against a payroll. */
    wireInRequests: WireInRequest[]
  },
  {
    /** Whether the company has an unprocessed transition pay period within the next 90 days. */
    hasUnprocessedTransitions: boolean
    /** Identifier of the payroll currently being skipped, or `null` when no skip is in flight. */
    skippingPayrollId: string | null
    /** Identifier of the payroll currently being deleted, or `null` when no delete is in flight. */
    deletingPayrollId: string | null
  }
> {
  /** Pagination controls for the current page of payrolls. */
  pagination: PaginationControlProps
  /** Date range filter applied to the list; changing it returns pagination to the first page. */
  dateRangeFilter: UseDateRangeFilterResult
  /** Actions that change a payroll's state. */
  actions: {
    /**
     * Skips the payroll's pay period. Resolves to the result, or `undefined` when the payroll
     * has no pay period to skip or the request failed — read `errorHandling.errors` for why.
     */
    onSkip: (payrollId: string) => Promise<HookSubmitResult<PayrollListActionResult> | undefined>
    /**
     * Deletes a cancellable off-cycle payroll. Resolves to the result, or `undefined` when the
     * payroll is not on the current page or the request failed — read `errorHandling.errors`.
     */
    onDelete: (payrollId: string) => Promise<HookSubmitResult<PayrollListActionResult> | undefined>
  }
}

/**
 * Return type of {@link usePayrollList}.
 *
 * @public
 */
export type UsePayrollListResult = HookLoadingResult | UsePayrollListReady

/**
 * Fetches a company's upcoming (unprocessed) payrolls along with the pay schedules, blockers, and
 * wire-in requests needed to present them, and skips or deletes individual payrolls.
 *
 * @remarks
 * Queries unprocessed regular and off-cycle payrolls, including transition payrolls, which the API
 * returns as off-cycle with an `offCycleReason` of `Transition from old pay schedule`. The date
 * range is seeded with today through three months ahead and the end date cannot be moved past that
 * point; changing the range returns pagination to the first page. Previous rows stay rendered
 * while a new page or range loads, and `pagination.isFetching` flips to `true` during the request.
 *
 * `status.hasUnprocessedTransitions` reports whether a transition pay period falls within the next
 * 90 days. While one does, a regular payroll should not be run until the transition is resolved —
 * run or skip it through the off-cycle path first.
 *
 * Both actions resolve to `undefined` on failure rather than throwing; the error is added to
 * `errorHandling.errors`, which also carries any query error.
 *
 * @param props - See {@link UsePayrollListProps}.
 * @returns A {@link HookLoadingResult} while the first page is in flight, or a {@link UsePayrollListReady} once data has arrived.
 * @public
 *
 * @example
 * ```tsx
 * import { usePayrollList } from '@gusto/embedded-react-sdk'
 *
 * function UpcomingPayrolls({ companyId }: { companyId: string }) {
 *   const payrollList = usePayrollList({ companyId })
 *
 *   if (payrollList.isLoading) return <div>Loading...</div>
 *
 *   return (
 *     <ul>
 *       {payrollList.data.payrolls.map(({ payrollUuid, checkDate }) => {
 *         if (!payrollUuid) return null
 *
 *         return (
 *           <li key={payrollUuid}>
 *             {checkDate}
 *             <button
 *               disabled={payrollList.status.skippingPayrollId === payrollUuid}
 *               onClick={() => payrollList.actions.onSkip(payrollUuid)}
 *             >
 *               Skip
 *             </button>
 *           </li>
 *         )
 *       })}
 *     </ul>
 *   )
 * }
 * ```
 */
export function usePayrollList({ companyId }: UsePayrollListProps): UsePayrollListResult {
  const {
    error: submitError,
    setError: setSubmitError,
    baseSubmitHandler,
  } = useBaseSubmit('PayrollList')
  const { currentPage, itemsPerPage, getPaginationProps, resetPage } = usePagination()
  const [skippingPayrollId, setSkippingPayrollId] = useState<string | null>(null)
  const [deletingPayrollId, setDeletingPayrollId] = useState<string | null>(null)

  const dateRangeFilter = useDateRangeFilter({
    initialStartDate: getDefaultStartDate(),
    initialEndDate: getDefaultEndDate(),
    latestAllowedEndDate: getDefaultEndDate(),
    onFilterChange: resetPage,
  })

  const transitionLookAheadEndDate = useMemo(
    () => toRFCDate(addDays(new Date(), TRANSITION_LOOK_AHEAD_DAYS)),
    [],
  )

  const payrollsQuery = usePayrollsList(
    {
      companyId,
      processingStatuses: [ProcessingStatuses.Unprocessed],
      payrollTypes: [QueryParamPayrollTypes.Regular, QueryParamPayrollTypes.OffCycle],
      includeOffCycle: true,
      ...dateRangeFilter.getApiDateParams(),
      page: currentPage,
      per: itemsPerPage,
    },
    { placeholderData: keepPreviousData },
  )
  const paySchedulesQuery = usePaySchedulesGetAll({ companyId })
  const blockersQuery = usePayrollsGetBlockers({ companyUuid: companyId })
  const wiresQuery = useWireInRequestsList({ companyUuid: companyId })
  const transitionPayPeriodsQuery = usePaySchedulesGetPayPeriods({
    companyId,
    payrollTypes: PayrollTypes.Transition,
    endDate: transitionLookAheadEndDate,
  })

  const skipMutation = usePayrollsSkipMutation()
  const deleteMutation = usePayrollsDeleteMutation()

  const errorHandling = composeErrorHandler(
    [payrollsQuery, paySchedulesQuery, blockersQuery, wiresQuery, transitionPayPeriodsQuery],
    { submitError, setSubmitError },
  )

  const payrolls = payrollsQuery.data?.payrollList ?? []

  const onSkip = async (payrollId: string) => {
    const payroll = payrolls.find(item => item.payrollUuid === payrollId)
    if (!payroll?.payPeriod) return undefined

    const payrollType =
      payroll.offCycleReason === OffCycleReasonType.TransitionFromOldPaySchedule
        ? PayrollType.TransitionFromOldPaySchedule
        : PayrollType.Regular

    let result: HookSubmitResult<PayrollListActionResult> | undefined
    setSkippingPayrollId(payrollId)
    try {
      await baseSubmitHandler(payroll, async target => {
        await skipMutation.mutateAsync({
          request: {
            companyUuid: companyId,
            requestBody: {
              payrollType,
              startDate: target.payPeriod?.startDate ?? undefined,
              endDate: target.payPeriod?.endDate ?? undefined,
              payScheduleUuid: target.payPeriod?.payScheduleUuid ?? undefined,
            },
          },
        })
        result = { mode: 'update', data: { payrollId, payroll: target } }
      })
    } finally {
      setSkippingPayrollId(null)
    }
    return result
  }

  const onDelete = async (payrollId: string) => {
    const payroll = payrolls.find(item => item.payrollUuid === payrollId)
    if (!payroll) return undefined

    let result: HookSubmitResult<PayrollListActionResult> | undefined
    setDeletingPayrollId(payrollId)
    try {
      await baseSubmitHandler(payroll, async target => {
        await deleteMutation.mutateAsync({ request: { companyId, payrollId } })
        result = { mode: 'update', data: { payrollId, payroll: target } }
      })
    } finally {
      setDeletingPayrollId(null)
    }
    return result
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
