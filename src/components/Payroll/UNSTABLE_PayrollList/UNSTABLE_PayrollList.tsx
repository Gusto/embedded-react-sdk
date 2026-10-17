import { useState } from 'react'
import type { Payroll } from '@gusto/embedded-api/models/components/payrollshow'
import type { PayrollListBlockProps } from '../PayrollList/PayrollList'
import { PayrollListPresentation } from '../PayrollList/PayrollListPresentation'
import { usePayrollList } from '../PayrollList/shared/usePayrollList'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { componentEvents } from '@/shared/constants'
import { useObservability } from '@/contexts/ObservabilityProvider/useObservability'
import { normalizeToSDKError } from '@/types/sdkError'

/**
 * In-development hook-backed list selected by the `payrollListHooks` unstable feature flag.
 *
 * @remarks
 * Consumes `usePayrollList` for fetching, filters, pagination, skip, and delete. Keeps success
 * alerts and the existing events in the UI layer. Not part of the public SDK export surface.
 *
 * @param props - The existing payroll list props.
 * @returns The hook-backed list with the existing presentation and event contract.
 * @internal
 */
export function UNSTABLE_PayrollList({
  FallbackComponent,
  LoaderComponent,
  ...props
}: PayrollListBlockProps) {
  const { observability } = useObservability()
  return (
    <BaseBoundaries
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
      onErrorBoundaryError={(error, info) => {
        props.onEvent(componentEvents.ERROR, error)
        observability?.onError?.({
          ...normalizeToSDKError(error),
          timestamp: Date.now(),
          componentStack: info.componentStack ?? undefined,
        })
      }}
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
}: PayrollListBlockProps) {
  const list = usePayrollList({ companyId, throwOnQueryError: true })
  const [showSkipSuccessAlert, setShowSkipSuccessAlert] = useState(false)
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false)

  if (list.isLoading) {
    return (
      <BaseLayout isLoading error={list.errorHandling.errors} LoaderComponent={LoaderComponent} />
    )
  }

  const onSkipPayroll = async ({ payrollUuid }: Pick<Payroll, 'payrollUuid'>) => {
    if (!payrollUuid) return
    await list.actions.onSkip(payrollUuid, () => {
      setShowSkipSuccessAlert(true)
      onEvent(componentEvents.PAYROLL_SKIPPED, { payrollId: payrollUuid })
    })
  }

  const onDeletePayroll = async ({ payrollUuid }: Pick<Payroll, 'payrollUuid'>) => {
    if (!payrollUuid) return
    await list.actions.onDelete(payrollUuid, () => {
      setShowDeleteSuccessAlert(true)
      onEvent(componentEvents.PAYROLL_DELETED, { payrollId: payrollUuid })
    })
  }

  return (
    <BaseLayout error={list.errorHandling.errors} LoaderComponent={LoaderComponent}>
      <PayrollListPresentation
        className={className}
        payrolls={list.data.payrolls}
        pagination={list.pagination}
        paySchedules={list.data.paySchedules}
        onRunPayroll={({ payrollUuid, payPeriod }) => {
          onEvent(componentEvents.RUN_PAYROLL_SELECTED, { payrollUuid, payPeriod })
        }}
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
        skippingPayrollId={list.status.skippingPayrollId}
        deletingPayrollId={list.status.deletingPayrollId}
        blockers={list.data.blockers}
        wireInRequests={list.data.wireInRequests}
        dateRangeFilter={list.dateRangeFilter}
        hasUnprocessedTransitions={list.status.hasUnprocessedTransitions}
        withOffcyclePayroll={withOffcyclePayroll}
      />
    </BaseLayout>
  )
}
