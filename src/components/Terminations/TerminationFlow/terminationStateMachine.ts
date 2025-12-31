import { transition, reduce, state } from 'robot3'
import type { PayrollOption } from '../TerminateEmployee/TerminateEmployeePresentation'
import type {
  TerminationFlowContextInterface,
  TerminationFlowAlert,
} from './TerminationFlowComponents'
import {
  TerminateEmployeeContextual,
  TerminationSummaryContextual,
} from './TerminationFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.EMPLOYEE_TERMINATION_DONE]: {
    employeeId: string
    effectiveDate: string
    payrollOption: PayrollOption
  }
  [componentEvents.EMPLOYEE_TERMINATION_EDIT]: {
    employeeId: string
  }
  [componentEvents.EMPLOYEE_TERMINATION_CANCELLED]: {
    employeeId: string
    alert?: TerminationFlowAlert
  }
  [componentEvents.EMPLOYEE_TERMINATION_RUN_PAYROLL]: {
    employeeId: string
    companyId: string
  }
  [componentEvents.EMPLOYEE_TERMINATION_RUN_OFF_CYCLE_PAYROLL]: {
    employeeId: string
    companyId: string
  }
}

export const terminationMachine = {
  form: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_TERMINATION_DONE,
      'summary',
      reduce(
        (
          ctx: TerminationFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_TERMINATION_DONE>,
        ): TerminationFlowContextInterface => {
          return {
            ...ctx,
            component: TerminationSummaryContextual,
            payrollOption: ev.payload.payrollOption,
            alerts: undefined,
          }
        },
      ),
    ),
  ),
  summary: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_TERMINATION_EDIT,
      'form',
      reduce((ctx: TerminationFlowContextInterface): TerminationFlowContextInterface => {
        return {
          ...ctx,
          component: TerminateEmployeeContextual,
          alerts: undefined,
        }
      }),
    ),
    transition(
      componentEvents.EMPLOYEE_TERMINATION_CANCELLED,
      'form',
      reduce(
        (
          ctx: TerminationFlowContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.EMPLOYEE_TERMINATION_CANCELLED
          >,
        ): TerminationFlowContextInterface => {
          return {
            ...ctx,
            component: TerminateEmployeeContextual,
            alerts: ev.payload.alert ? [ev.payload.alert] : undefined,
            payrollOption: undefined,
          }
        },
      ),
    ),
  ),
}
