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
import { createBackHeaderFactory } from '@/components/Flow/useFlow'

type EventPayloads = {
  [componentEvents.EMPLOYEE_PROFILE_DONE]: {
    uuid: string
    onboardingStatus: (typeof EmployeeOnboardingStatus)[keyof typeof EmployeeOnboardingStatus]
    startDate: string
  }
}

const backHeaderTo = createBackHeaderFactory({
  namespace: 'Employee.OnboardingExecutionFlow',
  event: componentEvents.EMPLOYEE_ONBOARDING_BACK,
})

const backToProfileHeader = backHeaderTo('employeeProfile')
const backToCompensationHeader = backHeaderTo('compensation')
const backToFederalTaxesHeader = backHeaderTo('federalTaxes')
const backToStateTaxesHeader = backHeaderTo('stateTaxes')
const backToPaymentMethodHeader = backHeaderTo('paymentMethod')
const backToDeductionsHeader = backHeaderTo('deductions')

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
        (EmployeeSelfOnboardingStatuses.has(ctx.onboardingStatus) ||
        ctx.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE)
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
          header: backToProfileHeader,
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
      reduce(
        createReducer({ component: FederalTaxesContextual, header: backToCompensationHeader }),
      ),
      guard(selfOnboardingGuard),
    ),
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_DONE,
      'deductions',
      reduce(createReducer({ component: DeductionsContextual, header: backToCompensationHeader })),
    ),
    transition(
      componentEvents.EMPLOYEE_ONBOARDING_BACK,
      'employeeProfile',
      reduce(
        (ctx: OnboardingContextInterface): OnboardingContextInterface => ({
          ...ctx,
          component: ProfileContextual,
          header: ctx.initialHeader ?? null,
        }),
      ),
    ),
  ),
  federalTaxes: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE,
      'stateTaxes',
      reduce(createReducer({ component: StateTaxesContextual, header: backToFederalTaxesHeader })),
      guard(selfOnboardingGuard),
    ),
    transition(
      componentEvents.EMPLOYEE_ONBOARDING_BACK,
      'compensation',
      reduce(createReducer({ component: CompensationContextual, header: backToProfileHeader })),
    ),
  ),
  stateTaxes: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_STATE_TAXES_DONE,
      'paymentMethod',
      reduce(createReducer({ component: PaymentMethodContextual, header: backToStateTaxesHeader })),
      guard(selfOnboardingGuard),
    ),
    transition(
      componentEvents.EMPLOYEE_ONBOARDING_BACK,
      'federalTaxes',
      reduce(
        createReducer({ component: FederalTaxesContextual, header: backToCompensationHeader }),
      ),
    ),
  ),
  paymentMethod: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE,
      'deductions',
      reduce(createReducer({ component: DeductionsContextual, header: backToPaymentMethodHeader })),
    ),
    transition(
      componentEvents.EMPLOYEE_ONBOARDING_BACK,
      'stateTaxes',
      reduce(createReducer({ component: StateTaxesContextual, header: backToFederalTaxesHeader })),
    ),
  ),
  deductions: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_DONE,
      'employeeDocuments',
      reduce(
        createReducer({ component: EmployeeDocumentsContextual, header: backToDeductionsHeader }),
      ),
      guard(employeeDocumentsGuard),
    ),
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_DONE,
      'summary',
      reduce(createReducer({ component: OnboardingSummaryContextual, header: null })),
    ),
    transition(
      componentEvents.EMPLOYEE_ONBOARDING_BACK,
      'compensation',
      reduce(createReducer({ component: CompensationContextual, header: backToProfileHeader })),
      guard((ctx: OnboardingContextInterface) => !selfOnboardingGuard(ctx)),
    ),
    transition(
      componentEvents.EMPLOYEE_ONBOARDING_BACK,
      'paymentMethod',
      reduce(createReducer({ component: PaymentMethodContextual, header: backToStateTaxesHeader })),
    ),
  ),
  employeeDocuments: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_DOCUMENTS_DONE,
      'summary',
      reduce(createReducer({ component: OnboardingSummaryContextual, header: null })),
    ),
    transition(
      componentEvents.EMPLOYEE_ONBOARDING_BACK,
      'deductions',
      reduce(createReducer({ component: DeductionsContextual, header: backToCompensationHeader })),
      guard((ctx: OnboardingContextInterface) => !selfOnboardingGuard(ctx)),
    ),
    transition(
      componentEvents.EMPLOYEE_ONBOARDING_BACK,
      'deductions',
      reduce(createReducer({ component: DeductionsContextual, header: backToPaymentMethodHeader })),
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
