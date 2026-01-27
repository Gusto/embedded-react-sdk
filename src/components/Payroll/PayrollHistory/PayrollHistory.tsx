import { useState, useMemo } from 'react'
import { usePayrollsListSuspense } from '@gusto/embedded-api/react-query/payrollsList'
import { usePayrollsCancelMutation } from '@gusto/embedded-api/react-query/payrollsCancel'
import { useWireInRequestsListSuspense } from '@gusto/embedded-api/react-query/wireInRequestsList'
import { ProcessingStatuses } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'
import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import { PayrollHistoryPresentation } from './PayrollHistoryPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import type { InternalAlert } from '@/components/Contractor/Payments/types'

export type TimeFilterOption = '3months' | '6months' | 'year'

export interface PayrollHistoryProps extends BaseComponentInterface<'Payroll.PayrollHistory'> {
  companyId: string
  alerts?: InternalAlert[]
}

export function PayrollHistory(props: PayrollHistoryProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const getDateRangeForFilter = (
  filter: TimeFilterOption,
): { startDate: string; endDate: string } => {
  const now = new Date()
  const startDate = new Date()

  switch (filter) {
    case '3months':
      startDate.setMonth(now.getMonth() - 3)
      break
    case '6months':
      startDate.setMonth(now.getMonth() - 6)
      break
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1)
      break
  }

  return {
    startDate: startDate.toISOString().split('T')[0] || '',
    endDate: now.toISOString().split('T')[0] || '',
  }
}

export const Root = ({ onEvent, companyId, dictionary }: PayrollHistoryProps) => {
  useComponentDictionary('Payroll.PayrollHistory', dictionary)
  useI18n('Payroll.PayrollHistory')

  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilterOption>('3months')
  const [cancelDialogItem, setCancelDialogItem] = useState<Payroll | null>(null)
  const { baseSubmitHandler } = useBase()

  const dateRange = useMemo(() => getDateRangeForFilter(selectedTimeFilter), [selectedTimeFilter])

  const { data: payrollsData } = usePayrollsListSuspense({
    companyId,
    processingStatuses: [ProcessingStatuses.Processed],
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    include: ['totals'],
  })

  const { data: wireInRequestsData } = useWireInRequestsListSuspense({
    companyUuid: companyId,
  })

  const wireInRequests = wireInRequestsData.wireInRequestList ?? []

  const { mutateAsync: cancelPayroll, isPending: isCancelling } = usePayrollsCancelMutation()

  const payrollHistory = payrollsData.payrollList || []

  const handleViewSummary = (payrollId: string, startDate?: string, endDate?: string) => {
    onEvent(componentEvents.RUN_PAYROLL_SUMMARY_VIEWED, { payrollId, startDate, endDate })
  }

  const handleViewReceipt = (payrollId: string, startDate?: string, endDate?: string) => {
    onEvent(componentEvents.RUN_PAYROLL_RECEIPT_VIEWED, { payrollId, startDate, endDate })
  }

  const handleCancelPayroll = async (item: Payroll) => {
    const payrollId = item.payrollUuid || item.uuid!
    try {
      await baseSubmitHandler(payrollId, async id => {
        const result = await cancelPayroll({
          request: {
            companyId,
            payrollId: id,
          },
        })

        onEvent(componentEvents.RUN_PAYROLL_CANCELLED, { payrollId: id, result })
      })
    } finally {
      setCancelDialogItem(null)
    }
  }

  return (
    <PayrollHistoryPresentation
      payrollHistory={payrollHistory}
      wireInRequests={wireInRequests}
      selectedTimeFilter={selectedTimeFilter}
      onTimeFilterChange={setSelectedTimeFilter}
      onViewSummary={handleViewSummary}
      onViewReceipt={handleViewReceipt}
      onCancelPayroll={handleCancelPayroll}
      cancelDialogItem={cancelDialogItem}
      onCancelDialogOpen={setCancelDialogItem}
      onCancelDialogClose={() => {
        setCancelDialogItem(null)
      }}
      isLoading={isCancelling}
    />
  )
}
