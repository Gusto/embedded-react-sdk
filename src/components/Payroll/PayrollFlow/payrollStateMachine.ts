import { transition, reduce, state, guard } from 'robot3'
import type { PayrollFlowAlert } from './PayrollFlowComponents'
import {
  PayrollConfigurationContextual,
  PayrollOverviewContextual,
  PayrollEditEmployeeContextual,
  PayrollReceiptsContextual,
  PayrollBlockerContextual,
  type PayrollFlowContextInterface,
  PayrollLandingContextual,
} from './PayrollFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import { updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'
import type { BreadcrumbNodes } from '@/components/Common/UI/ProgressBreadcrumbs/ProgressBreadcrumbsTypes'

type EventPayloads = {
  [componentEvents.RUN_PAYROLL_SELECTED]: {
    payrollId: string
  }
  [componentEvents.REVIEW_PAYROLL]: {
    payrollId: string
  }
  [componentEvents.RUN_PAYROLL_EMPLOYEE_EDIT]: {
    employeeId: string
    firstName: string
    lastName: string
  }
  [componentEvents.RUN_PAYROLL_CALCULATED]: {
    payrollId: string
    alert?: PayrollFlowAlert
  }
  [componentEvents.BREADCRUMB_NAVIGATE]: {
    key: string
    onNavigate: (ctx: PayrollFlowContextInterface) => PayrollFlowContextInterface
  }
  [componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL]: undefined
  [componentEvents.RUN_PAYROLL_EDIT]: undefined
}

export const payrollFlowBreadcrumbsNodes: BreadcrumbNodes = {
  landing: {
    parent: null,
    item: {
      key: 'landing',
      label: 'breadcrumbs.landing',
      namespace: 'Payroll.Flow',
      onNavigate: ((ctx: PayrollFlowContextInterface) => ({
        ...ctx,
        currentBreadcrumb: 'landing',
        progressBarType: null,
        component: PayrollLandingContextual,
      })) as (context: unknown) => unknown,
    },
  },
  configuration: {
    parent: 'landing',
    item: {
      key: 'configuration',
      label: 'breadcrumbs.configuration',
      namespace: 'Payroll.Flow',
      onNavigate: ((ctx: PayrollFlowContextInterface) => ({
        ...updateBreadcrumbs('configuration', ctx),
        component: PayrollConfigurationContextual,
      })) as (context: unknown) => unknown,
    },
  },
  overview: {
    parent: 'configuration',
    item: {
      key: 'overview',
      label: 'breadcrumbs.overview',
      namespace: 'Payroll.Flow',
      onNavigate: ((ctx: PayrollFlowContextInterface) => ({
        ...updateBreadcrumbs('overview', ctx),
        component: PayrollOverviewContextual,
        alerts: undefined,
      })) as (context: unknown) => unknown,
    },
  },
  editEmployee: {
    parent: 'configuration',
    item: { key: 'editEmployee', label: 'breadcrumbs.editEmployee', namespace: 'Payroll.Flow' },
  },
  receipts: {
    parent: 'overview',
    item: { key: 'receipts', label: 'breadcrumbs.receipts', namespace: 'Payroll.Flow' },
  },
  blockers: {
    parent: 'landing',
    item: { key: 'blockers', label: 'breadcrumbs.blockers', namespace: 'Payroll.Flow' },
  },
} as const

const createReducer = (props: Partial<PayrollFlowContextInterface>) => {
  return (ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
    ...ctx,
    ...props,
  })
}

const breadcrumbNavigateTransition = (targetState: string) =>
  transition(
    componentEvents.BREADCRUMB_NAVIGATE,
    targetState,
    guard(
      (ctx: PayrollFlowContextInterface, ev: { payload: { key: string } }) =>
        ev.payload.key === targetState,
    ),
    reduce(
      (
        ctx: PayrollFlowContextInterface,
        ev: MachineEventType<EventPayloads, typeof componentEvents.BREADCRUMB_NAVIGATE>,
      ): PayrollFlowContextInterface => ev.payload.onNavigate(ctx),
    ),
  )

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
            ...updateBreadcrumbs('configuration', ctx),
            component: PayrollConfigurationContextual,
            payrollId: ev.payload.payrollId,
            progressBarType: 'breadcrumbs',
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
            ...updateBreadcrumbs('overview', ctx),
            component: PayrollOverviewContextual,
            payrollId: ev.payload.payrollId,
            progressBarType: 'breadcrumbs',
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
  configuration: state<MachineTransition>(
    breadcrumbNavigateTransition('landing'),
    transition(
      componentEvents.RUN_PAYROLL_CALCULATED,
      'overview',
      reduce(
        (
          ctx: PayrollFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.RUN_PAYROLL_CALCULATED>,
        ): PayrollFlowContextInterface => {
          return {
            ...updateBreadcrumbs('overview', ctx),
            component: PayrollOverviewContextual,
            alerts: ev.payload.alert ? [...(ctx.alerts ?? []), ev.payload.alert] : ctx.alerts,
          }
        },
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
            ...updateBreadcrumbs('editEmployee', ctx, {
              firstName: ev.payload.firstName,
              lastName: ev.payload.lastName,
            }),
            progressBarType: 'breadcrumbs',
            component: PayrollEditEmployeeContextual,
            employeeId: ev.payload.employeeId,
            firstName: ev.payload.firstName,
            lastName: ev.payload.lastName,
          }
        },
      ),
    ),
    transition(
      componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL,
      'blockers',
      reduce(
        (
          ctx: PayrollFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL>,
        ): PayrollFlowContextInterface => {
          return {
            ...updateBreadcrumbs('blockers', ctx),
            component: PayrollBlockerContextual,
          }
        },
      ),
    ),
  ),
  overview: state<MachineTransition>(
    breadcrumbNavigateTransition('landing'),
    breadcrumbNavigateTransition('configuration'),
    transition(
      componentEvents.RUN_PAYROLL_EDIT,
      'configuration',
      reduce(
        (
          ctx: PayrollFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.RUN_PAYROLL_EDIT>,
        ): PayrollFlowContextInterface => {
          return {
            ...updateBreadcrumbs('configuration', ctx),
            component: PayrollConfigurationContextual,
          }
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
    breadcrumbNavigateTransition('landing'),
    breadcrumbNavigateTransition('configuration'),
    transition(
      componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED,
      'configuration',
      reduce(
        createReducer({
          currentBreadcrumb: 'configuration',
          component: PayrollConfigurationContextual,
          employeeId: undefined,
          firstName: undefined,
          lastName: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.RUN_PAYROLL_EMPLOYEE_CANCELLED,
      'configuration',
      reduce(
        createReducer({
          currentBreadcrumb: 'configuration',
          component: PayrollConfigurationContextual,
          employeeId: undefined,
          firstName: undefined,
          lastName: undefined,
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
  ),
  blockers: state<MachineTransition>(breadcrumbNavigateTransition('landing')),
}
