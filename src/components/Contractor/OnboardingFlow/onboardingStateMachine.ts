import { transition, reduce, state, guard } from 'robot3'
import {
  AddressContextual,
  ContractorListContextual,
  NewHireReportContextual,
  PaymentMethodContextual,
  ProfileContextual,
  ProgressBarCta,
  SubmitContextual,
  type OnboardingFlowContextInterface,
} from './OnboardingFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import type { FlowHeaderConfig } from '@/components/Flow/useFlow'

type EventPayloads = {
  [componentEvents.CONTRACTOR_UPDATE]: {
    contractorId: string
  }
  [componentEvents.CONTRACTOR_PROFILE_DONE]: { contractorId: string; selfOnboarding: boolean }
  [componentEvents.CONTRACTOR_SUBMIT_DONE]: { message?: string }
}

const TOTAL_STEPS_DEFAULT = 5
const TOTAL_STEPS_SELF_ONBOARDING = 3

const progressHeader = (
  currentStep: number,
  totalSteps: number = TOTAL_STEPS_DEFAULT,
): FlowHeaderConfig => ({
  type: 'progress',
  currentStep,
  totalSteps,
  cta: ProgressBarCta,
})

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
        header: null,
        contractorId: undefined,
        successMessage: undefined,
      }),
    ),
  )

export const onboardingMachine = {
  list: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_CREATE,
      'profile',
      reduce(
        createReducer({
          component: ProfileContextual,
          header: progressHeader(1),
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
            header: progressHeader(1),
            contractorId: ev.payload.contractorId,
            successMessage: undefined,
          }
        },
      ),
    ),
  ),
  profile: state<MachineTransition>(
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
            header: progressHeader(2),
            contractorId: ev.payload.contractorId,
            selfOnboarding: ev.payload.selfOnboarding,
          }
        },
      ),
      guard((ctx, ev) => !ev.payload.selfOnboarding),
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
            header: progressHeader(2, TOTAL_STEPS_SELF_ONBOARDING),
            contractorId: ev.payload.contractorId,
            selfOnboarding: ev.payload.selfOnboarding,
          }
        },
      ),
      guard((ctx, ev) => ev.payload.selfOnboarding),
    ),
  ),
  address: state<MachineTransition>(
    cancelTransition(),
    transition(
      componentEvents.CONTRACTOR_ADDRESS_DONE,
      'paymentMethod',
      reduce(createReducer({ component: PaymentMethodContextual, header: progressHeader(3) })),
    ),
  ),
  paymentMethod: state<MachineTransition>(
    cancelTransition(),
    transition(
      componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE,
      'newHireReport',
      reduce(
        createReducer({
          component: NewHireReportContextual,
          header: progressHeader(4),
        }),
      ),
    ),
  ),
  newHireReport: state<MachineTransition>(
    cancelTransition(),
    transition(
      componentEvents.CONTRACTOR_NEW_HIRE_REPORT_DONE,
      'submit',
      reduce(
        createReducer({
          component: SubmitContextual,
          header: progressHeader(5),
        }),
      ),
    ),
  ),
  submit: state<MachineTransition>(
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
            header: null,
            successMessage: ev.payload.message,
          }
        },
      ),
    ),
  ),
  final: state<MachineTransition>(),
}
