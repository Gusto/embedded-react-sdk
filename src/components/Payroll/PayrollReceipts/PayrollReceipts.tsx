import { PayrollReceiptsPresentation } from './PayrollReceiptsPresentation'
import { usePayrollReceipts } from './usePayrollReceipts'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n'

interface PayrollReceiptsProps extends BaseComponentInterface<'Payroll.PayrollReceipts'> {
  payrollId: string
  withReimbursements?: boolean
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
  withReimbursements = true,
}: PayrollReceiptsProps) => {
  useComponentDictionary('Payroll.PayrollReceipts', dictionary)

  const { data, actions, meta } = usePayrollReceipts({ payrollId, withReimbursements })

  return <PayrollReceiptsPresentation {...data} {...actions} {...meta} />
}
