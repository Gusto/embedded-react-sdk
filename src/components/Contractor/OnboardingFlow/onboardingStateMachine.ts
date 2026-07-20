import { transition, reduce, state, guard } from 'robot3'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
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
import { componentEvents, ContractorOnboardingStatus } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import type { FlowHeaderConfig } from '@/components/Flow/useFlow'

type EventPayloads = {
  [componentEvents.CONTRACTOR_UPDATE]: {
    contractorId: string
  }
  [componentEvents.CONTRACTOR_PROFILE_DONE]: {
    contractorId: string
    onboardingStatus?: Contractor['onboardingStatus']
    selfOnboarding: boolean
  }
  [componentEvents.CONTRACTOR_SUBMIT_DONE]: { message?: string }
}

// The new hire report belongs to the contractor's initial onboarding pass only.
// These are the statuses where the admin still owns first-time setup; once the
// contractor advances to admin review, an active self-onboarding stage, or
// completion, the report is settled and the step is skipped. A missing status
// (a just-created contractor) counts as initial. We read the post-save status
// off the profile/done contractor because the API auto-advances to
// admin_onboarding_review the instant the last required field is saved.
const INITIAL_ONBOARDING_STATUSES = new Set<Contractor['onboardingStatus']>([
  ContractorOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
  ContractorOnboardingStatus.SELF_ONBOARDING_NOT_INVITED,
])

const showNewHireReportForStatus = (status?: Contractor['onboardingStatus']): boolean =>
  !status || INITIAL_ONBOARDING_STATUSES.has(status)

type OnboardingStep = 'profile' | 'address' | 'paymentMethod' | 'newHireReport' | 'submit'

// The flow is a linear list of steps. The admin-only steps (address, payment
// method) drop out when the contractor self-onboards, and the new hire report
// drops out once past the initial onboarding pass.
const stepsForPath = (selfOnboarding: boolean, showNewHireReport: boolean): OnboardingStep[] => {
  const steps: OnboardingStep[] = ['profile']
  if (!selfOnboarding) steps.push('address', 'paymentMethod')
  if (showNewHireReport) steps.push('newHireReport')
  steps.push('submit')
  return steps
}

// The defaults describe the profile step, which renders before the path is
// known: assume the longest path so it reads "1 of 5".
const progressHeader = (
  currentStep: OnboardingStep,
  {
    selfOnboarding = false,
    showNewHireReport = true,
  }: { selfOnboarding?: boolean; showNewHireReport?: boolean } = {},
): FlowHeaderConfig => {
  const steps = stepsForPath(selfOnboarding, showNewHireReport)
  return {
    type: 'progress',
    currentStep: steps.indexOf(currentStep) + 1,
    totalSteps: steps.length,
    cta: ProgressBarCta,
  }
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
        header: null,
        contractorId: undefined,
        successMessage: undefined,
      }),
    ),
  )

/** @internal */
export const onboardingMachine = {
  list: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_CREATE,
      'profile',
      reduce(
        createReducer({
          component: ProfileContextual,
          header: progressHeader('profile'),
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
            header: progressHeader('profile'),
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
          const showNewHireReport = showNewHireReportForStatus(ev.payload.onboardingStatus)
          return {
            ...ctx,
            component: AddressContextual,
            header: progressHeader('address', {
              selfOnboarding: ev.payload.selfOnboarding,
              showNewHireReport,
            }),
            contractorId: ev.payload.contractorId,
            selfOnboarding: ev.payload.selfOnboarding,
            showNewHireReport,
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
            header: progressHeader('newHireReport', {
              selfOnboarding: ev.payload.selfOnboarding,
              showNewHireReport: true,
            }),
            contractorId: ev.payload.contractorId,
            selfOnboarding: ev.payload.selfOnboarding,
            showNewHireReport: true,
          }
        },
      ),
      guard(
        (ctx, ev) =>
          ev.payload.selfOnboarding && showNewHireReportForStatus(ev.payload.onboardingStatus),
      ),
    ),
    transition(
      componentEvents.CONTRACTOR_PROFILE_DONE,
      'submit',
      reduce(
        (
          ctx: OnboardingFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.CONTRACTOR_PROFILE_DONE>,
        ): OnboardingFlowContextInterface => {
          return {
            ...ctx,
            component: SubmitContextual,
            header: progressHeader('submit', {
              selfOnboarding: ev.payload.selfOnboarding,
              showNewHireReport: false,
            }),
            contractorId: ev.payload.contractorId,
            selfOnboarding: ev.payload.selfOnboarding,
            showNewHireReport: false,
          }
        },
      ),
      guard(
        (ctx, ev) =>
          ev.payload.selfOnboarding && !showNewHireReportForStatus(ev.payload.onboardingStatus),
      ),
    ),
  ),
  address: state<MachineTransition>(
    cancelTransition(),
    transition(
      componentEvents.CONTRACTOR_ADDRESS_DONE,
      'paymentMethod',
      reduce((ctx: OnboardingFlowContextInterface): OnboardingFlowContextInterface => ({
        ...ctx,
        component: PaymentMethodContextual,
        header: progressHeader('paymentMethod', {
          selfOnboarding: ctx.selfOnboarding,
          showNewHireReport: ctx.showNewHireReport,
        }),
      })),
    ),
  ),
  paymentMethod: state<MachineTransition>(
    cancelTransition(),
    transition(
      componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE,
      'newHireReport',
      reduce((ctx: OnboardingFlowContextInterface): OnboardingFlowContextInterface => ({
        ...ctx,
        component: NewHireReportContextual,
        header: progressHeader('newHireReport', {
          selfOnboarding: ctx.selfOnboarding,
          showNewHireReport: ctx.showNewHireReport,
        }),
      })),
      guard((ctx: OnboardingFlowContextInterface) => ctx.showNewHireReport !== false),
    ),
    transition(
      componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE,
      'submit',
      reduce((ctx: OnboardingFlowContextInterface): OnboardingFlowContextInterface => ({
        ...ctx,
        component: SubmitContextual,
        header: progressHeader('submit', {
          selfOnboarding: ctx.selfOnboarding,
          showNewHireReport: ctx.showNewHireReport,
        }),
      })),
      guard((ctx: OnboardingFlowContextInterface) => ctx.showNewHireReport === false),
    ),
  ),
  newHireReport: state<MachineTransition>(
    cancelTransition(),
    transition(
      componentEvents.CONTRACTOR_NEW_HIRE_REPORT_DONE,
      'submit',
      reduce((ctx: OnboardingFlowContextInterface): OnboardingFlowContextInterface => ({
        ...ctx,
        component: SubmitContextual,
        header: progressHeader('submit', {
          selfOnboarding: ctx.selfOnboarding,
          showNewHireReport: ctx.showNewHireReport,
        }),
      })),
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
