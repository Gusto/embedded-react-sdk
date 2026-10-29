import { state, transition, reduce, guard } from 'robot3'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import type { PayrollExecutionInitialState } from '../PayrollExecutionFlow'
import {
  PayrollLandingContextual,
  PayrollBlockerContextual,
  PayrollOverviewContextual,
  PayrollReceiptsContextual,
  TransitionConfigurationContextual,
  type PayrollFlowContextInterface,
} from './PayrollFlowComponents'
import { PayrollExecutionFlowContextual } from './PayrollExecutionFlowContextual'
import { OffCycleFlowContextual } from './OffCycleFlowContextual'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import { patchBreadcrumbsHeader, updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'
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
    payrollUuid?: string
  }
  [componentEvents.TRANSITION_CONFIGURED]: {
    payrollUuid: string
  }
}

/** @internal */
export const payrollFlowBreadcrumbsNodes: BreadcrumbNodes = {
  landing: {
    parent: null,
    item: {
      id: 'landing',
      label: 'breadcrumbs.landing',
      namespace: 'Payroll.PayrollLanding',
      onNavigate: ((ctx: PayrollFlowContextInterface) => ({
        ...patchBreadcrumbsHeader(ctx, { currentBreadcrumbId: undefined }),
        component: PayrollLandingContextual,
        alerts: undefined,
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
  transitionConfiguration: {
    parent: 'landing',
    item: {
      id: 'transitionConfiguration',
      label: 'breadcrumbs.transitionConfiguration',
      namespace: 'Payroll.PayrollLanding',
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
    ...patchBreadcrumbsHeader(ctx, { currentBreadcrumbId: undefined }),
    component: PayrollLandingContextual,
    alerts: undefined,
    payrollUuid: undefined,
    payPeriod: undefined,
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
    alerts: undefined,
    payrollUuid: ev.payload.payrollUuid,
    showPayrollCancelledAlert: false,
    executionInitialState,
  }
}

function toTransitionConfigurationReducer(
  ctx: PayrollFlowContextInterface,
  ev: { payload: { payrollUuid?: string } },
): PayrollFlowContextInterface {
  return {
    ...updateBreadcrumbs('transitionConfiguration', ctx),
    component: TransitionConfigurationContextual,
    alerts: undefined,
    payrollUuid: ev.payload.payrollUuid,
    showPayrollCancelledAlert: false,
    ctaConfig: undefined,
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

const notCalculatedToLandingTransition = transition(
  componentEvents.RUN_PAYROLL_NOT_CALCULATED_BACK_TO_LIST,
  'landing',
  reduce(toLandingReducer),
)

const cancelledToLandingTransition = transition(
  componentEvents.RUN_PAYROLL_CANCELLED,
  'landing',
  reduce((ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
    ...toLandingReducer(ctx),
    showPayrollCancelledAlert: true,
  })),
)

const processedToSubmittedOverviewTransition = transition(
  componentEvents.RUN_PAYROLL_PROCESSED,
  'submittedOverview',
  reduce(
    (
      ctx: PayrollFlowContextInterface,
      ev: MachineEventType<PayrollFlowEventPayloads, typeof componentEvents.RUN_PAYROLL_PROCESSED>,
    ): PayrollFlowContextInterface => {
      const payPeriod = ev.payload.payPeriod ?? ctx.payPeriod
      return {
        ...updateBreadcrumbs('submittedOverview', ctx, {
          startDate: payPeriod?.startDate ?? '',
          endDate: payPeriod?.endDate ?? '',
        }),
        component: PayrollOverviewContextual,
        alerts: undefined,
        payrollUuid: ev.payload.payrollUuid ?? ctx.payrollUuid,
        payPeriod,
        executionInitialState: undefined,
        ctaConfig: {
          labelKey: 'exitFlowCta',
          namespace: 'Payroll.PayrollOverview',
        },
      }
    },
  ),
)

/** @internal */
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
      reduce((ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
        ...updateBreadcrumbs('blockers', ctx),
        component: PayrollBlockerContextual,
        alerts: undefined,
        showPayrollCancelledAlert: false,
        ctaConfig: {
          labelKey: 'exitFlowCta',
          namespace: 'Payroll.PayrollBlocker',
        },
      })),
    ),
    transition(
      componentEvents.RUN_PAYROLL_CANCELLED_ALERT_DISMISSED,
      'landing',
      reduce((ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
        ...ctx,
        showPayrollCancelledAlert: false,
      })),
    ),
    transition(
      componentEvents.RUN_TRANSITION_PAYROLL,
      'transitionConfiguration',
      reduce(toTransitionConfigurationReducer),
    ),
    transition(
      componentEvents.TRANSITION_PAYROLL_SELECTED,
      'transitionConfiguration',
      reduce(toTransitionConfigurationReducer),
    ),
    transition(
      componentEvents.RUN_OFF_CYCLE_PAYROLL,
      'offCycle',
      reduce((ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
        ...patchBreadcrumbsHeader(ctx, { currentBreadcrumbId: undefined }),
        component: OffCycleFlowContextual,
        alerts: undefined,
        showPayrollCancelledAlert: false,
      })),
    ),
  ),
  execution: state<MachineTransition>(
    landingBreadcrumbNavigateTransition,
    exitFlowTransition,
    cancelledToLandingTransition,
    notCalculatedToLandingTransition,
    processedToSubmittedOverviewTransition,
  ),
  blockers: state<MachineTransition>(breadcrumbNavigateTransition('landing'), exitFlowTransition),
  submittedOverview: state<MachineTransition>(
    breadcrumbNavigateTransition('landing'),
    transition(
      componentEvents.RUN_PAYROLL_RECEIPT_GET,
      'submittedReceipts',
      reduce((ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
        ...updateBreadcrumbs('submittedReceipts', ctx, {
          startDate: ctx.payPeriod?.startDate ?? '',
          endDate: ctx.payPeriod?.endDate ?? '',
        }),
        component: PayrollReceiptsContextual,
        alerts: undefined,
        ctaConfig: {
          labelKey: 'exitFlowCta',
          namespace: 'Payroll.PayrollReceipts',
        },
      })),
    ),
    cancelledToLandingTransition,
    notCalculatedToLandingTransition,
    exitFlowTransition,
  ),
  submittedReceipts: state<MachineTransition>(
    breadcrumbNavigateTransition('landing'),
    exitFlowTransition,
  ),
  transitionConfiguration: state<MachineTransition>(
    breadcrumbNavigateTransition('landing'),
    transition(
      componentEvents.TRANSITION_CONFIGURED,
      'execution',
      reduce(
        (
          ctx: PayrollFlowContextInterface,
          ev: MachineEventType<
            PayrollFlowEventPayloads,
            typeof componentEvents.TRANSITION_CONFIGURED
          >,
        ) =>
          toExecutionReducer(
            patchBreadcrumbsHeader(ctx, { currentBreadcrumbId: undefined }),
            ev,
            'configuration',
          ),
      ),
    ),
  ),
  offCycle: state<MachineTransition>(
    landingBreadcrumbNavigateTransition,
    exitFlowTransition,
    cancelledToLandingTransition,
    notCalculatedToLandingTransition,
    processedToSubmittedOverviewTransition,
  ),
}
