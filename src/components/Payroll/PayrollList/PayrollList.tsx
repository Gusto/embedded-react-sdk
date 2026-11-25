import { useState, type ErrorInfo } from 'react'
import {
  OffCycleReasonType,
  type Payroll,
} from '@gusto/embedded-api/models/components/unprocessedpayroll'
import { PayrollListPresentation } from './PayrollListPresentation'
import { usePayrollList } from './shared/usePayrollList'
import type { BaseComponentInterface } from '@/components/Base'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { componentEvents } from '@/shared/constants'
import { useObservability } from '@/contexts/ObservabilityProvider/useObservability'
import { normalizeToSDKError, type SDKError } from '@/types/sdkError'

/**
 * Props for {@link PayrollList}.
 *
 * @public
 */
export interface PayrollListBlockProps extends BaseComponentInterface<never> {
  /** The associated company identifier. */
  companyId: string
  /** Whether to show the off-cycle payroll call-to-action. Defaults to `true`. */
  withOffcyclePayroll?: boolean
}

const COMPONENT_NAME = 'Payroll.PayrollList'

function toThrowable(error: SDKError): unknown {
  return error.raw instanceof Error ? error.raw : new Error(error.message)
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
 * Data fetching, filtering, pagination, and the skip and delete actions come from
 * {@link usePayrollList}; use that hook directly to build this screen with your own layout.
 *
 * When the company has unprocessed transition pay periods within the next
 * 90 days, the Run Payroll action on Regular rows is disabled to prevent a
 * regular payroll from being run before the transition is resolved. Off-cycle
 * rows, including transition payroll rows, and the Run off-cycle action stay
 * enabled.
 *
 * Running a transition payroll row emits `transition/payrollSelected` instead
 * of `runPayroll/selected`. Handle it by rendering
 * {@link TransitionConfiguration} with the event's `payrollUuid` as
 * `payrollId`, then render {@link PayrollExecutionFlow} for the same payroll on
 * `transition/configured`. {@link PayrollLanding} also shows an alert that lets
 * users run or skip each pending transition payroll. When using `PayrollList`
 * directly, give users a way to run or skip those payrolls alongside it.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `runPayroll/selected` | User selected a payroll to run | `{ payrollUuid, payPeriod }` |
 * | `transition/payrollSelected` | User selected a transition payroll to run | `{ payrollUuid, payPeriod }` |
 * | `payroll/review` | User selected a calculated payroll to review and submit | `{ payrollUuid, payPeriod }` |
 * | `payroll/skipped` | A payroll was successfully skipped | `{ payrollId, payroll }` |
 * | `payroll/deleted` | A cancellable off-cycle payroll was successfully deleted | `{ payrollId, payroll }` |
 * | `runPayroll/offCycle/start` | User clicked the Run off-cycle call-to-action | — |
 *
 * @param props - See {@link PayrollListBlockProps}.
 * @returns The rendered payroll list.
 * @public
 */
export function PayrollList({
  FallbackComponent,
  LoaderComponent,
  ...props
}: PayrollListBlockProps) {
  const { observability } = useObservability()

  const onErrorBoundaryError = (boundaryError: unknown, errorInfo: ErrorInfo) => {
    props.onEvent(componentEvents.ERROR, boundaryError)

    observability?.onError?.({
      ...normalizeToSDKError(boundaryError),
      timestamp: Date.now(),
      componentName: COMPONENT_NAME,
      componentStack: errorInfo.componentStack ?? undefined,
    })
  }

  return (
    <BaseBoundaries
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
      componentName={COMPONENT_NAME}
      onErrorBoundaryError={onErrorBoundaryError}
    >
      <Root LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}

function Root({
  companyId,
  onEvent,
  withOffcyclePayroll = true,
  LoaderComponent,
  className,
}: Omit<PayrollListBlockProps, 'FallbackComponent'>) {
  const payrollList = usePayrollList({ companyId })
  const [showSkipSuccessAlert, setShowSkipSuccessAlert] = useState(false)
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false)

  const { errors } = payrollList.errorHandling

  if (payrollList.isLoading) {
    // Nothing rendered yet, so a failed query has no surface to show an alert against.
    // Throw it to the boundary above, which emits `componentEvents.ERROR` and renders
    // `FallbackComponent`.
    const [loadError] = errors
    if (loadError) throw toThrowable(loadError)

    return <BaseLayout isLoading LoaderComponent={LoaderComponent} />
  }

  const onRunPayroll = ({ payrollUuid, payPeriod }: Pick<Payroll, 'payrollUuid' | 'payPeriod'>) => {
    const payroll = payrollList.data.payrolls.find(item => item.payrollUuid === payrollUuid)
    const isTransitionPayroll =
      payroll?.offCycleReason === OffCycleReasonType.TransitionFromOldPaySchedule

    onEvent(
      isTransitionPayroll
        ? componentEvents.TRANSITION_PAYROLL_SELECTED
        : componentEvents.RUN_PAYROLL_SELECTED,
      { payrollUuid, payPeriod },
    )
  }

  const onSkipPayroll = async ({ payrollUuid }: Pick<Payroll, 'payrollUuid'>) => {
    if (!payrollUuid) return

    const result = await payrollList.actions.onSkip(payrollUuid)
    if (!result) return

    setShowSkipSuccessAlert(true)
    onEvent(componentEvents.PAYROLL_SKIPPED, result.data)
  }

  const onDeletePayroll = async ({ payrollUuid }: Pick<Payroll, 'payrollUuid'>) => {
    if (!payrollUuid) return

    const result = await payrollList.actions.onDelete(payrollUuid)
    if (!result) return

    setShowDeleteSuccessAlert(true)
    onEvent(componentEvents.PAYROLL_DELETED, result.data)
  }

  return (
    <BaseLayout error={errors} LoaderComponent={LoaderComponent}>
      <PayrollListPresentation
        className={className}
        payrolls={payrollList.data.payrolls}
        pagination={payrollList.pagination}
        paySchedules={payrollList.data.paySchedules}
        onRunPayroll={onRunPayroll}
        onSubmitPayroll={({ payrollUuid, payPeriod }) => {
          onEvent(componentEvents.REVIEW_PAYROLL, { payrollUuid, payPeriod })
        }}
        onSkipPayroll={onSkipPayroll}
        onDeletePayroll={onDeletePayroll}
        onRunOffCyclePayroll={() => {
          onEvent(componentEvents.RUN_OFF_CYCLE_PAYROLL)
        }}
        showSkipSuccessAlert={showSkipSuccessAlert}
        onDismissSkipSuccessAlert={() => {
          setShowSkipSuccessAlert(false)
        }}
        showDeleteSuccessAlert={showDeleteSuccessAlert}
        onDismissDeleteSuccessAlert={() => {
          setShowDeleteSuccessAlert(false)
        }}
        skippingPayrollId={payrollList.status.skippingPayrollId}
        deletingPayrollId={payrollList.status.deletingPayrollId}
        blockers={payrollList.data.blockers}
        wireInRequests={payrollList.data.wireInRequests}
        dateRangeFilter={payrollList.dateRangeFilter}
        hasUnprocessedTransitions={payrollList.status.hasUnprocessedTransitions}
        withOffcyclePayroll={withOffcyclePayroll}
      />
    </BaseLayout>
  )
}
