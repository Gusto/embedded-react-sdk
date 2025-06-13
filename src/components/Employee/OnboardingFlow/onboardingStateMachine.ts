import { transition, reduce, state, guard } from 'robot3'
import type { OnboardingContextInterface } from './OnboardingFlow'
import {
  EmployeeOnboardingStatus,
  EmployeeSelfOnboardingStatuses,
  componentEvents,
} from '@/shared/constants'
import { type MachineEventType } from '@/types/Helpers'
import { CompensationContextual } from '@/components/Employee/Compensation'
import { DeductionsContextual } from '@/components/Employee/Deductions'
import { EmployeeListContextual } from '@/components/Employee/EmployeeList/EmployeeList'
import { PaymentMethodContextual } from '@/components/Employee/PaymentMethod'
import { ProfileContextual } from '@/components/Employee/Profile'
import { TaxesContextual } from '@/components/Employee/Taxes'
import { OnboardingSummaryContextual } from '@/components/Employee/OnboardingSummary'

type EventPayloads = {
  [componentEvents.EMPLOYEE_UPDATE]: {
    employeeId: string
    onboardingStatus: (typeof EmployeeOnboardingStatus)[keyof typeof EmployeeOnboardingStatus]
  }
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

const cancelTransition = (target: string, component?: React.ComponentType) =>
  transition(
    componentEvents.CANCEL,
    target,
    reduce(createReducer({ component: component ?? EmployeeListContextual })),
  )

const selfOnboardingGuard = (ctx: OnboardingContextInterface) =>
  ctx.onboardingStatus
    ? !(
        // prettier-ignore
        // @ts-expect-error: onboarding_status during runtime can be one of self onboarding statuses
        (EmployeeSelfOnboardingStatuses.has(ctx.onboardingStatus) ||
        ctx.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE)
      )
    : true

export const employeeOnboardingMachine = {
  index: state(
    transition(
      componentEvents.EMPLOYEE_CREATE,
      'employeeProfile',
      reduce(createReducer({ component: ProfileContextual, employeeId: undefined })),
    ),
    transition(
      componentEvents.EMPLOYEE_UPDATE,
      'employeeProfile',

      reduce(
        (
          ctx: OnboardingContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_UPDATE>,
        ): OnboardingContextInterface => {
          return {
            ...ctx,
            component: ProfileContextual,
            employeeId: ev.payload.employeeId,
            onboardingStatus: ev.payload.onboardingStatus,
          }
        },
      ),
    ),
    transition(componentEvents.EMPLOYEE_ONBOARDING_DONE, 'final'),
  ),
  employeeProfile: state(
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
    cancelTransition('index'),
  ),
  compensation: state(
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_DONE,
      'employeeTaxes',
      reduce(createReducer({ component: TaxesContextual })),
      guard(selfOnboardingGuard),
    ),
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_DONE,
      'deductions',
      reduce(createReducer({ component: DeductionsContextual })),
    ),
    cancelTransition('index'),
  ),
  employeeTaxes: state(
    transition(
      componentEvents.EMPLOYEE_TAXES_DONE,
      'paymentMethod',
      reduce(createReducer({ component: PaymentMethodContextual })),
      guard(selfOnboardingGuard),
    ),
    cancelTransition('index'),
  ),
  paymentMethod: state(
    transition(
      componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE,
      'deductions',
      reduce(createReducer({ component: DeductionsContextual })),
    ),
    cancelTransition('index'),
  ),
  deductions: state(
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_DONE,
      'summary',
      reduce(createReducer({ component: OnboardingSummaryContextual })),
    ),

    cancelTransition('index'),
  ),
  summary: state(
    transition(
      componentEvents.EMPLOYEES_LIST,
      'index',
      reduce(createReducer({ component: EmployeeListContextual, employeeId: undefined })),
    ),
  ),
  final: state(),
}
