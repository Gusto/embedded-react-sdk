import { transition, reduce, state } from 'robot3'
import {
  BankAccountContextual,
  EmployeesContextual,
  IndustryContextual,
  PayScheduleContextual,
  type OnboardingFlowContextInterface,
} from './OnboardingFlowComponents'
import type { EmployeeOnboardingStatus } from '@/shared/constants'
import { componentEvents } from '@/shared/constants'
import { type MachineEventType } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.EMPLOYEE_UPDATE]: {
    employeeId: string
    onboardingStatus: (typeof EmployeeOnboardingStatus)[keyof typeof EmployeeOnboardingStatus]
  }
  [componentEvents.EMPLOYEE_PROFILE_DONE]: {
    uuid: string
    onboardingStatus: (typeof EmployeeOnboardingStatus)[keyof typeof EmployeeOnboardingStatus]
    startDate: string
  }
}

export const onboardingMachine = {
  locations: state(
    transition(
      componentEvents.COMPANY_LOCATION_DONE,
      'industry',
      reduce(
        (ctx: OnboardingFlowContextInterface): OnboardingFlowContextInterface => ({
          ...ctx,
          component: IndustryContextual,
        }),
      ),
    ),
  ),
  industry: state(
    transition(
      componentEvents.COMPANY_INDUSTRY_SELECTED,
      'bankAccount',
      reduce(
        (
          ctx: OnboardingFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_PROFILE_DONE>,
        ): OnboardingFlowContextInterface => ({
          ...ctx,
          component: BankAccountContextual,
        }),
      ),
    ),
  ),
  bankAccount: state(
    transition(
      componentEvents.COMPANY_BANK_ACCOUNT_DONE,
      'employees',
      reduce(
        (ctx: OnboardingFlowContextInterface): OnboardingFlowContextInterface => ({
          ...ctx,
          component: EmployeesContextual,
        }),
      ),
    ),
  ),
  employees: state(
    transition(
      componentEvents.EMPLOYEE_ONBOARDING_DONE,
      'payschedule',
      reduce(
        (ctx: OnboardingFlowContextInterface): OnboardingFlowContextInterface => ({
          ...ctx,
          component: PayScheduleContextual,
        }),
      ),
    ),
  ),
  payschedule: state(),
  stateTaxes: state(),
  documents: state(),
  summary: state(),
  final: state(),
}
