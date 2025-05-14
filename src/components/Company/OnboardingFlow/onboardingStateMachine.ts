import { transition, reduce, state } from 'robot3'
import {
  BankAccountContextual,
  DocumentSignerFlowContextual,
  EmployeesContextual,
  IndustryContextual,
  LocationsContextual,
  OnboardingOverviewContextual,
  PayScheduleContextual,
  StateTaxesFlowContextual,
  type OnboardingFlowContextInterface,
} from './OnboardingFlowComponents'
import { componentEvents } from '@/shared/constants'

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
        (ctx: OnboardingFlowContextInterface): OnboardingFlowContextInterface => ({
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
  payschedule: state(
    transition(
      componentEvents.PAY_SCHEDULE_DONE,
      'stateTaxes',
      reduce(
        (ctx: OnboardingFlowContextInterface): OnboardingFlowContextInterface => ({
          ...ctx,
          component: StateTaxesFlowContextual,
        }),
      ),
    ),
  ),
  stateTaxes: state(
    transition(
      componentEvents.COMPANY_STATE_TAX_DONE,
      'documents',
      reduce(
        (ctx: OnboardingFlowContextInterface): OnboardingFlowContextInterface => ({
          ...ctx,
          component: DocumentSignerFlowContextual,
        }),
      ),
    ),
  ),
  documents: state(
    transition(
      componentEvents.COMPANY_FORMS_DONE,
      'overview',
      reduce(
        (ctx: OnboardingFlowContextInterface): OnboardingFlowContextInterface => ({
          ...ctx,
          component: OnboardingOverviewContextual,
        }),
      ),
    ),
  ),
  overview: state(
    transition(
      componentEvents.COMPANY_OVERVIEW_CONTINUE,
      'locations',
      reduce(
        (ctx: OnboardingFlowContextInterface): OnboardingFlowContextInterface => ({
          ...ctx,
          component: LocationsContextual,
        }),
      ),
    ),
    transition(componentEvents.COMPANY_OVERVIEW_DONE, 'final'),
  ),
  final: state(),
}
