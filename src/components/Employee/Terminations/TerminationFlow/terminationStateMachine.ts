import { transition, reduce, state, guard } from 'robot3'
import type { PayrollOption } from '../types'
import type {
  TerminationFlowContextInterface,
  TerminationFlowAlert,
} from './TerminationFlowComponents'
import {
  TerminateEmployeeContextual,
  TerminationSummaryContextual,
  DismissalFlowContextual,
} from './TerminationFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import type { BreadcrumbNodes } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'

type EventPayloads = {
  [componentEvents.EMPLOYEE_TERMINATION_DONE]: {
    employeeId: string
    effectiveDate: string
    payrollOption: PayrollOption
    payrollUuid?: string
  }
  [componentEvents.EMPLOYEE_TERMINATION_VIEW_SUMMARY]: {
    employeeId: string
    effectiveDate: string
    payrollOption?: PayrollOption
  }
  [componentEvents.EMPLOYEE_TERMINATION_EDIT]: {
    employeeId: string
  }
  [componentEvents.EMPLOYEE_TERMINATION_CANCELLED]: {
    employeeId: string
    alert?: TerminationFlowAlert
  }
  [componentEvents.EMPLOYEE_TERMINATION_RUN_OFF_CYCLE_PAYROLL]: {
    employeeId: string
    companyId: string
  }
  [componentEvents.EMPLOYEE_TERMINATION_RUN_PAYROLL]: {
    employeeId: string
    companyId: string
    payrollUuid?: string
  }
}

export const terminationBreadcrumbNodes: BreadcrumbNodes = {
  form: {
    parent: null,
    item: {
      id: 'form',
      label: 'breadcrumbs.form',
      namespace: 'Employee.Terminations.TerminationFlow',
      onNavigate: ((ctx: TerminationFlowContextInterface) => ({
        ...ctx,
        component: TerminateEmployeeContextual,
        currentBreadcrumbId: 'form',
        progressBarType: 'breadcrumbs',
      })) as (context: unknown) => unknown,
    },
  },
  summary: {
    parent: 'form',
    item: {
      id: 'summary',
      label: 'breadcrumbs.summary',
      namespace: 'Employee.Terminations.TerminationFlow',
      onNavigate: ((ctx: TerminationFlowContextInterface) => ({
        ...ctx,
        component: TerminationSummaryContextual,
        currentBreadcrumbId: 'summary',
        progressBarType: 'breadcrumbs',
      })) as (context: unknown) => unknown,
    },
  },
  dismissal: {
    parent: 'summary',
    item: {
      id: 'dismissal',
      label: 'breadcrumbs.dismissal',
      namespace: 'Employee.Terminations.TerminationFlow',
      onNavigate: ((ctx: TerminationFlowContextInterface) => ({
        ...ctx,
        component: DismissalFlowContextual,
        currentBreadcrumbId: 'dismissal',
        progressBarType: null,
      })) as (context: unknown) => unknown,
    },
  },
}

function toFormReducer(ctx: TerminationFlowContextInterface): TerminationFlowContextInterface {
  return {
    ...ctx,
    component: TerminateEmployeeContextual,
    currentBreadcrumbId: 'form',
    progressBarType: 'breadcrumbs',
  }
}

function toSummaryReducer(ctx: TerminationFlowContextInterface): TerminationFlowContextInterface {
  return {
    ...ctx,
    component: TerminationSummaryContextual,
    currentBreadcrumbId: 'summary',
    progressBarType: 'breadcrumbs',
  }
}

const formBreadcrumbTransition = transition(
  componentEvents.BREADCRUMB_NAVIGATE,
  'form',
  guard(
    (_ctx: TerminationFlowContextInterface, ev: { payload: { key: string } }) =>
      ev.payload.key === 'form',
  ),
  reduce(toFormReducer),
)

const summaryBreadcrumbTransition = transition(
  componentEvents.BREADCRUMB_NAVIGATE,
  'summary',
  guard(
    (_ctx: TerminationFlowContextInterface, ev: { payload: { key: string } }) =>
      ev.payload.key === 'summary',
  ),
  reduce(toSummaryReducer),
)

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
            payrollUuid: ev.payload.payrollUuid,
            alerts: undefined,
            currentBreadcrumbId: 'summary',
          }
        },
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_TERMINATION_VIEW_SUMMARY,
      'summary',
      reduce(
        (
          ctx: TerminationFlowContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.EMPLOYEE_TERMINATION_VIEW_SUMMARY
          >,
        ): TerminationFlowContextInterface => {
          return {
            ...ctx,
            component: TerminationSummaryContextual,
            alerts: undefined,
            currentBreadcrumbId: 'summary',
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
          currentBreadcrumbId: 'form',
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
            currentBreadcrumbId: 'form',
          }
        },
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_TERMINATION_RUN_PAYROLL,
      'dismissalPayroll',
      reduce(
        (
          ctx: TerminationFlowContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.EMPLOYEE_TERMINATION_RUN_PAYROLL
          >,
        ): TerminationFlowContextInterface => {
          return {
            ...ctx,
            component: DismissalFlowContextual,
            payrollUuid: ev.payload.payrollUuid ?? ctx.payrollUuid,
            progressBarType: null,
          }
        },
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_TERMINATION_RUN_OFF_CYCLE_PAYROLL,
      'dismissalPayroll',
      reduce((ctx: TerminationFlowContextInterface): TerminationFlowContextInterface => {
        return {
          ...ctx,
          component: DismissalFlowContextual,
          payrollUuid: undefined,
          progressBarType: null,
        }
      }),
    ),
    formBreadcrumbTransition,
  ),
  dismissalPayroll: state<MachineTransition>(
    transition(
      componentEvents.PAYROLL_EXIT_FLOW,
      'summary',
      reduce(
        (ctx: TerminationFlowContextInterface): TerminationFlowContextInterface => ({
          ...toSummaryReducer(ctx),
          dismissalPayrollCompleted: true,
        }),
      ),
    ),
    summaryBreadcrumbTransition,
    formBreadcrumbTransition,
  ),
}
