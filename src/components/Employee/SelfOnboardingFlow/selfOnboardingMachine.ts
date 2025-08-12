import { transition, reduce, state, invoke, createMachine } from 'robot3'
import type { SelfOnboardingContextInterface } from './SelfOnboardingComponents'
import {
  Profile,
  FederalTaxes,
  StateTaxes,
  PaymentMethod,
  OnboardingSummary,
} from './SelfOnboardingComponents'
import { componentEvents } from '@/shared/constants'
import type { DocumentSignerContextInterface } from '@/components/Employee/DocumentSigner/documentSignerStateMachine'
import { DocumentListContextual } from '@/components/Employee/DocumentSigner/documentSignerStateMachine'
import { documentSignerMachine } from '@/components/Employee/DocumentSigner/stateMachine'

const documentSigner = createMachine(
  'index',
  documentSignerMachine,
  (initialContext: DocumentSignerContextInterface) => ({
    ...initialContext,
    component: DocumentListContextual,
  }),
)

export const employeeSelfOnboardingMachine = {
  index: state(
    transition(
      componentEvents.EMPLOYEE_SELF_ONBOARDING_START,
      'employeeProfile',
      reduce(
        (ctx: SelfOnboardingContextInterface): SelfOnboardingContextInterface => ({
          ...ctx,
          component: Profile,
        }),
      ),
    ),
  ),
  employeeProfile: state(
    transition(
      componentEvents.EMPLOYEE_PROFILE_DONE,
      'employeeFederalTaxes',
      reduce(
        (ctx: SelfOnboardingContextInterface): SelfOnboardingContextInterface => ({
          ...ctx,
          component: FederalTaxes,
        }),
      ),
    ),
  ),
  employeeFederalTaxes: state(
    transition(
      componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE,
      'employeeStateTaxes',
      reduce(
        (ctx: SelfOnboardingContextInterface): SelfOnboardingContextInterface => ({
          ...ctx,
          component: StateTaxes,
        }),
      ),
    ),
  ),
  employeeStateTaxes: state(
    transition(
      componentEvents.EMPLOYEE_STATE_TAXES_DONE,
      'employeePaymentMethod',
      reduce((ctx: SelfOnboardingContextInterface) => ({
        ...ctx,
        component: PaymentMethod,
      })),
    ),
  ),
  employeePaymentMethod: state(
    transition(
      componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE,
      'employeeDocumentSigner',
      reduce((ctx: SelfOnboardingContextInterface) => ({
        ...ctx,
      })),
    ),
  ),
  //Invoking nested state machine
  employeeDocumentSigner: invoke(
    documentSigner,
    transition(
      componentEvents.ROBOT_MACHINE_DONE,
      'index',
      reduce((ctx: SelfOnboardingContextInterface) => ({
        ...ctx,
        component: OnboardingSummary,
      })),
    ),
  ),
}
