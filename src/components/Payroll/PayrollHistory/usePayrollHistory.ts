import { useState, useMemo } from 'react'
import { usePayrollsListSuspense } from '@gusto/embedded-api/react-query/payrollsList'
import { usePayrollsCancelMutation } from '@gusto/embedded-api/react-query/payrollsCancel'
import { useWireInRequestsListSuspense } from '@gusto/embedded-api/react-query/wireInRequestsList'
import { ProcessingStatuses } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'
import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import type { WireInRequest } from '@gusto/embedded-api/models/components/wireinrequest'
import type { TimeFilterOption } from './PayrollHistory'
import { componentEvents, type EventType } from '@/shared/constants'
import { useBase } from '@/components/Base/useBase'
import type { OnEventType } from '@/components/Base/useBase'
import { useI18n } from '@/i18n'

export interface UsePayrollHistoryParams {
  companyId: string
  onEvent: OnEventType<EventType, unknown>
}

export interface UsePayrollHistoryReturn {
  payrollHistory: Payroll[]
  wireInRequests: WireInRequest[]
  selectedTimeFilter: TimeFilterOption
  cancelDialogItem: Payroll | null
  isLoading: boolean
  onTimeFilterChange: (value: TimeFilterOption) => void
  onViewSummary: (payrollId: string, startDate?: string, endDate?: string) => void
  onViewReceipt: (payrollId: string, startDate?: string, endDate?: string) => void
  onCancelPayroll: (item: Payroll) => Promise<void>
  onCancelDialogOpen: (item: Payroll) => void
  onCancelDialogClose: () => void
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

export function usePayrollHistory({
  companyId,
  onEvent,
}: UsePayrollHistoryParams): UsePayrollHistoryReturn {
  useI18n('Payroll.PayrollHistory')

  const { baseSubmitHandler } = useBase()
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilterOption>('3months')
  const [cancelDialogItem, setCancelDialogItem] = useState<Payroll | null>(null)

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

  return {
    payrollHistory,
    wireInRequests,
    selectedTimeFilter,
    cancelDialogItem,
    isLoading: isCancelling,
    onTimeFilterChange: setSelectedTimeFilter,
    onViewSummary: handleViewSummary,
    onViewReceipt: handleViewReceipt,
    onCancelPayroll: handleCancelPayroll,
    onCancelDialogOpen: setCancelDialogItem,
    onCancelDialogClose: () => {
      setCancelDialogItem(null)
    },
  }
}
