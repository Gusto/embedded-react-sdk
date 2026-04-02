import { useState } from 'react'
import { usePayrollsListSuspense } from '@gusto/embedded-api/react-query/payrollsList'
import { usePayrollsCancelMutation } from '@gusto/embedded-api/react-query/payrollsCancel'
import { useWireInRequestsListSuspense } from '@gusto/embedded-api/react-query/wireInRequestsList'
import {
  ProcessingStatuses,
  QueryParamPayrollTypes,
} from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'
import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import { PayrollHistoryPresentation } from './PayrollHistoryPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import { usePagination } from '@/hooks/usePagination/usePagination'

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

export const Root = ({ onEvent, companyId, dictionary }: PayrollHistoryProps) => {
  useComponentDictionary('Payroll.PayrollHistory', dictionary)
  useI18n('Payroll.PayrollHistory')

  const [cancelDialogItem, setCancelDialogItem] = useState<Payroll | null>(null)
  const { baseSubmitHandler } = useBase()
  const { currentPage, itemsPerPage, getPaginationProps } = usePagination()

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
    />
  )
}
