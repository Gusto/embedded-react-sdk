import { transition, reduce, state } from 'robot3'
import {
  BankAccountContextual,
  DocumentSignerContextual,
  EmployeesContextual,
  FederalTaxesContextual,
  IndustryContextual,
  LocationsContextual,
  OnboardingOverviewContextual,
  PayScheduleContextual,
  StateTaxesContextual,
  type OnboardingFlowContextInterface,
} from './OnboardingFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'
import type { FlowHeaderConfig } from '@/components/Flow/useFlow'

const TOTAL_STEPS = 8

const progressHeader = (currentStep: number): FlowHeaderConfig => ({
  type: 'progress',
  currentStep,
  totalSteps: TOTAL_STEPS,
})

const createReducer = (props: Partial<OnboardingFlowContextInterface>) => {
  return (ctx: OnboardingFlowContextInterface): OnboardingFlowContextInterface => ({
    ...ctx,
    ...props,
  })
}

export const onboardingMachine = {
  overview: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_OVERVIEW_CONTINUE,
      'locations',
      reduce(
        createReducer({
          component: LocationsContextual,
          header: progressHeader(1),
        }),
      ),
    ),
    transition(componentEvents.COMPANY_OVERVIEW_DONE, 'final'),
  ),
  locations: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_LOCATION_DONE,
      'federalTaxes',
      reduce(createReducer({ component: FederalTaxesContextual, header: progressHeader(2) })),
    ),
  ),
  federalTaxes: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_FEDERAL_TAXES_DONE,
      'industry',
      reduce(createReducer({ component: IndustryContextual, header: progressHeader(3) })),
    ),
  ),
  industry: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_INDUSTRY_SELECTED,
      'bankAccount',
      reduce(createReducer({ component: BankAccountContextual, header: progressHeader(4) })),
    ),
  ),
  bankAccount: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_BANK_ACCOUNT_DONE,
      'employees',
      reduce(createReducer({ component: EmployeesContextual, header: progressHeader(5) })),
    ),
  ),
  employees: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_ONBOARDING_DONE,
      'payschedule',
      reduce(createReducer({ component: PayScheduleContextual, header: progressHeader(6) })),
    ),
  ),
  payschedule: state<MachineTransition>(
    transition(
      componentEvents.PAY_SCHEDULE_DONE,
      'stateTaxes',
      reduce(createReducer({ component: StateTaxesContextual, header: progressHeader(7) })),
    ),
  ),
  stateTaxes: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_STATE_TAX_DONE,
      'documents',
      reduce(createReducer({ component: DocumentSignerContextual, header: progressHeader(8) })),
    ),
  ),
  documents: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_FORMS_DONE,
      'overview',
      reduce(
        createReducer({
          component: OnboardingOverviewContextual,
          header: null,
        }),
      ),
    ),
  ),

  final: state<MachineTransition>(),
}
