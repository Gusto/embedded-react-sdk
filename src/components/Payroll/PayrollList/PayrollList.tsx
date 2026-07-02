import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  usePayrollsListSuspense,
  invalidateAllPayrollsList,
} from '@gusto/embedded-api-v-2026-02-01/react-query/payrollsList'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/paySchedulesGetAll'
import { usePayrollsSkipMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/payrollsSkip'
import { usePayrollsDeleteMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/payrollsDelete'
import { usePayrollsGetBlockersSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/payrollsGetBlockers'
import { useWireInRequestsListSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/wireInRequestsList'
import { PayrollType } from '@gusto/embedded-api-v-2026-02-01/models/operations/postcompaniespayrollskipcompanyuuid'
import {
  ProcessingStatuses,
  QueryParamPayrollTypes,
} from '@gusto/embedded-api-v-2026-02-01/models/operations/getv1companiescompanyidpayrolls'
import type { Payroll } from '@gusto/embedded-api-v-2026-02-01/models/components/payroll'
import type { ApiPayrollBlocker } from '../PayrollBlocker/payrollHelpers'
import { useUnprocessedTransitionPayPeriods } from '../useUnprocessedTransitionPayPeriods'
import { PayrollListPresentation } from './PayrollListPresentation'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseComponent, useBase } from '@/components/Base'
import { componentEvents } from '@/shared/constants'
import { usePagination } from '@/hooks/usePagination/usePagination'
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter/useDateRangeFilter'

/**
 * Props for {@link PayrollList}.
 *
 * @public
 */
export interface PayrollListBlockProps extends BaseComponentInterface<never> {
  /** The associated company identifier. */
  companyId: string
}

/**
 * Lists upcoming payrolls and lets users start running them.
 *
 * Displays available payrolls with pay period dates, payroll type, check date,
 * deadline, and status. Each row offers actions to run, submit a calculated
 * payroll, skip, or delete (for cancellable off-cycle payrolls). A separate
 * call-to-action starts an off-cycle payroll.
 *
 * @remarks
 * When the company has unprocessed transition pay periods within the next
 * 90 days, the Run Payroll action on Regular rows is disabled to prevent a
 * regular payroll from being run before the transition is resolved. Off-cycle
 * rows and the Run off-cycle action remain enabled, since off-cycle is the
 * path used to run a transition payroll. {@link PayrollLanding} pairs this
 * list with an alert that lets users run or skip the pending transition; when
 * using `PayrollList` directly, render an equivalent resolution surface
 * alongside it.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `runPayroll/selected` | User selected a payroll to run | `{ payrollUuid, payPeriod }` |
 * | `payroll/review` | User selected a calculated payroll to review and submit | `{ payrollUuid, payPeriod }` |
 * | `payroll/skipped` | A payroll was successfully skipped | `{ payrollId }` |
 * | `payroll/deleted` | A cancellable off-cycle payroll was successfully deleted | `{ payrollId }` |
 * | `runPayroll/offCycle/start` | User clicked the Run off-cycle call-to-action | — |
 *
 * @param props - See {@link PayrollListBlockProps}.
 * @returns The rendered payroll list.
 * @public
 */
export function PayrollList(props: PayrollListBlockProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

const FUTURE_LOOKAHEAD_MONTHS = 3

const getFutureEndDate = (): string => {
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + FUTURE_LOOKAHEAD_MONTHS)
  return endDate.toISOString().split('T')[0]!
}

const Root = ({ companyId, onEvent }: PayrollListBlockProps) => {
  const { baseSubmitHandler } = useBase()
  const queryClient = useQueryClient()
  const [showSkipSuccessAlert, setShowSkipSuccessAlert] = useState(false)
  const [skippingPayrollId, setSkippingPayrollId] = useState<string | null>(null)
  const { currentPage, itemsPerPage, getPaginationProps, resetPage } = usePagination()
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false)
  const [deletingPayrollId, setDeletingPayrollId] = useState<string | null>(null)

  const dateRangeFilter = useDateRangeFilter({
    onFilterChange: useCallback(() => {
      resetPage()
    }, [resetPage]),
  })
  const dateFilterParams = dateRangeFilter.getApiDateParams()

  const { data: payrollsData } = usePayrollsListSuspense({
    companyId,
    processingStatuses: [ProcessingStatuses.Unprocessed],
    startDate: dateFilterParams.startDate,
    endDate: dateFilterParams.endDate ?? getFutureEndDate(),
    payrollTypes: [
      QueryParamPayrollTypes.Regular,
      QueryParamPayrollTypes.OffCycle,
      QueryParamPayrollTypes.External,
    ],
    includeOffCycle: true,
    page: currentPage,
    per: itemsPerPage,
  })
  const payrollList = payrollsData.payrollList!
  const paginationProps = getPaginationProps(payrollsData.httpMeta.response.headers)
  const { data: paySchedulesData } = usePaySchedulesGetAllSuspense({
    companyId,
  })
  const paySchedulesList = paySchedulesData.payScheduleShowResponse!

  const { data: blockersData } = usePayrollsGetBlockersSuspense({
    companyUuid: companyId,
  })

  const payrollBlockerList = blockersData.payrollBlockers ?? []

  const blockers: ApiPayrollBlocker[] = payrollBlockerList.map(
    (blocker: { key?: string; message?: string }) => ({
      key: blocker.key ?? 'unknown',
      message: blocker.message,
    }),
  )

  const { data: wireInRequestsData } = useWireInRequestsListSuspense({
    companyUuid: companyId,
  })

  const wireInRequests = wireInRequestsData.wireInRequestList ?? []

  const { hasUnprocessedTransitions } = useUnprocessedTransitionPayPeriods(companyId)

  const { mutateAsync: skipPayroll } = usePayrollsSkipMutation()
  const { mutateAsync: deletePayrollMutation } = usePayrollsDeleteMutation()

  const onRunPayroll = ({ payrollUuid, payPeriod }: Pick<Payroll, 'payrollUuid' | 'payPeriod'>) => {
    onEvent(componentEvents.RUN_PAYROLL_SELECTED, { payrollUuid, payPeriod })
  }
  const onRunOffCyclePayroll = () => {
    onEvent(componentEvents.RUN_OFF_CYCLE_PAYROLL)
  }
  const onSubmitPayroll = ({
    payrollUuid,
    payPeriod,
  }: Pick<Payroll, 'payrollUuid' | 'payPeriod'>) => {
    onEvent(componentEvents.REVIEW_PAYROLL, { payrollUuid, payPeriod })
  }
  const onSkipPayroll = async ({ payrollUuid }: Pick<Payroll, 'payrollUuid'>) => {
    const payroll = payrollList.find(payroll => payroll.payrollUuid === payrollUuid)

    if (payroll?.payPeriod) {
      setSkippingPayrollId(payrollUuid!)
      const payrollType =
        payroll.offCycleReason === 'Transition from old pay schedule'
          ? PayrollType.TransitionFromOldPaySchedule
          : PayrollType.Regular

      await baseSubmitHandler({}, async () => {
        await skipPayroll({
          request: {
            companyUuid: companyId,
            requestBody: {
              payrollType,
              startDate: payroll.payPeriod?.startDate,
              endDate: payroll.payPeriod?.endDate,
              payScheduleUuid: payroll.payPeriod?.payScheduleUuid ?? undefined,
            },
          },
        })

        setShowSkipSuccessAlert(true)
        onEvent(componentEvents.PAYROLL_SKIPPED, { payrollId: payrollUuid })
      })
      setSkippingPayrollId(null)
    }
  }

  const onDeletePayroll = async ({ payrollUuid }: Pick<Payroll, 'payrollUuid'>) => {
    if (payrollUuid) {
      setDeletingPayrollId(payrollUuid)
      await baseSubmitHandler({}, async () => {
        await deletePayrollMutation({
          request: { companyId, payrollId: payrollUuid },
        })
        await invalidateAllPayrollsList(queryClient)
        setShowDeleteSuccessAlert(true)
        onEvent(componentEvents.PAYROLL_DELETED, { payrollId: payrollUuid })
      })
      setDeletingPayrollId(null)
    }
  }

  return (
    <PayrollListPresentation
      payrolls={payrollList}
      pagination={paginationProps}
      paySchedules={paySchedulesList}
      onRunPayroll={onRunPayroll}
      onSubmitPayroll={onSubmitPayroll}
      onSkipPayroll={onSkipPayroll}
      onDeletePayroll={onDeletePayroll}
      onRunOffCyclePayroll={onRunOffCyclePayroll}
      showSkipSuccessAlert={showSkipSuccessAlert}
      onDismissSkipSuccessAlert={() => {
        setShowSkipSuccessAlert(false)
      }}
      showDeleteSuccessAlert={showDeleteSuccessAlert}
      onDismissDeleteSuccessAlert={() => {
        setShowDeleteSuccessAlert(false)
      }}
      skippingPayrollId={skippingPayrollId}
      deletingPayrollId={deletingPayrollId}
      blockers={blockers}
      wireInRequests={wireInRequests}
      dateRangeFilter={dateRangeFilter}
      hasUnprocessedTransitions={hasUnprocessedTransitions}
    />
  )
}
