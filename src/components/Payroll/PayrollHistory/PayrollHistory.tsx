import { useState, useMemo } from 'react'
import { usePayrollsListSuspense } from '@gusto/embedded-api/react-query/payrollsList'
import { usePayrollsCancelMutation } from '@gusto/embedded-api/react-query/payrollsCancel'
import { ProcessingStatuses } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'
import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import { getPayrollType, getPayrollStatus } from '../helpers'
import type { PayrollHistoryItem, TimeFilterOption } from './types'
import { PayrollHistoryPresentation } from './PayrollHistoryPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'
import { parseDateStringToLocal } from '@/helpers/dateFormatting'

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
    startDate: startDate.toISOString().split('T')[0]!,
    endDate: now.toISOString().split('T')[0]!,
  }
}

const mapPayrollToHistoryItem = (payroll: Payroll, locale: string): PayrollHistoryItem => {
  const formatPayPeriod = (startDate?: string, endDate?: string): string => {
    if (!startDate || !endDate) return ''

    const start = parseDateStringToLocal(startDate)
    const end = parseDateStringToLocal(endDate)

    if (!start || !end) return ''

    const startFormatted = start.toLocaleDateString(locale, {
      month: 'long',
      day: 'numeric',
    })

    const endFormatted = end.toLocaleDateString(locale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

    return `${startFormatted}–${endFormatted}`
  }

  const formatPayDate = (dateString?: string): string => {
    if (!dateString) return ''

    const date = parseDateStringToLocal(dateString)
    if (!date) return ''

    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return {
    id: payroll.payrollUuid || payroll.uuid!,
    payPeriod: formatPayPeriod(payroll.payPeriod?.startDate, payroll.payPeriod?.endDate),
    type: getPayrollType(payroll),
    payDate: formatPayDate(payroll.checkDate),
    status: getPayrollStatus(payroll),
    amount: payroll.totals?.netPay ? Number(payroll.totals.netPay) : undefined,
  }
}

export const Root = ({ onEvent, companyId, dictionary }: PayrollHistoryProps) => {
  useComponentDictionary('Payroll.PayrollHistory', dictionary)
  useI18n('Payroll.PayrollHistory')

  const [selectedTimeFilter, setSelectedTimeFilter] = useState<TimeFilterOption>('3months')
  const { locale } = useLocale()

  const dateRange = useMemo(() => getDateRangeForFilter(selectedTimeFilter), [selectedTimeFilter])

  const { data: payrollsData } = usePayrollsListSuspense({
    companyId,
    processingStatuses: [ProcessingStatuses.Processed],
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  })

  const { mutateAsync: cancelPayroll, isPending: isCancelling } = usePayrollsCancelMutation()

  const payrollHistory =
    payrollsData.payrollList?.map(payroll => mapPayrollToHistoryItem(payroll, locale)) || []

  const handleViewSummary = (payrollId: string) => {
    onEvent(componentEvents.RUN_PAYROLL_SUMMARY_VIEWED, { payrollId })
  }

  const handleViewReceipt = (payrollId: string) => {
    onEvent(componentEvents.RUN_PAYROLL_RECEIPT_VIEWED, { payrollId })
  }

  const handleCancelPayroll = async (payrollId: string) => {
    try {
      const result = await cancelPayroll({
        request: {
          companyId,
          payrollId,
        },
      })

      onEvent(componentEvents.RUN_PAYROLL_CANCELLED, { payrollId, result })
    } catch (error) {
      onEvent(componentEvents.ERROR, {
        payrollId,
        action: 'cancel',
        error: error instanceof Error ? error.message : String(error),
      })
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
      isLoading={isCancelling}
    />
  )
}
