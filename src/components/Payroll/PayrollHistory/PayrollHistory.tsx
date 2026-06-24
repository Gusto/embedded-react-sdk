import { useState, useCallback } from 'react'
import { usePayrollsListSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/payrollsList'
import { usePayrollsCancelMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/payrollsCancel'
import { useWireInRequestsListSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/wireInRequestsList'
import {
  DateFilterBy,
  ProcessingStatuses,
  QueryParamPayrollTypes,
  SortOrder,
} from '@gusto/embedded-api-v-2026-02-01/models/operations/getv1companiescompanyidpayrolls'
import type { Payroll } from '@gusto/embedded-api-v-2026-02-01/models/components/payroll'
import { PayrollHistoryPresentation } from './PayrollHistoryPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import { usePagination } from '@/hooks/usePagination/usePagination'
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter/useDateRangeFilter'

/**
 * Props for the {@link PayrollHistory} component.
 *
 * @public
 */
export interface PayrollHistoryProps extends BaseComponentInterface<'Payroll.PayrollHistory'> {
  /** Identifier of the company whose processed payrolls should be listed. */
  companyId: string
}

/**
 * Displays historical payroll records with filtering and management capabilities.
 *
 * @remarks
 * Lists processed regular, off-cycle, and external payrolls for a company and supports filtering by
 * check date (3 months, 6 months, or 1 year), viewing payroll summaries and receipts, and
 * cancelling processed payrolls when they remain within the cancellation window. Each row shows
 * the pay period, payroll type, pay date, status, and total pay amount.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `runPayroll/summary/viewed` | User views a payroll summary | `{ payrollId: string; startDate?: string; endDate?: string }` |
 * | `runPayroll/receipt/viewed` | User views a payroll receipt | `{ payrollId: string; startDate?: string; endDate?: string }` |
 * | `runPayroll/cancelled` | A payroll is cancelled | `{ payrollId: string; result: PayrollsCancelResponse }` |
 *
 * @param props - See {@link PayrollHistoryProps}.
 * @returns The rendered payroll history view.
 * @public
 */
export function PayrollHistory(props: PayrollHistoryProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ onEvent, companyId, dictionary }: PayrollHistoryProps) => {
  useComponentDictionary('Payroll.PayrollHistory', dictionary)
  useI18n('Payroll.PayrollHistory')

  const [cancelDialogItem, setCancelDialogItem] = useState<Payroll | null>(null)
  const { baseSubmitHandler } = useBase()
  const { currentPage, itemsPerPage, getPaginationProps, resetPage } = usePagination()

  const dateRangeFilter = useDateRangeFilter({
    onFilterChange: useCallback(() => {
      resetPage()
    }, [resetPage]),
  })
  const dateFilterParams = dateRangeFilter.getApiDateParams()

  const { data: payrollsData } = usePayrollsListSuspense({
    companyId,
    processingStatuses: [ProcessingStatuses.Processed],
    payrollTypes: [
      QueryParamPayrollTypes.Regular,
      QueryParamPayrollTypes.OffCycle,
      QueryParamPayrollTypes.External,
    ],
    includeOffCycle: true,
    include: ['totals', 'payroll_status_meta'],
    sortOrder: SortOrder.Desc,
    startDate: dateFilterParams.startDate,
    endDate: dateFilterParams.endDate,
    dateFilterBy: dateRangeFilter.isFilterActive ? DateFilterBy.CheckDate : undefined,
    page: currentPage,
    per: itemsPerPage,
  })

  const payrollHistory = payrollsData.payrollList || []
  const paginationProps = getPaginationProps(payrollsData.httpMeta.response.headers)

  const { data: wireInRequestsData } = useWireInRequestsListSuspense({
    companyUuid: companyId,
  })

  const wireInRequests = wireInRequestsData.wireInRequestList ?? []

  const { mutateAsync: cancelPayroll, isPending: isCancelling } = usePayrollsCancelMutation()

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
      pagination={paginationProps}
      onViewSummary={handleViewSummary}
      onViewReceipt={handleViewReceipt}
      onCancelPayroll={handleCancelPayroll}
      cancelDialogItem={cancelDialogItem}
      onCancelDialogOpen={setCancelDialogItem}
      onCancelDialogClose={() => {
        setCancelDialogItem(null)
      }}
      isLoading={isCancelling}
      dateRangeFilter={dateRangeFilter}
    />
  )
}
