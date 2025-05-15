import { transition, reduce, state, invoke, createMachine } from 'robot3'
import { componentEvents } from '@/shared/constants'
import {
  Profile,
  Taxes,
  PaymentMethod,
  OnboardingSummary,
} from '@/components/Flow/EmployeeSelfOnboardingFlow/EmployeeSelfOnboardingComponents'
import type { EmployeeSelfOnboardingContextInterface } from '@/components/Flow/EmployeeSelfOnboardingFlow/EmployeeSelfOnboardingFlow'
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
        (ctx: EmployeeSelfOnboardingContextInterface): EmployeeSelfOnboardingContextInterface => ({
          ...ctx,
          component: Profile,
        }),
      ),
    ),
  ),
  employeeProfile: state(
    transition(
      componentEvents.EMPLOYEE_PROFILE_DONE,
      'employeeTaxes',
      reduce(
        (ctx: EmployeeSelfOnboardingContextInterface): EmployeeSelfOnboardingContextInterface => ({
          ...ctx,
          component: Taxes,
        }),
      ),
    ),
  ),
  employeeTaxes: state(
    transition(
      componentEvents.EMPLOYEE_TAXES_DONE,
      'employeePaymentMethod',
      reduce((ctx: EmployeeSelfOnboardingContextInterface) => ({
        ...ctx,
        component: PaymentMethod,
      })),
    ),
  ),
  employeePaymentMethod: state(
    transition(
      componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE,
      'employeeDocumentSigner',
      reduce((ctx: EmployeeSelfOnboardingContextInterface) => ({
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
      reduce((ctx: EmployeeSelfOnboardingContextInterface) => ({
        ...ctx,
        component: OnboardingSummary,
      })),
    ),
  ),
}
