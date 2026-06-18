import { transition, reduce, state, guard } from 'robot3'
import {
  FederalTaxesContextual,
  StateTaxesContextual,
  DeductionsContextual,
  type OnboardingContextInterface,
} from './OnboardingExecutionFlowComponents'
import {
  componentEvents,
  EmployeeSelfOnboardingStatuses,
  EmployeeOnboardingStatus,
} from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import { CompensationContextual } from '@/components/Employee/Compensation'
import { EmployeeDocumentsContextual } from '@/components/Employee/Documents/onboarding/EmployeeDocuments'
import { PaymentMethodContextual } from '@/components/Employee/PaymentMethod'
import { ProfileContextual } from '@/components/Employee/Profile/onboarding/Profile'
import { OnboardingSummaryContextual } from '@/components/Employee/OnboardingSummary'
import type { BackConfig, FlowHeaderConfig } from '@/components/Flow/useFlow'

type EventPayloads = {
  [componentEvents.EMPLOYEE_PROFILE_DONE]: {
    uuid: string
    onboardingStatus: (typeof EmployeeOnboardingStatus)[keyof typeof EmployeeOnboardingStatus]
    startDate: string
  }
}

type StepKey =
  | 'employeeProfile'
  | 'compensation'
  | 'federalTaxes'
  | 'stateTaxes'
  | 'paymentMethod'
  | 'deductions'
  | 'employeeDocuments'

const STEP_LABEL_NAMESPACE = 'Employee.OnboardingExecutionFlow' as const
const BACK_EVENT = componentEvents.EMPLOYEE_ONBOARDING_BACK

const employeeDocumentsConfigCompletedStatuses: Set<
  (typeof EmployeeOnboardingStatus)[keyof typeof EmployeeOnboardingStatus]
> = new Set([
  EmployeeOnboardingStatus.SELF_ONBOARDING_COMPLETED_BY_EMPLOYEE,
  EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW,
  EmployeeOnboardingStatus.ONBOARDING_COMPLETED,
])

const employeeDocumentsGuard = (ctx: OnboardingContextInterface) => {
  if (!ctx.withEmployeeI9) return false
  if (ctx.onboardingStatus && employeeDocumentsConfigCompletedStatuses.has(ctx.onboardingStatus))
    return false
  return true
}

const selfOnboardingGuard = (ctx: OnboardingContextInterface) =>
  ctx.onboardingStatus
    ? !(
        // prettier-ignore
        // @ts-expect-error: onboarding_status during runtime can be one of self onboarding statuses
        (EmployeeSelfOnboardingStatuses.has(ctx.onboardingStatus) ||
        ctx.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE)
      )
    : true

const isSelfOnboarding = (ctx: OnboardingContextInterface) => !selfOnboardingGuard(ctx)

/** @internal */
export const getTotalSteps = (ctx: OnboardingContextInterface): number => {
  const baseSteps = isSelfOnboarding(ctx) ? 3 : 6
  return baseSteps + (employeeDocumentsGuard(ctx) ? 1 : 0)
}

const getStepNumber = (state: StepKey, ctx: OnboardingContextInterface): number => {
  switch (state) {
    case 'employeeProfile':
      return 1
    case 'compensation':
      return 2
    case 'federalTaxes':
      return 3
    case 'stateTaxes':
      return 4
    case 'paymentMethod':
      return 5
    case 'deductions':
      return isSelfOnboarding(ctx) ? 3 : 6
    case 'employeeDocuments':
      return isSelfOnboarding(ctx) ? 4 : 7
  }
}

const backTo = (labelKey: string): BackConfig => ({
  labelKey,
  namespace: STEP_LABEL_NAMESPACE,
  event: BACK_EVENT,
})

/** @internal */
export const stepHeader = (
  ctx: OnboardingContextInterface,
  step: StepKey,
  back?: BackConfig | null,
): FlowHeaderConfig => ({
  indicator: 'progress',
  currentStep: getStepNumber(step, ctx),
  totalSteps: getTotalSteps(ctx),
  ...(back && { back }),
})

const advance = (step: StepKey, component: React.ComponentType, backLabelKey: string) =>
  reduce(
    (ctx: OnboardingContextInterface): OnboardingContextInterface => ({
      ...ctx,
      component,
      header: stepHeader(ctx, step, backTo(backLabelKey)),
    }),
  )

/** @internal */
export const onboardingExecutionMachine = {
  employeeProfile: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_PROFILE_DONE,
      'compensation',
      reduce(
        (
          ctx: OnboardingContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_PROFILE_DONE>,
        ): OnboardingContextInterface => {
          const updatedCtx = {
            ...ctx,
            employeeId: ev.payload.uuid,
            onboardingStatus: ev.payload.onboardingStatus,
            startDate: ev.payload.startDate,
          }
          return {
            ...updatedCtx,
            component: CompensationContextual,
            header: stepHeader(updatedCtx, 'compensation', backTo('employeeProfile')),
          }
        },
      ),
    ),
  ),
  compensation: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_DONE,
      'federalTaxes',
      advance('federalTaxes', FederalTaxesContextual, 'compensation'),
      guard(selfOnboardingGuard),
    ),
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_DONE,
      'deductions',
      advance('deductions', DeductionsContextual, 'compensation'),
    ),
    transition(
      componentEvents.EMPLOYEE_ONBOARDING_BACK,
      'employeeProfile',
      reduce(
        (ctx: OnboardingContextInterface): OnboardingContextInterface => ({
          ...ctx,
          component: ProfileContextual,
          header: stepHeader(ctx, 'employeeProfile', ctx.initialBack),
        }),
      ),
    ),
  ),
  federalTaxes: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE,
      'stateTaxes',
      advance('stateTaxes', StateTaxesContextual, 'federalTaxes'),
      guard(selfOnboardingGuard),
    ),
    transition(
      componentEvents.EMPLOYEE_ONBOARDING_BACK,
      'compensation',
      advance('compensation', CompensationContextual, 'employeeProfile'),
    ),
  ),
  stateTaxes: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_STATE_TAXES_DONE,
      'paymentMethod',
      advance('paymentMethod', PaymentMethodContextual, 'stateTaxes'),
      guard(selfOnboardingGuard),
    ),
    transition(
      componentEvents.EMPLOYEE_ONBOARDING_BACK,
      'federalTaxes',
      advance('federalTaxes', FederalTaxesContextual, 'compensation'),
    ),
  ),
  paymentMethod: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE,
      'deductions',
      advance('deductions', DeductionsContextual, 'paymentMethod'),
    ),
    transition(
      componentEvents.EMPLOYEE_ONBOARDING_BACK,
      'stateTaxes',
      advance('stateTaxes', StateTaxesContextual, 'federalTaxes'),
    ),
  ),
  deductions: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_DONE,
      'employeeDocuments',
      advance('employeeDocuments', EmployeeDocumentsContextual, 'deductions'),
      guard(employeeDocumentsGuard),
    ),
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_DONE,
      'summary',
      reduce(
        (ctx: OnboardingContextInterface): OnboardingContextInterface => ({
          ...ctx,
          component: OnboardingSummaryContextual,
          header: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_ONBOARDING_BACK,
      'compensation',
      advance('compensation', CompensationContextual, 'employeeProfile'),
      guard((ctx: OnboardingContextInterface) => !selfOnboardingGuard(ctx)),
    ),
    transition(
      componentEvents.EMPLOYEE_ONBOARDING_BACK,
      'paymentMethod',
      advance('paymentMethod', PaymentMethodContextual, 'stateTaxes'),
    ),
  ),
  employeeDocuments: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_DOCUMENTS_DONE,
      'summary',
      reduce(
        (ctx: OnboardingContextInterface): OnboardingContextInterface => ({
          ...ctx,
          component: OnboardingSummaryContextual,
          header: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_ONBOARDING_BACK,
      'deductions',
      advance('deductions', DeductionsContextual, 'compensation'),
      guard((ctx: OnboardingContextInterface) => !selfOnboardingGuard(ctx)),
    ),
    transition(
      componentEvents.EMPLOYEE_ONBOARDING_BACK,
      'deductions',
      advance('deductions', DeductionsContextual, 'paymentMethod'),
    ),
  ),
  summary: state<MachineTransition>(),
}

/** @internal */
export const INITIAL_COMPONENT_MAP = {
  employeeProfile: ProfileContextual,
} as const

/**
 * The set of steps {@link OnboardingExecutionFlow} can be started on.
 *
 * @public
 */
export type OnboardingExecutionInitialState = keyof typeof INITIAL_COMPONENT_MAP
