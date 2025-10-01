import { PayrollHistory } from '../PayrollHistory/PayrollHistory'
import type { BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n'

export interface PayrollHistoryFlowProps
  extends BaseComponentInterface<'Payroll.PayrollHistoryFlow'> {
  companyId: string
}

export function PayrollHistoryFlow({ companyId, onEvent, dictionary }: PayrollHistoryFlowProps) {
  useComponentDictionary('Payroll.PayrollHistoryFlow', dictionary)

  return <PayrollHistory companyId={companyId} onEvent={onEvent} />
}
