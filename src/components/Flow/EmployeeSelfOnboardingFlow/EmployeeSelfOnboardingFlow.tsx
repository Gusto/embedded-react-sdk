import { createMachine } from 'robot3'
import type { PaymentMethodBankAccount } from '@gusto/embedded-api/models/components/paymentmethodbankaccount'
import type { FlowContextInterface } from '../useFlow'
import { Landing } from './EmployeeSelfOnboardingComponents'
import { Flow } from '@/components/Flow/Flow'
import { employeeSelfOnboardingMachine } from '@/components/Flow/StateMachines'
import type { BaseComponentInterface } from '@/components/Base'

export interface EmployeeSelfOnboardingFlowProps extends BaseComponentInterface {
  companyId: string
  employeeId: string
}
export interface EmployeeSelfOnboardingContextInterface extends FlowContextInterface {
  companyId: string
  employeeId: string
  paymentMethod?: PaymentMethodBankAccount
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
