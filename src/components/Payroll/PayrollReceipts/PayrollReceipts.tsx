import { usePayrollsGetReceiptSuspense } from '@gusto/embedded-api/react-query/payrollsGetReceipt'
import { PayrollReceiptsPresentation } from './PayrollReceiptsPresentation'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

interface PayrollReceiptsProps extends BaseComponentInterface<'Payroll.PayrollReceipts'> {
  payrollId: string
  showBackButton?: boolean
}

export function PayrollReceipts(props: PayrollReceiptsProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({
  payrollId,
  dictionary,
  showBackButton = false,
  onEvent,
}: PayrollReceiptsProps) => {
  useComponentDictionary('Payroll.PayrollReceipts', dictionary)
  useI18n('Payroll.PayrollReceipts')

  // eslint-disable-next-line no-console
  console.log('[PayrollReceipts] Rendering with showBackButton:', showBackButton)

  const { data } = usePayrollsGetReceiptSuspense({
    payrollUuid: payrollId,
  })
  const payrollData = data.payrollReceipt!

  const handleBack = () => {
    // eslint-disable-next-line no-console
    console.log('[PayrollReceipts] Back button clicked')
    onEvent(componentEvents.RUN_PAYROLL_BACK, {})
  }

  return (
    <PayrollReceiptsPresentation
      receiptData={payrollData}
      onBack={showBackButton ? handleBack : undefined}
    />
  )
}
