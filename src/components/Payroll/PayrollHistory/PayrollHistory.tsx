import { PayrollHistoryPresentation } from './PayrollHistoryPresentation'
import { usePayrollHistory } from './usePayrollHistory'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useComponentDictionary } from '@/i18n'

export type TimeFilterOption = '3months' | '6months' | 'year'

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

  const hookResult = usePayrollHistory({ companyId, onEvent })

  return <PayrollHistoryPresentation {...hookResult} />
}
