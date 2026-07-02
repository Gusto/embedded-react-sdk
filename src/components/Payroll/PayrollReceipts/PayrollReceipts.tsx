import { usePayrollsGetReceiptSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/payrollsGetReceipt'
import { PayrollReceiptsPresentation } from './PayrollReceiptsPresentation'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary, useI18n } from '@/i18n'

/**
 * Props for {@link PayrollReceipts}.
 *
 * @public
 */
export interface PayrollReceiptsProps extends BaseComponentInterface<'Payroll.PayrollReceipts'> {
  /** Identifier of the payroll whose receipt should be displayed. */
  payrollId: string
  /** Whether to include reimbursement amounts in the breakdown and employee tables. Defaults to `true`. */
  withReimbursements?: boolean
}

/**
 * Displays a detailed receipt for a completed payroll, including the debited total, per-category
 * breakdown, tax breakdown, and a per-employee summary of payment method, garnishments,
 * reimbursements, taxes, and net pay.
 *
 * @param props - See {@link PayrollReceiptsProps}.
 * @returns The rendered payroll receipt.
 * @public
 *
 * @example
 * ```tsx
 * import { Payroll } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return <Payroll.PayrollReceipts payrollId="your-payroll-id" onEvent={() => {}} />
 * }
 * ```
 */
export function PayrollReceipts(props: PayrollReceiptsProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ payrollId, dictionary, withReimbursements = true }: PayrollReceiptsProps) => {
  useComponentDictionary('Payroll.PayrollReceipts', dictionary)
  useI18n('Payroll.PayrollReceipts')

  const { data } = usePayrollsGetReceiptSuspense({
    payrollUuid: payrollId,
  })
  const payrollData = data.payrollReceipt!

  return (
    <PayrollReceiptsPresentation
      receiptData={payrollData}
      withReimbursements={withReimbursements}
    />
  )
}
