import { transition, reduce, state } from 'robot3'
import type { SelfOnboardingContextInterface } from './SelfOnboardingComponents'
import {
  Profile,
  Address,
  PaymentMethod,
  DocumentSigner,
  OnboardingSummary,
} from './SelfOnboardingComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

/** @internal */
export const contractorSelfOnboardingMachine = {
  index: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_SELF_ONBOARDING_START,
      'contractorProfile',
      reduce((ctx: SelfOnboardingContextInterface): SelfOnboardingContextInterface => ({
        ...ctx,
        component: Profile,
      })),
    ),
  ),
  contractorProfile: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_PROFILE_DONE,
      'contractorAddress',
      reduce((ctx: SelfOnboardingContextInterface): SelfOnboardingContextInterface => ({
        ...ctx,
        component: Address,
      })),
    ),
  ),
  contractorAddress: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_ADDRESS_DONE,
      'contractorPaymentMethod',
      reduce((ctx: SelfOnboardingContextInterface): SelfOnboardingContextInterface => ({
        ...ctx,
        component: PaymentMethod,
      })),
    ),
  ),
  contractorPaymentMethod: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE,
      'contractorDocumentSigner',
      reduce((ctx: SelfOnboardingContextInterface): SelfOnboardingContextInterface => ({
        ...ctx,
        component: DocumentSigner,
      })),
    ),
  ),
  contractorDocumentSigner: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_DOCUMENTS_DONE,
      'index',
      reduce((ctx: SelfOnboardingContextInterface): SelfOnboardingContextInterface => ({
        ...ctx,
        component: OnboardingSummary,
      })),
    ),
  ),
}
