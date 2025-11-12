import { useState, useMemo } from 'react'
import { usePayrollsListSuspense } from '@gusto/embedded-api/react-query/payrollsList'
import { usePayrollsCancelMutation } from '@gusto/embedded-api/react-query/payrollsCancel'
import { ProcessingStatuses } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'
import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import { getPayrollType, getPayrollStatus, calculateTotalPayroll } from '../helpers'
import type { PayrollType } from '../PayrollList/types'
import { PayrollHistoryPresentation } from './PayrollHistoryPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { usePagination } from '@/hooks/usePagination'

export type PayrollHistoryStatus =
  | 'Unprocessed'
  | 'Submitted'
  | 'Pending'
  | 'Paid'
  | 'Complete'
  | 'In progress'

export type TimeFilterOption = '3months' | '6months' | 'year'

const DEFAULT_ITEMS_PER_PAGE = 10

export interface PayrollHistoryItem {
  id: string
  payPeriod: string
  type: PayrollType
  payDate: string
  status: PayrollHistoryStatus
  amount?: number
  payroll: Payroll
}

export interface PayrollHistoryProps extends BaseComponentInterface<'Payroll.PayrollHistory'> {
  companyId: string
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

const mapPayrollToHistoryItem = (
  payroll: Payroll,
  dateFormatter: ReturnType<typeof useDateFormatter>,
): PayrollHistoryItem => {
  return {
    id: payroll.payrollUuid || payroll.uuid!,
    payPeriod: dateFormatter.formatPayPeriodRange(
      payroll.payPeriod?.startDate,
      payroll.payPeriod?.endDate,
    ),
    type: getPayrollType(payroll),
    payDate: dateFormatter.formatShortWithYear(payroll.checkDate),
    status: getPayrollStatus(payroll),
    amount: calculateTotalPayroll(payroll),
    payroll,
  }
}

export const Root = ({ onEvent, companyId, dictionary }: PayrollHistoryProps) => {
  useComponentDictionary('Payroll.PayrollHistory', dictionary)
  useI18n('Payroll.PayrollHistory')

  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilterOption>('3months')
  const [cancelDialogItem, setCancelDialogItem] = useState<PayrollHistoryItem | null>(null)
  const dateFormatter = useDateFormatter()
  const { baseSubmitHandler } = useBase()

  const { page, per } = usePagination({
    defaultItemsPerPage: DEFAULT_ITEMS_PER_PAGE,
  })

  const dateRange = useMemo(() => getDateRangeForFilter(selectedTimeFilter), [selectedTimeFilter])

  const { data: payrollsData, isFetching } = usePayrollsListSuspense({
    companyId,
    processingStatuses: [ProcessingStatuses.Processed],
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    include: ['totals'],
    page,
    per,
  })

  const { pagination: paginationWithMetadata } = usePagination({
    httpMeta: payrollsData.httpMeta,
    isFetching,
    defaultItemsPerPage: DEFAULT_ITEMS_PER_PAGE,
  })

  const { mutateAsync: cancelPayroll, isPending: isCancelling } = usePayrollsCancelMutation()

  const payrollHistory =
    payrollsData.payrollList?.map(payroll => mapPayrollToHistoryItem(payroll, dateFormatter)) || []

  const handleViewSummary = (payrollId: string) => {
    onEvent(componentEvents.RUN_PAYROLL_SUMMARY_VIEWED, { payrollId })
  }

  const handleViewReceipt = (payrollId: string) => {
    onEvent(componentEvents.RUN_PAYROLL_RECEIPT_VIEWED, { payrollId })
  }

  const handleCancelPayroll = async (payrollId: string) => {
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
      pagination={paginationWithMetadata}
      isFetching={isFetching}
    />
  )
}
