import { usePayrollsGetReceiptSuspense } from '@gusto/embedded-api/react-query/payrollsGetReceipt'
import type { PayrollReceipt } from '@gusto/embedded-api/models/components/payrollreceipt'
import { useI18n } from '@/i18n'

export interface UsePayrollReceiptsParams {
  payrollId: string
  withReimbursements?: boolean
}

export interface UsePayrollReceiptsReturn {
  receiptData: PayrollReceipt
  withReimbursements: boolean
}

export function usePayrollReceipts({
  payrollId,
  withReimbursements = true,
}: UsePayrollReceiptsParams): UsePayrollReceiptsReturn {
  useI18n('Payroll.PayrollReceipts')

  const { data } = usePayrollsGetReceiptSuspense({
    payrollUuid: payrollId,
  })
  const receiptData = data.payrollReceipt!

  return {
    receiptData,
    withReimbursements,
  }
}
