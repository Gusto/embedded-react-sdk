import { transition, reduce, state } from 'robot3'
import type { SelfOnboardingContextInterface } from './SelfOnboardingComponents'
import {
  ProfileContextual,
  AddressContextual,
  PaymentMethodContextual,
  DocumentSignerContextual,
  SummaryContextual,
} from './SelfOnboardingComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

export const contractorSelfOnboardingMachine = {
  index: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_SELF_ONBOARDING_START,
      'contractorProfile',
      reduce(
        (ctx: SelfOnboardingContextInterface): SelfOnboardingContextInterface => ({
          ...ctx,
          component: ProfileContextual,
        }),
      ),
    ),
  ),
  contractorProfile: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_PROFILE_DONE,
      'contractorAddress',
      reduce(
        (ctx: SelfOnboardingContextInterface): SelfOnboardingContextInterface => ({
          ...ctx,
          component: AddressContextual,
        }),
      ),
    ),
  ),
  contractorAddress: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_ADDRESS_DONE,
      'contractorPaymentMethod',
      reduce(
        (ctx: SelfOnboardingContextInterface): SelfOnboardingContextInterface => ({
          ...ctx,
          component: PaymentMethodContextual,
        }),
      ),
    ),
  ),
  contractorPaymentMethod: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE,
      'contractorDocumentSigner',
      reduce(
        (ctx: SelfOnboardingContextInterface): SelfOnboardingContextInterface => ({
          ...ctx,
          component: DocumentSignerContextual,
        }),
      ),
    ),
  ),
  contractorDocumentSigner: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_DOCUMENTS_DONE,
      'summary',
      reduce(
        (ctx: SelfOnboardingContextInterface): SelfOnboardingContextInterface => ({
          ...ctx,
          component: SummaryContextual,
        }),
      ),
    ),
  ),
  summary: state<MachineTransition>(),
}
