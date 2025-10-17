import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { payrollMachine } from './payrollStateMachine'
import type { PayrollFlowProps } from './PayrollFlowComponents'
import { PayrollLandingContextual, type PayrollFlowContextInterface } from './PayrollFlowComponents'
import { Flow } from '@/components/Flow/Flow'

export const PayrollFlow = ({ companyId, onEvent }: PayrollFlowProps) => {
  const payrollFlow = useMemo(
    () =>
      createMachine('landing', payrollMachine, (initialContext: PayrollFlowContextInterface) => ({
        ...initialContext,
        component: PayrollLandingContextual,
        companyId,
        totalSteps: 3,
        currentStep: 1,
        showProgress: false, // Landing step does not show progress bar
      })),
    [companyId],
  )
  return <Flow machine={payrollFlow} onEvent={onEvent} />
}
