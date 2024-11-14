import { createMachine } from 'robot3'
import { EmployeeListContextual } from '@/components/Employee'
import { Flow } from '@/components/Flow/Flow'
import { employeeOnboardingMachine } from '@/components/Flow/StateMachines'
import type { BaseComponentInterface } from '@/components/Base'
import { Schemas } from '@/types'
import { FlowContextInterface } from './useFlow'

export interface EmployeeOnboardingFlowProps {
  companyId: string
}
export interface EmployeeOnboardingContextInterface extends FlowContextInterface {
  companyId: string
  employeeId?: string
  paymentMethod?: Schemas['Employee-Payment-Method']
}

export const EmployeeOnboardingFlow = ({
  companyId,
  onEvent,
}: EmployeeOnboardingFlowProps & BaseComponentInterface) => {
  const manageEmployees = createMachine(
    'index',
    employeeOnboardingMachine,
    (initialContext: EmployeeOnboardingContextInterface) => ({
      ...initialContext,
      component: EmployeeListContextual,
      companyId,
    }),
  )
  return <Flow machine={manageEmployees} onEvent={onEvent} />
}
