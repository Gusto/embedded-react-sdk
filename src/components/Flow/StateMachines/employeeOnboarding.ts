import { transition, reduce, state } from 'robot3'
import {
  ProfileContextual,
  DeductionsContextual,
  TaxesContextual,
  EmployeeListContextual,
  PaymentMethodContextual,
  OnboardingSummaryContextual,
  CompensationContextual,
} from '@/components/Employee'
import { componentEvents } from '@/shared/constants'
import type { EmployeeOnboardingContextInterface } from '@/components/Flow/EmployeeOnboardingFlow'
import { SDKI18next } from '@/contexts'

type EventPayloads = {
  [componentEvents.EMPLOYEE_UPDATE]: {
    employeeId: string
  }
  [componentEvents.EMPLOYEE_PROFILE_DONE]: {
    uuid: string
    start_date: string
  }
}

type MachineEventType<T extends keyof EventPayloads = keyof EventPayloads> = {
  type: T
  payload: EventPayloads[T]
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
          ev: MachineEventType<typeof componentEvents.EMPLOYEE_UPDATE>,
        ): EmployeeOnboardingContextInterface => {
          return {
            ...ctx,
            component: ProfileContextual,
            employeeId: ev.payload.employeeId,
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
          ev: MachineEventType<typeof componentEvents.EMPLOYEE_PROFILE_DONE>,
        ): EmployeeOnboardingContextInterface => ({
          ...ctx,
          component: CompensationContextual,
          employeeId: ev.payload.uuid,
          startDate: ev.payload.start_date,
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
      'addEmployee',
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
