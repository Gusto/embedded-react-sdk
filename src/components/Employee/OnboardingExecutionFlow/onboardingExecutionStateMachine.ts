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

type EventPayloads = {
  [componentEvents.EMPLOYEE_PROFILE_DONE]: {
    uuid: string
    onboardingStatus: (typeof EmployeeOnboardingStatus)[keyof typeof EmployeeOnboardingStatus]
    startDate: string
  }
}

const createReducer = (props: Partial<OnboardingContextInterface>) => {
  return (ctx: OnboardingContextInterface): OnboardingContextInterface => ({
    ...ctx,
    ...props,
  })
}

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
        EmployeeSelfOnboardingStatuses.has(ctx.onboardingStatus) ||
        ctx.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE
      )
    : true

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
        ): OnboardingContextInterface => ({
          ...ctx,
          component: CompensationContextual,
          employeeId: ev.payload.uuid,
          onboardingStatus: ev.payload.onboardingStatus,
          startDate: ev.payload.startDate,
        }),
      ),
    ),
  ),
  compensation: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_DONE,
      'federalTaxes',
      reduce(createReducer({ component: FederalTaxesContextual })),
      guard(selfOnboardingGuard),
    ),
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_DONE,
      'deductions',
      reduce(createReducer({ component: DeductionsContextual })),
    ),
  ),
  federalTaxes: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE,
      'stateTaxes',
      reduce(createReducer({ component: StateTaxesContextual })),
      guard(selfOnboardingGuard),
    ),
  ),
  stateTaxes: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_STATE_TAXES_DONE,
      'paymentMethod',
      reduce(createReducer({ component: PaymentMethodContextual })),
      guard(selfOnboardingGuard),
    ),
  ),
  paymentMethod: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE,
      'deductions',
      reduce(createReducer({ component: DeductionsContextual })),
    ),
  ),
  deductions: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_DONE,
      'employeeDocuments',
      reduce(createReducer({ component: EmployeeDocumentsContextual })),
      guard(employeeDocumentsGuard),
    ),
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_DONE,
      'summary',
      reduce(createReducer({ component: OnboardingSummaryContextual })),
    ),
  ),
  employeeDocuments: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_DOCUMENTS_DONE,
      'summary',
      reduce(createReducer({ component: OnboardingSummaryContextual })),
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
