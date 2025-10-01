import { createMachine } from 'robot3'
import { payrollHistoryMachine } from './payrollHistoryStateMachine'
import {
  PayrollHistoryContextual,
  type PayrollHistoryFlowContextInterface,
} from './PayrollHistoryFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n'

interface PayrollHistoryFlowProps extends BaseComponentInterface<'Payroll.PayrollHistoryFlow'> {
  companyId: string
}

export function PayrollHistoryFlow({ companyId, onEvent, dictionary }: PayrollHistoryFlowProps) {
  useComponentDictionary('Payroll.PayrollHistoryFlow', dictionary)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wrappedOnEvent = (event: any, payload?: unknown) => {
    onEvent(event, payload)
  }

  return (
    <Flow
      onEvent={wrappedOnEvent}
      machine={createMachine(
        'history',
        payrollHistoryMachine,
        (initialContext: PayrollHistoryFlowContextInterface) => ({
          ...initialContext,
          component: PayrollHistoryContextual,
          companyId,
        }),
      )}
    />
  )
}
