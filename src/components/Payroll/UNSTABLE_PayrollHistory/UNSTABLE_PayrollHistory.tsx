import { useState } from 'react'
import type { Payroll } from '@gusto/embedded-api/models/components/payrollshow'
import type { PayrollHistoryProps } from '../PayrollHistory/PayrollHistory'
import { PayrollHistoryPresentation } from '../PayrollHistory/PayrollHistoryPresentation'
import { usePayrollHistory } from '../PayrollHistory/shared/usePayrollHistory'
import { getPayrollHistoryId } from '../PayrollHistory/shared/payrollHistoryHelpers'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useObservability } from '@/contexts/ObservabilityProvider/useObservability'
import { normalizeToSDKError } from '@/types/sdkError'

/**
 * In-development hook-backed history selected by the `payrollHistoryHooks` unstable feature flag.
 *
 * @remarks
 * Consumes `usePayrollHistory` for fetching, filters, pagination, and cancellation.
 * Keeps the cancellation dialog, dictionary overrides, and existing events in the UI layer.
 * Not part of the public SDK export surface.
 *
 * @param props - The existing payroll history props.
 * @returns The hook-backed history with the existing presentation and event contract.
 * @internal
 */
export function UNSTABLE_PayrollHistory({
  FallbackComponent,
  LoaderComponent,
  ...props
}: PayrollHistoryProps) {
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

function Root({ companyId, onEvent, dictionary, className, LoaderComponent }: PayrollHistoryProps) {
  useComponentDictionary('Payroll.PayrollHistory', dictionary)
  useI18n('Payroll.PayrollHistory')
  const history = usePayrollHistory({ companyId, throwOnQueryError: true })
  const [cancelDialogItem, setCancelDialogItem] = useState<Payroll | null>(null)

  const onCancelPayroll = async (payroll: Payroll) => {
    if (history.isLoading) return
    try {
      const payrollId = getPayrollHistoryId(payroll)
      if (!payrollId) return
      await history.actions.onCancel(payrollId, result => {
        onEvent(componentEvents.RUN_PAYROLL_CANCELLED, result)
      })
    } finally {
      setCancelDialogItem(null)
    }
  }

  return (
    <BaseLayout
      isLoading={history.isLoading}
      error={history.errorHandling.errors}
      LoaderComponent={LoaderComponent}
    >
      {!history.isLoading && (
        <PayrollHistoryPresentation
          className={className}
          {...history.data}
          pagination={history.pagination}
          dateRangeFilter={history.dateRangeFilter}
          onViewSummary={(payrollId, startDate, endDate) => {
            onEvent(componentEvents.RUN_PAYROLL_SUMMARY_VIEWED, { payrollId, startDate, endDate })
          }}
          onViewReceipt={(payrollId, startDate, endDate) => {
            onEvent(componentEvents.RUN_PAYROLL_RECEIPT_VIEWED, { payrollId, startDate, endDate })
          }}
          onCancelPayroll={onCancelPayroll}
          cancelDialogItem={cancelDialogItem}
          onCancelDialogOpen={setCancelDialogItem}
          onCancelDialogClose={() => {
            setCancelDialogItem(null)
          }}
          isLoading={history.status.isPending}
        />
      )}
    </BaseLayout>
  )
}
