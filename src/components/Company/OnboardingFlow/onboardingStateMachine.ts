import { transition, reduce, state } from 'robot3'
import {
  BankAccountContextual,
  DocumentSignerFlowContextual,
  EmployeesContextual,
  FederalTaxesContextual,
  IndustryContextual,
  LocationsContextual,
  OnboardingOverviewContextual,
  PayScheduleContextual,
  StateTaxesFlowContextual,
  type OnboardingFlowContextInterface,
} from './OnboardingFlowComponents'
import { componentEvents } from '@/shared/constants'

const createReducer = (props: Partial<OnboardingFlowContextInterface>) => {
  return (ctx: OnboardingFlowContextInterface): OnboardingFlowContextInterface => ({
    ...ctx,
    ...props,
  })
}
export const onboardingMachine = {
  overview: state(
    transition(
      componentEvents.COMPANY_OVERVIEW_CONTINUE,
      'locations',
      reduce(createReducer({ component: LocationsContextual, currentStep: 1, showProgress: true })),
    ),
    transition(componentEvents.COMPANY_OVERVIEW_DONE, 'final'),
  ),
  locations: state(
    transition(
      componentEvents.COMPANY_LOCATION_DONE,
      'federalTaxes',
      reduce(createReducer({ component: FederalTaxesContextual, currentStep: 2 })),
    ),
  ),
  federalTaxes: state(
    transition(
      componentEvents.COMPANY_FEDERAL_TAXES_DONE,
      'industry',
      reduce(createReducer({ component: IndustryContextual, currentStep: 3 })),
    ),
  ),
  industry: state(
    transition(
      componentEvents.COMPANY_INDUSTRY_SELECTED,
      'bankAccount',
      reduce(createReducer({ component: BankAccountContextual, currentStep: 4 })),
    ),
  ),
  bankAccount: state(
    transition(
      componentEvents.COMPANY_BANK_ACCOUNT_DONE,
      'employees',
      reduce(createReducer({ component: EmployeesContextual, currentStep: 5 })),
    ),
  ),
  employees: state(
    transition(
      componentEvents.EMPLOYEE_ONBOARDING_DONE,
      'payschedule',
      reduce(createReducer({ component: PayScheduleContextual, currentStep: 6 })),
    ),
  ),
  payschedule: state(
    transition(
      componentEvents.PAY_SCHEDULE_DONE,
      'stateTaxes',
      reduce(createReducer({ component: StateTaxesFlowContextual, currentStep: 7 })),
    ),
  ),
  stateTaxes: state(
    transition(
      componentEvents.COMPANY_STATE_TAX_DONE,
      'documents',
      reduce(createReducer({ component: DocumentSignerFlowContextual, currentStep: 8 })),
    ),
  ),
  documents: state(
    transition(
      componentEvents.COMPANY_FORMS_DONE,
      'overview',
      reduce(
        createReducer({
          component: OnboardingOverviewContextual,
          currentStep: 1,
          showProgress: false,
        }),
      ),
    ),
  ),

  final: state(),
}
