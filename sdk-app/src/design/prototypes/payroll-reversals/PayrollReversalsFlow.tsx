import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { payrollReversalsMachine } from './payrollReversalsStateMachine'
import type { PayrollReversalsFlowProps, PayrollReversalsFlowContextInterface } from './PayrollReversalsFlowComponents'
import { WarningContextual } from './PayrollReversalsFlowComponents'
import { Flow } from '@/components/Flow/Flow'

export const PayrollReversalsFlow = ({ companyId, onEvent }: PayrollReversalsFlowProps) => {
  const machine = useMemo(
    () =>
      createMachine(
        'warning',
        payrollReversalsMachine,
        (initialContext: PayrollReversalsFlowContextInterface) => ({
          ...initialContext,
          component: WarningContextual,
          companyId,
          selectedPayroll: null,
          selectedEmployeeUuids: [],
          header: null,
        }),
      ),
    [companyId],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
