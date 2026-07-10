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
  [componentEvents.CONTRACTOR_PROFILE_DONE]: Contractor & { selfOnboarding: boolean }
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

const TOTAL_STEPS_DEFAULT = 5

// Step totals depend on the path taken after the profile step: the self-onboarding
// path skips address + payment, and either path drops the new hire report once the
// contractor has advanced past the admin's initial onboarding pass.
const computeTotalSteps = (selfOnboarding: boolean, showNewHireReport: boolean): number => {
  if (selfOnboarding) return showNewHireReport ? 3 : 2
  return showNewHireReport ? 5 : 4
}

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

/** @internal */
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
          const showNewHireReport = showNewHireReportForStatus(ev.payload.onboardingStatus)
          const totalSteps = computeTotalSteps(false, showNewHireReport)
          return {
            ...ctx,
            component: AddressContextual,
            header: progressHeader(2, totalSteps),
            contractorId: ev.payload.uuid,
            selfOnboarding: ev.payload.selfOnboarding,
            showNewHireReport,
            totalSteps,
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
          const totalSteps = computeTotalSteps(true, true)
          return {
            ...ctx,
            component: NewHireReportContextual,
            header: progressHeader(2, totalSteps),
            contractorId: ev.payload.uuid,
            selfOnboarding: ev.payload.selfOnboarding,
            showNewHireReport: true,
            totalSteps,
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
          const totalSteps = computeTotalSteps(true, false)
          return {
            ...ctx,
            component: SubmitContextual,
            header: progressHeader(2, totalSteps),
            contractorId: ev.payload.uuid,
            selfOnboarding: ev.payload.selfOnboarding,
            showNewHireReport: false,
            totalSteps,
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
        header: progressHeader(3, ctx.totalSteps),
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
        header: progressHeader(4, ctx.totalSteps),
      })),
      guard((ctx: OnboardingFlowContextInterface) => ctx.showNewHireReport !== false),
    ),
    transition(
      componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE,
      'submit',
      reduce((ctx: OnboardingFlowContextInterface): OnboardingFlowContextInterface => ({
        ...ctx,
        component: SubmitContextual,
        header: progressHeader(4, ctx.totalSteps),
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
        header: progressHeader(ctx.selfOnboarding ? 3 : 5, ctx.totalSteps),
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
