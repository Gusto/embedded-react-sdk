import { transition, reduce, state } from 'robot3'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import type { PayrollFlowAlert } from '../PayrollFlow/PayrollFlowComponents'
import {
  PayrollConfigurationContextual,
  PayrollOverviewContextual,
  PayrollEditEmployeeContextual,
  PayrollReceiptsContextual,
  PayrollBlockerContextual,
  type PayrollFlowContextInterface,
} from '../PayrollFlow/PayrollFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import { updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'
import type {
  BreadcrumbNode,
  BreadcrumbNodes,
} from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { createBreadcrumbNavigateTransition } from '@/components/Common/FlowBreadcrumbs/breadcrumbTransitionHelpers'

type PayrollEventPayloads = {
  [componentEvents.RUN_PAYROLL_EMPLOYEE_EDIT]: {
    employeeId: string
    firstName: string
    lastName: string
  }
  [componentEvents.RUN_PAYROLL_CALCULATED]: {
    payrollUuid: string
    alert?: PayrollFlowAlert
    payPeriod?: PayrollPayPeriodType
  }
  [componentEvents.BREADCRUMB_NAVIGATE]: {
    key: string
    onNavigate: (ctx: PayrollFlowContextInterface) => PayrollFlowContextInterface
  }
  [componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL]: undefined
  [componentEvents.RUN_PAYROLL_EDIT]: undefined
}

const breadcrumbNavigateTransition =
  createBreadcrumbNavigateTransition<PayrollFlowContextInterface>()

type BreadcrumbNodeKeys = 'configuration' | 'overview' | 'editEmployee' | 'receipts' | 'blockers'

export const payrollExecutionBreadcrumbsNodes: BreadcrumbNodes = {
  configuration: {
    parent: null,
    item: {
      id: 'configuration',
      label: 'breadcrumbLabel',
      namespace: 'Payroll.PayrollConfiguration',
      onNavigate: ((ctx: PayrollFlowContextInterface) => ({
        ...updateBreadcrumbs('configuration', ctx, {
          startDate: ctx.payPeriod?.startDate ?? '',
          endDate: ctx.payPeriod?.endDate ?? '',
        }),
        component: PayrollConfigurationContextual,
        alerts: undefined,
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
        ...updateBreadcrumbs('overview', ctx, {
          startDate: ctx.payPeriod?.startDate ?? '',
          endDate: ctx.payPeriod?.endDate ?? '',
        }),
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
    parent: 'configuration',
    item: {
      id: 'blockers',
      label: 'breadcrumbLabel',
      namespace: 'Payroll.PayrollBlocker',
    },
  },
} satisfies Record<BreadcrumbNodeKeys, BreadcrumbNode>

const calculatedTransition = transition(
  componentEvents.RUN_PAYROLL_CALCULATED,
  'overview',
  reduce(
    (
      ctx: PayrollFlowContextInterface,
      ev: MachineEventType<PayrollEventPayloads, typeof componentEvents.RUN_PAYROLL_CALCULATED>,
    ): PayrollFlowContextInterface => {
      return {
        ...updateBreadcrumbs('overview', ctx, {
          startDate: ev.payload.payPeriod?.startDate ?? '',
          endDate: ev.payload.payPeriod?.endDate ?? '',
        }),
        component: PayrollOverviewContextual,
        payPeriod: ev.payload.payPeriod ?? ctx.payPeriod,
        alerts: ev.payload.alert ? [...(ctx.alerts ?? []), ev.payload.alert] : ctx.alerts,
        ctaConfig: {
          labelKey: 'exitFlowCta',
          namespace: 'Payroll.PayrollOverview',
        },
      }
    },
  ),
)

const employeeEditTransition = transition(
  componentEvents.RUN_PAYROLL_EMPLOYEE_EDIT,
  'editEmployee',
  reduce(
    (
      ctx: PayrollFlowContextInterface,
      ev: MachineEventType<PayrollEventPayloads, typeof componentEvents.RUN_PAYROLL_EMPLOYEE_EDIT>,
    ): PayrollFlowContextInterface => {
      return {
        ...updateBreadcrumbs('editEmployee', ctx, {
          firstName: ev.payload.firstName,
          lastName: ev.payload.lastName,
          startDate: ctx.payPeriod?.startDate ?? '',
          endDate: ctx.payPeriod?.endDate ?? '',
        }),
        progressBarType: 'breadcrumbs',
        component: PayrollEditEmployeeContextual,
        employeeId: ev.payload.employeeId,
        firstName: ev.payload.firstName,
        lastName: ev.payload.lastName,
        ctaConfig: null,
      }
    },
  ),
)

const blockersViewAllTransition = transition(
  componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL,
  'blockers',
  reduce((ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => {
    return {
      ...updateBreadcrumbs('blockers', ctx),
      component: PayrollBlockerContextual,
    }
  }),
)

const editPayrollTransition = transition(
  componentEvents.RUN_PAYROLL_EDIT,
  'configuration',
  reduce((ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => {
    return {
      ...updateBreadcrumbs('configuration', ctx, {
        startDate: ctx.payPeriod?.startDate ?? '',
        endDate: ctx.payPeriod?.endDate ?? '',
      }),
      component: PayrollConfigurationContextual,
      alerts: undefined,
      ctaConfig: {
        labelKey: 'exitFlowCta',
        namespace: 'Payroll.PayrollConfiguration',
      },
    }
  }),
)

const receiptGetTransition = transition(
  componentEvents.RUN_PAYROLL_RECEIPT_GET,
  'receipts',
  reduce(
    (ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
      ...updateBreadcrumbs('receipts', ctx, {
        startDate: ctx.payPeriod?.startDate ?? '',
        endDate: ctx.payPeriod?.endDate ?? '',
      }),
      component: PayrollReceiptsContextual,
      progressBarType: 'breadcrumbs',
      alerts: undefined,
      ctaConfig: {
        labelKey: 'exitFlowCta',
        namespace: 'Payroll.PayrollReceipts',
      },
    }),
  ),
)

const employeeSavedTransition = transition(
  componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED,
  'configuration',
  reduce(
    (ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
      ...ctx,
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
)

const employeeCancelledTransition = transition(
  componentEvents.RUN_PAYROLL_EMPLOYEE_CANCELLED,
  'configuration',
  reduce(
    (ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
      ...ctx,
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
)

export const payrollExecutionMachine = {
  configuration: state<MachineTransition>(
    breadcrumbNavigateTransition('configuration'),
    calculatedTransition,
    employeeEditTransition,
    blockersViewAllTransition,
  ),
  overview: state<MachineTransition>(
    breadcrumbNavigateTransition('configuration'),
    editPayrollTransition,
    receiptGetTransition,
  ),
  editEmployee: state<MachineTransition>(
    breadcrumbNavigateTransition('configuration'),
    employeeSavedTransition,
    employeeCancelledTransition,
  ),
  receipts: state<MachineTransition>(breadcrumbNavigateTransition('configuration')),
  blockers: state<MachineTransition>(breadcrumbNavigateTransition('configuration')),
}
