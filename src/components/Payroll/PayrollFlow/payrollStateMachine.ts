import { state, transition, reduce, guard } from 'robot3'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import type { PayrollExecutionInitialState } from '../PayrollExecutionFlow'
import {
  PayrollLandingContextual,
  PayrollBlockerContextual,
  PayrollOverviewContextual,
  PayrollReceiptsContextual,
  type PayrollFlowContextInterface,
} from './PayrollFlowComponents'
import { PayrollExecutionFlowContextual } from './PayrollExecutionFlowContextual'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import { updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'
import type { BreadcrumbNodes } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { createBreadcrumbNavigateTransition } from '@/components/Common/FlowBreadcrumbs/breadcrumbTransitionHelpers'

type PayrollFlowEventPayloads = {
  [componentEvents.RUN_PAYROLL_SELECTED]: {
    payrollUuid: string
  }
  [componentEvents.REVIEW_PAYROLL]: {
    payrollUuid: string
  }
  [componentEvents.RUN_PAYROLL_PROCESSED]: {
    payPeriod?: PayrollPayPeriodType
  }
}

export const payrollFlowBreadcrumbsNodes: BreadcrumbNodes = {
  landing: {
    parent: null,
    item: {
      id: 'landing',
      label: 'breadcrumbs.landing',
      namespace: 'Payroll.PayrollLanding',
      onNavigate: ((ctx: PayrollFlowContextInterface) => ({
        ...ctx,
        currentBreadcrumbId: 'landing',
        progressBarType: null,
        component: PayrollLandingContextual,
        payrollUuid: undefined,
        executionInitialState: undefined,
      })) as (context: unknown) => unknown,
    },
  },
  blockers: {
    parent: 'landing',
    item: {
      id: 'blockers',
      label: 'breadcrumbLabel',
      namespace: 'Payroll.PayrollBlocker',
    },
  },
  submittedOverview: {
    parent: 'landing',
    item: {
      id: 'submittedOverview',
      label: 'breadcrumbs.overview',
      namespace: 'Payroll.PayrollLanding',
    },
  },
  submittedReceipts: {
    parent: 'landing',
    item: {
      id: 'submittedReceipts',
      label: 'breadcrumbs.receipt',
      namespace: 'Payroll.PayrollLanding',
    },
  },
}

const breadcrumbNavigateTransition =
  createBreadcrumbNavigateTransition<PayrollFlowContextInterface>()

function toLandingReducer(ctx: PayrollFlowContextInterface): PayrollFlowContextInterface {
  return {
    ...ctx,
    component: PayrollLandingContextual,
    payrollUuid: undefined,
    payPeriod: undefined,
    progressBarType: null,
    currentBreadcrumbId: 'landing',
    executionInitialState: undefined,
  }
}

function toExecutionReducer(
  ctx: PayrollFlowContextInterface,
  ev: { payload: { payrollUuid: string } },
  executionInitialState: PayrollExecutionInitialState,
): PayrollFlowContextInterface {
  return {
    ...ctx,
    component: PayrollExecutionFlowContextual,
    payrollUuid: ev.payload.payrollUuid,
    showPayrollCancelledAlert: false,
    executionInitialState,
  }
}

const landingBreadcrumbNavigateTransition = transition(
  componentEvents.BREADCRUMB_NAVIGATE,
  'landing',
  guard(
    (_ctx: PayrollFlowContextInterface, ev: { payload: { key: string } }) =>
      ev.payload.key === 'landing',
  ),
  reduce(toLandingReducer),
)

const exitFlowTransition = transition(
  componentEvents.PAYROLL_EXIT_FLOW,
  'landing',
  reduce(toLandingReducer),
)

const cancelledToLandingTransition = transition(
  componentEvents.RUN_PAYROLL_CANCELLED,
  'landing',
  reduce(
    (ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
      ...toLandingReducer(ctx),
      showPayrollCancelledAlert: true,
    }),
  ),
)

export const payrollFlowMachine = {
  landing: state<MachineTransition>(
    transition(
      componentEvents.RUN_PAYROLL_SELECTED,
      'execution',
      reduce(
        (
          ctx: PayrollFlowContextInterface,
          ev: MachineEventType<
            PayrollFlowEventPayloads,
            typeof componentEvents.RUN_PAYROLL_SELECTED
          >,
        ) => toExecutionReducer(ctx, ev, 'configuration'),
      ),
    ),
    transition(
      componentEvents.REVIEW_PAYROLL,
      'execution',
      reduce(
        (
          ctx: PayrollFlowContextInterface,
          ev: MachineEventType<PayrollFlowEventPayloads, typeof componentEvents.REVIEW_PAYROLL>,
        ) => toExecutionReducer(ctx, ev, 'overview'),
      ),
    ),
    transition(
      componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL,
      'blockers',
      reduce(
        (ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
          ...updateBreadcrumbs('blockers', ctx),
          component: PayrollBlockerContextual,
          progressBarType: 'breadcrumbs',
          showPayrollCancelledAlert: false,
          ctaConfig: {
            labelKey: 'exitFlowCta',
            namespace: 'Payroll.PayrollBlocker',
          },
        }),
      ),
    ),
    transition(
      componentEvents.RUN_PAYROLL_CANCELLED_ALERT_DISMISSED,
      'landing',
      reduce(
        (ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
          ...ctx,
          showPayrollCancelledAlert: false,
        }),
      ),
    ),
  ),
  execution: state<MachineTransition>(
    landingBreadcrumbNavigateTransition,
    exitFlowTransition,
    cancelledToLandingTransition,
    transition(
      componentEvents.RUN_PAYROLL_PROCESSED,
      'submittedOverview',
      reduce(
        (
          ctx: PayrollFlowContextInterface,
          ev: MachineEventType<
            PayrollFlowEventPayloads,
            typeof componentEvents.RUN_PAYROLL_PROCESSED
          >,
        ): PayrollFlowContextInterface => {
          const payPeriod = ev.payload.payPeriod ?? ctx.payPeriod
          return {
            ...updateBreadcrumbs('submittedOverview', ctx, {
              startDate: payPeriod?.startDate ?? '',
              endDate: payPeriod?.endDate ?? '',
            }),
            component: PayrollOverviewContextual,
            payPeriod,
            progressBarType: 'breadcrumbs',
            executionInitialState: undefined,
            ctaConfig: {
              labelKey: 'exitFlowCta',
              namespace: 'Payroll.PayrollOverview',
            },
          }
        },
      ),
    ),
  ),
  blockers: state<MachineTransition>(breadcrumbNavigateTransition('landing'), exitFlowTransition),
  submittedOverview: state<MachineTransition>(
    breadcrumbNavigateTransition('landing'),
    transition(
      componentEvents.RUN_PAYROLL_RECEIPT_GET,
      'submittedReceipts',
      reduce(
        (ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
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
        }),
      ),
    ),
    cancelledToLandingTransition,
    exitFlowTransition,
  ),
  submittedReceipts: state<MachineTransition>(
    breadcrumbNavigateTransition('landing'),
    exitFlowTransition,
  ),
}
