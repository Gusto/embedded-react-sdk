import { createMachine } from 'robot3'
import type { PaymentMethodBankAccount } from '@gusto/embedded-api/models/components/paymentmethodbankaccount'
import type { CompensationDefaultValues } from '../Employee/Compensation'
import { EmployeeListContextual } from '../Employee/EmployeeList/EmployeeList'
import type { ProfileDefaultValues } from '../Employee/Profile'
import type { FlowContextInterface } from './useFlow'
import { Flow } from '@/components/Flow/Flow'
import { employeeOnboardingMachine } from '@/components/Flow/StateMachines'
import type { BaseComponentInterface } from '@/components/Base'
import { SDKI18next } from '@/contexts/GustoProvider'
import type { EmployeeOnboardingStatus } from '@/shared/constants'
import type { RequireAtLeastOne } from '@/types/Helpers'

export type EmployeeOnboardingDefaultValues = RequireAtLeastOne<{
  profile?: ProfileDefaultValues
  compensation?: CompensationDefaultValues
}>
export interface EmployeeOnboardingFlowProps extends BaseComponentInterface {
  companyId: string
  defaultValues?: RequireAtLeastOne<EmployeeOnboardingDefaultValues>
  isSelfOnboardingEnabled?: boolean
}
export interface EmployeeOnboardingContextInterface extends FlowContextInterface {
  companyId: string
  employeeId?: string
  isAdmin?: boolean
  onboardingStatus?: (typeof EmployeeOnboardingStatus)[keyof typeof EmployeeOnboardingStatus]
  startDate?: string
  paymentMethod?: PaymentMethodBankAccount
  defaultValues?: EmployeeOnboardingDefaultValues
  isSelfOnboardingEnabled?: boolean
}

export const EmployeeOnboardingFlow = ({
  companyId,
  onEvent,
  defaultValues,
  isSelfOnboardingEnabled = true,
}: EmployeeOnboardingFlowProps) => {
  const manageEmployees = createMachine(
    'index',
    employeeOnboardingMachine,
    (initialContext: EmployeeOnboardingContextInterface) => ({
      ...initialContext,
      component: EmployeeListContextual,
      companyId,
      isAdmin: true,
      title: SDKI18next.t('flows.employeeOnboarding.employeeListTitle'),
      defaultValues,
      isSelfOnboardingEnabled,
    }),
  )
  return <Flow machine={manageEmployees} onEvent={onEvent} />
}
