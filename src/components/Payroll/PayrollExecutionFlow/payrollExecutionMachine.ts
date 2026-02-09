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
  [componentEvents.RUN_PAYROLL_SELECTED]: {
    payrollUuid: string
    payPeriod: PayrollPayPeriodType
  }
  [componentEvents.REVIEW_PAYROLL]: {
    payrollUuid: string
    payPeriod: PayrollPayPeriodType
  }
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
  [componentEvents.RUN_PAYROLL_DATA_LOADED]: {
    payPeriod: PayrollPayPeriodType
  }
  [componentEvents.BREADCRUMB_NAVIGATE]: {
    key: string
    onNavigate: (ctx: PayrollFlowContextInterface) => PayrollFlowContextInterface
  }
  [componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL]: undefined
  [componentEvents.RUN_PAYROLL_EDIT]: undefined
}

const createPayrollReducer = (props: Partial<PayrollFlowContextInterface>) => {
  return (ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
    ...ctx,
    ...props,
  })
}

const breadcrumbNavigateTransition =
  createBreadcrumbNavigateTransition<PayrollFlowContextInterface>()

type BreadcrumbNodeKeys =
  | 'configuration'
  | 'overview'
  | 'editEmployee'
  | 'receipts'
  | 'submittedOverview'
  | 'submittedReceipts'
  | 'blockers'

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
  submittedOverview: {
    parent: 'configuration',
    item: {
      id: 'submittedOverview',
      label: 'breadcrumbs.overview',
      namespace: 'Payroll.PayrollLanding',
    },
  },
  submittedReceipts: {
    parent: 'submittedOverview',
    item: {
      id: 'submittedReceipts',
      label: 'breadcrumbs.receipt',
      namespace: 'Payroll.PayrollLanding',
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

const dataLoadedTransition = transition(
  componentEvents.RUN_PAYROLL_DATA_LOADED,
  'configuration',
  reduce(
    (
      ctx: PayrollFlowContextInterface,
      ev: MachineEventType<PayrollEventPayloads, typeof componentEvents.RUN_PAYROLL_DATA_LOADED>,
    ): PayrollFlowContextInterface => {
      return {
        ...updateBreadcrumbs('configuration', ctx, {
          startDate: ev.payload.payPeriod.startDate ?? '',
          endDate: ev.payload.payPeriod.endDate ?? '',
        }),
        payPeriod: ev.payload.payPeriod,
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

const processedTransition = transition(
  componentEvents.RUN_PAYROLL_PROCESSED,
  'submittedOverview',
  reduce((ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => {
    return {
      ...updateBreadcrumbs('submittedOverview', ctx, {
        startDate: ctx.payPeriod?.startDate ?? '',
        endDate: ctx.payPeriod?.endDate ?? '',
      }),
      component: PayrollOverviewContextual,
      ctaConfig: {
        labelKey: 'exitFlowCta',
        namespace: 'Payroll.PayrollOverview',
      },
    }
  }),
)

const receiptGetTransition = transition(
  componentEvents.RUN_PAYROLL_RECEIPT_GET,
  'receipts',
  reduce(
    createPayrollReducer({
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

const submittedReceiptGetTransition = transition(
  componentEvents.RUN_PAYROLL_RECEIPT_GET,
  'submittedReceipts',
  reduce((ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => {
    return {
      ...updateBreadcrumbs('submittedReceipts', ctx, {
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
    }
  }),
)

const employeeSavedTransition = transition(
  componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED,
  'configuration',
  reduce(
    createPayrollReducer({
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
    createPayrollReducer({
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

const cancelledTransition = transition(
  componentEvents.RUN_PAYROLL_CANCELLED,
  'configuration',
  reduce(
    createPayrollReducer({
      progressBarType: null,
      alerts: undefined,
    }),
  ),
)

const exitFlowTransition = transition(
  componentEvents.PAYROLL_EXIT_FLOW,
  'configuration',
  reduce(
    createPayrollReducer({
      component: PayrollConfigurationContextual,
      progressBarType: 'breadcrumbs',
      currentBreadcrumbId: 'configuration',
      alerts: undefined,
    }),
  ),
)

export const payrollExecutionMachine = {
  configuration: state<MachineTransition>(
    breadcrumbNavigateTransition('configuration'),
    dataLoadedTransition,
    calculatedTransition,
    employeeEditTransition,
    blockersViewAllTransition,
    exitFlowTransition,
  ),
  overview: state<MachineTransition>(
    breadcrumbNavigateTransition('configuration'),
    editPayrollTransition,
    processedTransition,
    receiptGetTransition,
    cancelledTransition,
    exitFlowTransition,
  ),
  submittedOverview: state<MachineTransition>(
    breadcrumbNavigateTransition('configuration'),
    submittedReceiptGetTransition,
    cancelledTransition,
    exitFlowTransition,
  ),
  submittedReceipts: state<MachineTransition>(
    breadcrumbNavigateTransition('configuration'),
    exitFlowTransition,
  ),
  editEmployee: state<MachineTransition>(
    breadcrumbNavigateTransition('configuration'),
    employeeSavedTransition,
    employeeCancelledTransition,
  ),
  receipts: state<MachineTransition>(
    breadcrumbNavigateTransition('configuration'),
    exitFlowTransition,
  ),
  blockers: state<MachineTransition>(
    breadcrumbNavigateTransition('configuration'),
    exitFlowTransition,
  ),
}
