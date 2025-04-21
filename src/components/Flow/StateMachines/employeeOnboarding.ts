import { transition, reduce, state, guard } from 'robot3'
import {
  EmployeeOnboardingStatus,
  EmployeeSelfOnboardingStatuses,
  componentEvents,
} from '@/shared/constants'
import type { EmployeeOnboardingContextInterface } from '@/components/Flow/EmployeeOnboardingFlow'
import { SDKI18next } from '@/contexts/GustoProvider'
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

const cancelTransition = (target: string, component?: React.ComponentType) =>
  transition(
    componentEvents.CANCEL,
    target,
    reduce(
      (ctx: EmployeeOnboardingContextInterface): EmployeeOnboardingContextInterface => ({
        ...ctx,
        component: component ?? EmployeeListContextual,
      }),
    ),
  )

const selfOnboardingGuard = (ctx: EmployeeOnboardingContextInterface) =>
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
      reduce(
        (ctx: EmployeeOnboardingContextInterface): EmployeeOnboardingContextInterface => ({
          ...ctx,
          employeeId: undefined,
          component: ProfileContextual,
          title: SDKI18next.t('flows.employeeOnboarding.profileTitle'),
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_UPDATE,
      'employeeProfile',
      reduce(
        (
          ctx: EmployeeOnboardingContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_UPDATE>,
        ): EmployeeOnboardingContextInterface => {
          return {
            ...ctx,
            component: ProfileContextual,
            employeeId: ev.payload.employeeId,
            onboardingStatus: ev.payload.onboardingStatus,
            title: SDKI18next.t('flows.employeeOnboarding.profileTitle'),
          }
        },
      ),
    ),
  ),
  employeeProfile: state(
    transition(
      componentEvents.EMPLOYEE_PROFILE_DONE,
      'compensation',
      reduce(
        (
          ctx: EmployeeOnboardingContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_PROFILE_DONE>,
        ): EmployeeOnboardingContextInterface => ({
          ...ctx,
          component: CompensationContextual,
          employeeId: ev.payload.uuid,
          onboardingStatus: ev.payload.onboardingStatus,
          startDate: ev.payload.startDate,
          title: SDKI18next.t('flows.employeeOnboarding.compensationTitle'),
        }),
      ),
    ),
    cancelTransition('index'),
  ),
  compensation: state(
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_DONE,
      'employeeTaxes',
      reduce((ctx: EmployeeOnboardingContextInterface) => ({
        ...ctx,
        component: TaxesContextual,
        title: SDKI18next.t('flows.employeeOnboarding.taxesTitle'),
      })),
      guard(selfOnboardingGuard),
    ),
    transition(
      componentEvents.EMPLOYEE_COMPENSATION_DONE,
      'deductions',
      reduce((ctx: EmployeeOnboardingContextInterface) => ({
        ...ctx,
        component: DeductionsContextual,
        title: SDKI18next.t('flows.employeeOnboarding.deductionsTitle'),
      })),
    ),
    cancelTransition('index'),
  ),
  employeeTaxes: state(
    transition(
      componentEvents.EMPLOYEE_TAXES_DONE,
      'paymentMethod',
      reduce((ctx: EmployeeOnboardingContextInterface) => ({
        ...ctx,
        component: PaymentMethodContextual,
        title: SDKI18next.t('flows.employeeOnboarding.paymentMethodTitle'),
      })),
      guard(selfOnboardingGuard),
    ),
    cancelTransition('index'),
  ),
  paymentMethod: state(
    transition(
      componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE,
      'deductions',
      reduce((ctx: EmployeeOnboardingContextInterface) => ({
        ...ctx,
        component: DeductionsContextual,
        title: SDKI18next.t('flows.employeeOnboarding.deductionsTitle'),
      })),
    ),
    cancelTransition('index'),
  ),
  deductions: state(
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_DONE,
      'summary',
      reduce((ctx: EmployeeOnboardingContextInterface) => ({
        ...ctx,
        component: OnboardingSummaryContextual,
        title: SDKI18next.t('flows.employeeOnboarding.summaryTitle'),
      })),
    ),

    cancelTransition('index'),
  ),
  summary: state(
    transition(
      componentEvents.EMPLOYEES_LIST,
      'index',
      reduce(
        (ctx: EmployeeOnboardingContextInterface): EmployeeOnboardingContextInterface => ({
          ...ctx,
          employeeId: undefined,
          component: EmployeeListContextual,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_CREATE,
      'employeeProfile',
      reduce(
        (ctx: EmployeeOnboardingContextInterface): EmployeeOnboardingContextInterface => ({
          ...ctx,
          employeeId: undefined,
          component: ProfileContextual,
          title: SDKI18next.t('flows.employeeOnboarding.profileTitle'),
        }),
      ),
    ),
  ),
}
