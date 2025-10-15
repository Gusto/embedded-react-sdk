import { transition, reduce, state } from 'robot3'
import type { PayrollFlowAlert } from './PayrollFlowComponents'
import {
  PayrollLandingContextual,
  PayrollConfigurationContextual,
  PayrollOverviewContextual,
  PayrollEditEmployeeContextual,
  PayrollReceiptsContextual,
  PayrollBlockerContextual,
  type PayrollFlowContextInterface,
} from './PayrollFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import type { BreadcrumbStep } from '@/components/Common/UI/ProgressBreadcrumbs/ProgressBreadcrumbsTypes'

type EventPayloads = {
  [componentEvents.RUN_PAYROLL_SELECTED]: {
    payrollId: string
  }
  [componentEvents.REVIEW_PAYROLL]: {
    payrollId: string
  }
  [componentEvents.RUN_PAYROLL_EMPLOYEE_EDIT]: {
    employeeId: string
  }
  [componentEvents.RUN_PAYROLL_CALCULATED]: {
    payrollId: string
    alert?: PayrollFlowAlert
  }
  [componentEvents.BREADCRUMB_NAVIGATE]: {
    key: string
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
            progressBarType: 'breadcrumbs',
            breadcrumbs: [
              ...(ctx.breadcrumbs ?? []),
              {
                key: 'configuration',
                label: 'breadcrumbs.configuration',
                namespace: 'Payroll.Flow',
              },
            ],
          }
        },
      ),
    ),
    transition(
      componentEvents.REVIEW_PAYROLL,
      'overview',
      reduce(
        (
          ctx: PayrollFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.REVIEW_PAYROLL>,
        ): PayrollFlowContextInterface => {
          return {
            ...ctx,
            component: PayrollOverviewContextual,
            payrollId: ev.payload.payrollId,
            currentStep: 2,
            progressBarType: 'breadcrumbs',
            breadcrumbs: [
              ...(ctx.breadcrumbs ?? []),
              {
                key: 'overview',
                label: 'breadcrumbs.overview',
                namespace: 'Payroll.Flow',
              },
            ],
          }
        },
      ),
    ),
  ),
  configuration: state<MachineTransition>(
    transition(
      componentEvents.RUN_PAYROLL_CALCULATED,
      'overview',
      reduce(
        (
          ctx: PayrollFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.RUN_PAYROLL_CALCULATED>,
        ): PayrollFlowContextInterface => {
          return {
            ...ctx,
            component: PayrollOverviewContextual,
            currentStep: 2,
            alerts: ev.payload.alert ? [...(ctx.alerts ?? []), ev.payload.alert] : ctx.alerts,
            breadcrumbs: [
              ...(ctx.breadcrumbs ?? []),
              { key: 'overview', label: 'breadcrumbs.overview', namespace: 'Payroll.Flow' },
            ],
          }
        },
      ),
    ),
    transition(
      componentEvents.RUN_PAYROLL_BACK,
      'landing',
      reduce(
        createReducer({
          component: PayrollLandingContextual,
          currentStep: 1,
          progressBarType: null,
        }),
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
    transition(
      componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL,
      'blockers',
      reduce(createReducer({ component: PayrollBlockerContextual })),
    ),
  ),
  overview: state<MachineTransition>(
    transition(
      componentEvents.RUN_PAYROLL_BACK,
      'configuration',
      reduce(
        createReducer({
          component: PayrollConfigurationContextual,
          currentStep: 1,
        }),
      ),
    ),
    transition(
      componentEvents.RUN_PAYROLL_EDIT,
      'configuration',
      reduce(
        createReducer({
          component: PayrollConfigurationContextual,
          currentStep: 1,
        }),
      ),
    ),
    transition(
      componentEvents.BREADCRUMB_NAVIGATE,
      'configuration',
      reduce(
        (
          ctx: PayrollFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.BREADCRUMB_NAVIGATE>,
        ): PayrollFlowContextInterface => {
          if (ev.payload.key === 'configuration') {
            return {
              ...ctx,
              component: PayrollConfigurationContextual,
              currentStep: 1,
            }
          }
          return ctx
        },
      ),
    ),
    transition(
      componentEvents.RUN_PAYROLL_RECEIPT_GET,
      'receipts',
      reduce(
        createReducer({
          component: PayrollReceiptsContextual,
          currentStep: 3,
        }),
      ),
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
      reduce(
        createReducer({
          component: PayrollOverviewContextual,
          currentStep: 2,
        }),
      ),
    ),
    transition(
      componentEvents.BREADCRUMB_NAVIGATE,
      'configuration',
      reduce(
        (
          ctx: PayrollFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.BREADCRUMB_NAVIGATE>,
        ): PayrollFlowContextInterface => {
          if (ev.payload.key === 'configuration') {
            return {
              ...ctx,
              component: PayrollConfigurationContextual,
              currentStep: 1,
            }
          }
          if (ev.payload.key === 'overview') {
            return {
              ...ctx,
              component: PayrollOverviewContextual,
              currentStep: 2,
            }
          }
          return ctx
        },
      ),
    ),
  ),
  blockers: state<MachineTransition>(),
}
