import { transition, reduce, state } from 'robot3'
import type { SelfOnboardingContextInterface } from './SelfOnboardingComponents'
import {
  Profile,
  FederalTaxes,
  StateTaxes,
  PaymentMethod,
  OnboardingSummary,
  DocumentSigner,
} from './SelfOnboardingComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

export const employeeSelfOnboardingMachine = {
  index: state<MachineTransition>(
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
  employeeProfile: state<MachineTransition>(
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
  employeeFederalTaxes: state<MachineTransition>(
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
  employeeStateTaxes: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_STATE_TAXES_DONE,
      'employeePaymentMethod',
      reduce((ctx: SelfOnboardingContextInterface) => ({
        ...ctx,
        component: PaymentMethod,
      })),
    ),
  ),
  employeePaymentMethod: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE,
      'employeeDocumentSigner',
      reduce((ctx: SelfOnboardingContextInterface) => ({
        ...ctx,
        component: DocumentSigner,
      })),
    ),
  ),
  employeeDocumentSigner: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_FORMS_DONE,
      'index',
      reduce((ctx: SelfOnboardingContextInterface) => ({
        ...ctx,
        component: OnboardingSummary,
      })),
    ),
  ),
}
