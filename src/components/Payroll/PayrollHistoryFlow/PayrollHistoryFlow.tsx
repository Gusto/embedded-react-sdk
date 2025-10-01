import { createMachine } from 'robot3'
import { payrollHistoryMachine } from './payrollHistoryStateMachine'
import {
  PayrollHistoryContextual,
  type PayrollHistoryFlowContextInterface,
  type PayrollHistoryFlowProps,
} from './PayrollHistoryFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { useComponentDictionary } from '@/i18n'

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
