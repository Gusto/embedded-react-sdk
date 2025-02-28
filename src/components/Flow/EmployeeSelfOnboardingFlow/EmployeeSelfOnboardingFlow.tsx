import { createMachine } from 'robot3'
import { Landing } from './EmployeeSelfOnboardingComponents'
import { Flow, type FlowContextInterface } from '@/components/Flow/Flow'
import { employeeSelfOnboardingMachine } from '@/components/Flow/StateMachines'
import type { BaseComponentInterface } from '@/components/Base'
import { Schemas } from '@/types/schema'

export interface EmployeeSelfOnboardingFlowProps extends BaseComponentInterface {
  companyId: string
  employeeId: string
}
export interface EmployeeSelfOnboardingContextInterface extends FlowContextInterface {
  companyId: string
  employeeId: string
  paymentMethod?: Schemas['Employee-Payment-Method']
}

export const EmployeeSelfOnboardingFlow = ({
  companyId,
  employeeId,
  onEvent,
}: EmployeeSelfOnboardingFlowProps) => {
  const manageEmployees = createMachine(
    'index',
    employeeSelfOnboardingMachine,
    (initialContext: EmployeeSelfOnboardingContextInterface) => ({
      ...initialContext,
      component: Landing,
      companyId,
      employeeId,
    }),
  )
  return <Flow machine={manageEmployees} onEvent={onEvent} />
}
