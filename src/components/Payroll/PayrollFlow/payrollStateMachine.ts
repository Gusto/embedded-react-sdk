import { transition, reduce, state } from 'robot3'
import {
  PayrollLandingContextual,
  PayrollConfigurationContextual,
  PayrollOverviewContextual,
  PayrollEditEmployeeContextual,
  PayrollReceiptsContextual,
  type PayrollFlowContextInterface,
} from './PayrollFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.RUN_PAYROLL_SELECTED]: {
    payrollId: string
  }
  [componentEvents.RUN_PAYROLL_EMPLOYEE_EDIT]: {
    employeeId: string
  }
}

const createReducer = (props: Partial<PayrollFlowContextInterface>) => {
  return (ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
    ...ctx,
    ...props,
  })
}

export const payrollMachine = {
  landing: state<MachineTransition>(
    transition(
      componentEvents.RUN_PAYROLL_SELECTED,
      'configuration',
      reduce(
        (
          ctx: PayrollFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.RUN_PAYROLL_SELECTED>,
        ): PayrollFlowContextInterface => {
          return {
            ...ctx,
            component: PayrollConfigurationContextual,
            payrollId: ev.payload.payrollId,
            currentStep: 1,
            showProgress: true,
          }
        },
      ),
    ),
  ),
  configuration: state<MachineTransition>(
    transition(
      componentEvents.RUN_PAYROLL_CALCULATED,
      'overview',
      reduce(createReducer({ component: PayrollOverviewContextual, currentStep: 2 })),
    ),
    transition(
      componentEvents.RUN_PAYROLL_BACK,
      'landing',
      reduce(
        createReducer({ component: PayrollLandingContextual, currentStep: 1, showProgress: false }),
      ),
    ),
    transition(
      componentEvents.RUN_PAYROLL_EMPLOYEE_EDIT,
      'editEmployee',
      reduce(
        (
          ctx: PayrollFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.RUN_PAYROLL_EMPLOYEE_EDIT>,
        ): PayrollFlowContextInterface => {
          return {
            ...ctx,
            component: PayrollEditEmployeeContextual,
            employeeId: ev.payload.employeeId,
          }
        },
      ),
    ),
  ),
  overview: state<MachineTransition>(
    transition(
      componentEvents.RUN_PAYROLL_BACK,
      'configuration',
      reduce(createReducer({ component: PayrollConfigurationContextual, currentStep: 1 })),
    ),
    transition(
      componentEvents.RUN_PAYROLL_EDIT,
      'configuration',
      reduce(createReducer({ component: PayrollConfigurationContextual, currentStep: 1 })),
    ),
    transition(
      componentEvents.RUN_PAYROLL_RECEIPT_GET,
      'receipts',
      reduce(createReducer({ component: PayrollReceiptsContextual, currentStep: 3 })),
    ),
    transition(
      componentEvents.RUN_PAYROLL_CANCELLED,
      'configuration',
      reduce(
        createReducer({
          component: PayrollConfigurationContextual,
          currentStep: 1,
          payrollId: undefined,
        }),
      ),
    ),
  ),
  editEmployee: state<MachineTransition>(
    transition(
      componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED,
      'configuration',
      reduce(
        createReducer({
          component: PayrollConfigurationContextual,
          employeeId: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.RUN_PAYROLL_EMPLOYEE_CANCELLED,
      'configuration',
      reduce(
        createReducer({
          component: PayrollConfigurationContextual,
          employeeId: undefined,
        }),
      ),
    ),
  ),
  receipts: state<MachineTransition>(
    transition(
      componentEvents.RUN_PAYROLL_BACK,
      'overview',
      reduce(createReducer({ component: PayrollOverviewContextual, currentStep: 2 })),
    ),
  ),
}
