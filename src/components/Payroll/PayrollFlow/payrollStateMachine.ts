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
import type { BreadcrumbNodes } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'

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
      id: 'landing',
      label: 'labels.breadcrumbLabel',
      namespace: 'Payroll.PayrollLanding',
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
      id: 'configuration',
      label: 'breadcrumbLabel',
      namespace: 'Payroll.PayrollConfiguration',
      onNavigate: ((ctx: PayrollFlowContextInterface) => ({
        ...updateBreadcrumbs('configuration', ctx),
        component: PayrollConfigurationContextual,
      })) as (context: unknown) => unknown,
    },
  },
  overview: {
    parent: 'configuration',
    item: {
      id: 'overview',
      label: 'breadcrumbLabel',
      namespace: 'Payroll.PayrollOverview',
      onNavigate: ((ctx: PayrollFlowContextInterface) => ({
        ...updateBreadcrumbs('overview', ctx),
        component: PayrollOverviewContextual,
        alerts: undefined,
      })) as (context: unknown) => unknown,
    },
  },
  editEmployee: {
    parent: 'configuration',
    item: {
      id: 'editEmployee',
      label: 'breadcrumbLabel',
      namespace: 'Payroll.PayrollEditEmployee',
    },
  },
  receipts: {
    parent: 'overview',
    item: {
      id: 'receipts',
      label: 'breadcrumbLabel',
      namespace: 'Payroll.PayrollReceipts',
    },
  },
  blockers: {
    parent: 'landing',
    item: {
      id: 'blockers',
      label: 'breadcrumbLabel',
      namespace: 'PayrollBlocker',
    },
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

const exitFlowTransition = transition(
  componentEvents.PAYROLL_EXIT_FLOW,
  'landing',
  reduce(
    createReducer({
      component: PayrollLandingContextual,
      progressBarType: null,
      currentBreadcrumbId: 'landing',
    }),
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
            ctaConfig: {
              labelKey: 'exitFlowCta',
              namespace: 'Payroll.PayrollConfiguration',
            },
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
            ctaConfig: {
              labelKey: 'exitFlowCta',
              namespace: 'Payroll.PayrollOverview',
            },
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
            ctaConfig: {
              labelKey: 'exitFlowCta',
              namespace: 'Payroll.PayrollOverview',
            },
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
            ctaConfig: null, // This state does not have exit cta in breadcrumbs
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
    exitFlowTransition,
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
            ctaConfig: {
              labelKey: 'exitFlowCta',
              namespace: 'Payroll.PayrollConfiguration',
            },
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
          progressBarType: 'breadcrumbs',
          ctaConfig: {
            labelKey: 'exitFlowCta',
            namespace: 'Payroll.PayrollReceipts',
          },
        }),
      ),
    ),
    transition(
      componentEvents.RUN_PAYROLL_CANCELLED,
      'landing',
      reduce(
        createReducer({
          component: PayrollLandingContextual,
          progressBarType: null,
          currentBreadcrumbId: 'landing',
        }),
      ),
    ),
    exitFlowTransition,
  ),
  editEmployee: state<MachineTransition>(
    breadcrumbNavigateTransition('landing'),
    breadcrumbNavigateTransition('configuration'),
    transition(
      componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED,
      'configuration',
      reduce(
        createReducer({
          currentBreadcrumbId: 'configuration',
          component: PayrollConfigurationContextual,
          employeeId: undefined,
          firstName: undefined,
          lastName: undefined,
          ctaConfig: {
            labelKey: 'exitFlowCta',
            namespace: 'Payroll.PayrollConfiguration',
          },
        }),
      ),
    ),
    transition(
      componentEvents.RUN_PAYROLL_EMPLOYEE_CANCELLED,
      'configuration',
      reduce(
        createReducer({
          currentBreadcrumbId: 'configuration',
          component: PayrollConfigurationContextual,
          employeeId: undefined,
          firstName: undefined,
          lastName: undefined,
          ctaConfig: {
            labelKey: 'exitFlowCta',
            namespace: 'Payroll.PayrollConfiguration',
          },
        }),
      ),
    ),
  ),
  receipts: state<MachineTransition>(
    exitFlowTransition,
    transition(
      componentEvents.RUN_PAYROLL_BACK,
      'overview',
      reduce(
        createReducer({
          component: PayrollOverviewContextual,
        }),
      ),
    ),
  ),
  blockers: state<MachineTransition>(breadcrumbNavigateTransition('landing')),
}
