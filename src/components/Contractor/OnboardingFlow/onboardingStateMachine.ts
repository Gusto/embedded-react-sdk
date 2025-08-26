import { transition, reduce, state, guard } from 'robot3'
import {
  AddressContextual,
  ContractorListContextual,
  NewHireReportContextual,
  PaymentMethodContextual,
  ProfileContextual,
  SubmitContextual,
  type OnboardingFlowContextInterface,
} from './OnboardingFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.CONTRACTOR_UPDATE]: {
    contractorId: string
  }
  [componentEvents.CONTRACTOR_PROFILE_DONE]: { contractorId: string; selfOnboarding: boolean }
  [componentEvents.CONTRACTOR_SUBMIT_DONE]: { message?: string }
}

const createReducer = (props: Partial<OnboardingFlowContextInterface>) => {
  return (ctx: OnboardingFlowContextInterface): OnboardingFlowContextInterface => ({
    ...ctx,
    ...props,
  })
}
const cancelTransition = () =>
  transition(
    componentEvents.CANCEL,
    'list',
    reduce(
      createReducer({
        component: ContractorListContextual,
        showProgress: false,
        currentStep: 0,
        contractorId: undefined,
        successMessage: undefined,
      }),
    ),
  )

export const onboardingMachine = {
  list: state(
    transition(
      componentEvents.CONTRACTOR_CREATE,
      'profile',
      reduce(
        createReducer({
          component: ProfileContextual,
          currentStep: 1,
          showProgress: true,
          contractorId: undefined,
          successMessage: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.CONTRACTOR_UPDATE,
      'profile',
      reduce(
        (
          ctx: OnboardingFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.CONTRACTOR_UPDATE>,
        ): OnboardingFlowContextInterface => {
          return {
            ...ctx,
            component: ProfileContextual,
            currentStep: 1,
            showProgress: true,
            contractorId: ev.payload.contractorId,
            successMessage: undefined,
          }
        },
      ),
    ),
  ),
  profile: state(
    cancelTransition(),
    transition(
      componentEvents.CONTRACTOR_PROFILE_DONE,
      'address',
      reduce(
        (
          ctx: OnboardingFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.CONTRACTOR_PROFILE_DONE>,
        ): OnboardingFlowContextInterface => {
          return {
            ...ctx,
            component: AddressContextual,
            currentStep: 2,
            contractorId: ev.payload.contractorId,
            selfOnboarding: ev.payload.selfOnboarding,
          }
        },
      ),
      guard((ctx, ev) => !ev.payload.selfOnboarding), // Only allow transition to address if not self-onboarding
    ),
    transition(
      componentEvents.CONTRACTOR_PROFILE_DONE,
      'newHireReport',
      reduce(
        (
          ctx: OnboardingFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.CONTRACTOR_PROFILE_DONE>,
        ): OnboardingFlowContextInterface => {
          return {
            ...ctx,
            component: NewHireReportContextual,
            contractorId: ev.payload.contractorId,
            selfOnboarding: ev.payload.selfOnboarding,
            currentStep: 2,
            totalSteps: 3,
          }
        },
      ),
      guard((ctx, ev) => ev.payload.selfOnboarding), // Only allow transition to new hire report if self-onboarding
    ),
  ),
  address: state(
    cancelTransition(),
    transition(
      componentEvents.CONTRACTOR_ADDRESS_DONE,
      'paymentMethod',
      reduce(createReducer({ component: PaymentMethodContextual, currentStep: 3 })),
    ),
  ),
  paymentMethod: state(
    cancelTransition(),
    transition(
      componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE,
      'newHireReport',
      reduce(
        createReducer({
          component: NewHireReportContextual,
          currentStep: 4,
        }),
      ),
    ),
  ),
  newHireReport: state(
    cancelTransition(),
    transition(
      componentEvents.CONTRACTOR_NEW_HIRE_REPORT_DONE,
      'submit',
      reduce(
        createReducer({
          component: SubmitContextual,
          currentStep: 5,
        }),
      ),
    ),
  ),
  submit: state(
    cancelTransition(),
    transition(
      componentEvents.CONTRACTOR_SUBMIT_DONE,
      'list',
      reduce(
        (
          ctx: OnboardingFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.CONTRACTOR_SUBMIT_DONE>,
        ): OnboardingFlowContextInterface => {
          return {
            ...ctx,
            component: ContractorListContextual,
            currentStep: 0,
            showProgress: false,
            successMessage: ev.payload.message,
          }
        },
      ),
    ),
  ),
  final: state(),
}
