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
import { EventType, componentEvents } from '@/shared/constants'
import type { EmployeeOnboardingContextInterface } from '@/components/Flow/EmployeeOnboardingFlow'

type MachineEventType = { type: EventType; payload: Record<string, unknown> }

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
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_UPDATE,
      'employeeProfile',
      reduce(
        (
          ctx: EmployeeOnboardingContextInterface,
          ev: MachineEventType,
        ): EmployeeOnboardingContextInterface => {
          return {
            ...ctx,
            component: ProfileContextual,
            employeeId: ev.payload.employeeId as string,
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
          ev: MachineEventType,
        ): EmployeeOnboardingContextInterface => ({
          ...ctx,
          component: CompensationContextual,
          employeeId: ev.payload.uuid as string,
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
          component: ProfileContextual,
        }),
      ),
    ),
  ),
}
