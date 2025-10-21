import { usePayrollsGetReceiptSuspense } from '@gusto/embedded-api/react-query/payrollsGetReceipt'
import { PayrollReceiptsPresentation } from './PayrollReceiptsPresentation'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary, useI18n } from '@/i18n'

interface PayrollReceiptsProps extends BaseComponentInterface<'Payroll.PayrollReceipts'> {
  payrollId: string
}

export function PayrollReceipts(props: PayrollReceiptsProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({ payrollId, dictionary }: PayrollReceiptsProps) => {
  useComponentDictionary('Payroll.PayrollReceipts', dictionary)
  useI18n('Payroll.PayrollReceipts')

  const { data } = usePayrollsGetReceiptSuspense({
    payrollUuid: payrollId,
  })
  const payrollData = data.payrollReceipt!

  return <PayrollReceiptsPresentation receiptData={payrollData} />
}
