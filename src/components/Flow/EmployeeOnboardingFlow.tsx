import { createMachine } from 'robot3'
import { EmployeeListContextual } from '@/components/Employee'
import { Flow, type FlowContextInterface } from '@/components/Flow/Flow'
import { employeeOnboardingMachine } from '@/components/Flow/StateMachines'
import type { BaseComponentInterface } from '@/components/Base'
import { Schemas } from '@/types/schema'
import { SDKI18next } from '@/contexts'
import { EmployeeOnboardingStatus } from '@/shared/constants'

export interface EmployeeOnboardingFlowProps extends BaseComponentInterface {
  companyId: string
}
export interface EmployeeOnboardingContextInterface extends FlowContextInterface {
  companyId: string
  employeeId?: string
  isAdmin?: boolean
  onboardingStatus?: (typeof EmployeeOnboardingStatus)[keyof typeof EmployeeOnboardingStatus]
  startDate?: string
  paymentMethod?: Schemas['Employee-Payment-Method']
}

export const EmployeeOnboardingFlow = ({ companyId, onEvent }: EmployeeOnboardingFlowProps) => {
  const manageEmployees = createMachine(
    'index',
    employeeOnboardingMachine,
    (initialContext: EmployeeOnboardingContextInterface) => ({
      ...initialContext,
      component: EmployeeListContextual,
      companyId,
      isAdmin: true,
      title: SDKI18next.t('flows.employeeOnboarding.employeeListTitle'),
    }),
  )
  return <Flow machine={manageEmployees} onEvent={onEvent} />
}
