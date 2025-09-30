import { createMachine } from 'robot3'
import { payrollMachine } from './payrollStateMachine'
import type { PayrollFlowProps } from './PayrollFlowComponents'
import { PayrollLandingContextual, type PayrollFlowContextInterface } from './PayrollFlowComponents'
import { Flow } from '@/components/Flow/Flow'

export const PayrollFlow = ({ companyId, onEvent, defaultValues }: PayrollFlowProps) => {
  const payrollFlow = createMachine(
    'landing',
    payrollMachine,
    (initialContext: PayrollFlowContextInterface) => ({
      ...initialContext,
      component: PayrollLandingContextual,
      companyId,
      defaultValues,
      totalSteps: 3,
      currentStep: 1,
      showProgress: false, // Landing step does not show progress bar
    }),
  )
  return <Flow machine={payrollFlow} onEvent={onEvent} />
}
