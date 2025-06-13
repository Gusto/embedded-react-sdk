import { createMachine } from 'robot3'
import type { PaymentMethodBankAccount } from '@gusto/embedded-api/models/components/paymentmethodbankaccount'
import type { ProfileDefaultValues } from '../Profile'
import type { CompensationDefaultValues } from '../Compensation'
import { EmployeeListContextual } from '../EmployeeList/EmployeeList'
import { employeeOnboardingMachine } from './onboardingStateMachine'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import type { EmployeeOnboardingStatus } from '@/shared/constants'
import type { RequireAtLeastOne } from '@/types/Helpers'
import type { FlowContextInterface } from '@/components/Flow/useFlow'

export type OnboardingDefaultValues = RequireAtLeastOne<{
  profile?: ProfileDefaultValues
  compensation?: CompensationDefaultValues
}>
export interface OnboardingFlowProps extends BaseComponentInterface {
  companyId: string
  defaultValues?: RequireAtLeastOne<OnboardingDefaultValues>
  isSelfOnboardingEnabled?: boolean
}
export interface OnboardingContextInterface extends FlowContextInterface {
  companyId: string
  employeeId?: string
  isAdmin?: boolean
  onboardingStatus?: (typeof EmployeeOnboardingStatus)[keyof typeof EmployeeOnboardingStatus]
  startDate?: string
  paymentMethod?: PaymentMethodBankAccount
  defaultValues?: OnboardingDefaultValues
  isSelfOnboardingEnabled?: boolean
}

export const OnboardingFlow = ({
  companyId,
  onEvent,
  defaultValues,
  isSelfOnboardingEnabled = true,
}: OnboardingFlowProps) => {
  const manageEmployees = createMachine(
    'index',
    employeeOnboardingMachine,
    (initialContext: OnboardingContextInterface) => ({
      ...initialContext,
      component: EmployeeListContextual,
      companyId,
      isAdmin: true,
      defaultValues,
      isSelfOnboardingEnabled,
    }),
  )
  return <Flow machine={manageEmployees} onEvent={onEvent} />
}
