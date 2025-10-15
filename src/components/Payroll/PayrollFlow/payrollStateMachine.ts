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
import { buildBreadcrumbs } from '@/helpers/buildBreadcrumbs'

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
  }
}

export const payrollFlowBreadcrumbsNodes = {
  list: {
    parent: null,
    item: { key: 'list', label: 'breadcrumbs.list', namespace: 'Payroll.Flow' },
  },
  configuration: {
    parent: 'list',
    item: { key: 'configuration', label: 'breadcrumbs.configuration', namespace: 'Payroll.Flow' },
  },
  overview: {
    parent: 'configuration',
    item: { key: 'overview', label: 'breadcrumbs.overview', namespace: 'Payroll.Flow' },
  },
  editEmployee: {
    parent: 'configuration',
    item: { key: 'editEmployee', label: 'breadcrumbs.editEmployee', namespace: 'Payroll.Flow' },
  },
  receipts: {
    parent: 'overview',
    item: { key: 'receipts', label: 'breadcrumbs.receipts', namespace: 'Payroll.Flow' },
  },
} as const

const createReducer = (props: Partial<PayrollFlowContextInterface>) => {
  return (ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
    ...ctx,
    ...props,
  })
}

function resolveBreadcrumbVariables(
  variables: Record<string, string> | undefined,
  context: PayrollFlowContextInterface,
): Record<string, unknown> {
  if (!variables) {
    return {}
  }

  const resolved: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(variables)) {
    const match = value.match(/{{(.*?)}}/)
    if (match?.[1]) {
      const ctxKey = match[1].trim()
      resolved[key] = context[ctxKey as keyof PayrollFlowContextInterface] ?? ''
    } else {
      resolved[key] = value
    }
  }
  return resolved
}
function updateBreadcrumbs(
  stateName: string,
  context: PayrollFlowContextInterface,
  variables?: Record<string, string>,
) {
  const allBreadcrumbs = context.breadcrumbs ?? {}
  const trail = allBreadcrumbs[stateName] ?? []
  const resolvedTrail = trail.map(breadcrumb => ({
    ...breadcrumb,
    variables:
      breadcrumb.key === stateName
        ? resolveBreadcrumbVariables(variables, context)
        : breadcrumb.variables,
  }))
  return {
    ...context,
    breadcrumbs: {
      ...allBreadcrumbs,
      [stateName]: resolvedTrail,
    },
    currentBreadcrumb: stateName,
  }
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
            currentBreadcrumb: 'configuration',
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
            currentBreadcrumb: 'overview',
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
            ...updateBreadcrumbs('overview', ctx),
            component: PayrollOverviewContextual,
            currentStep: 2,
            alerts: ev.payload.alert ? [...(ctx.alerts ?? []), ev.payload.alert] : ctx.alerts,
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
