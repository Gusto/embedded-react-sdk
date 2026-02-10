import { createMachine, state, transition, reduce, guard } from 'robot3'
import { useMemo } from 'react'
import { PayrollExecutionFlow, type PayrollExecutionInitialState } from '../PayrollExecutionFlow'
import { payrollFlowBreadcrumbsNodes } from './payrollStateMachine'
import type { PayrollFlowProps } from './PayrollFlowComponents'
import {
  SaveAndExitCta,
  PayrollLandingContextual,
  PayrollBlockerContextual,
  PayrollOverviewContextual,
  PayrollReceiptsContextual,
  type PayrollFlowContextInterface,
} from './PayrollFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { useFlow } from '@/components/Flow/useFlow'
import { buildBreadcrumbs, updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import { createBreadcrumbNavigateTransition } from '@/components/Common/FlowBreadcrumbs/breadcrumbTransitionHelpers'

function PayrollExecutionFlowContextual() {
  const {
    companyId,
    payrollUuid,
    onEvent,
    withReimbursements,
    ConfirmWireDetailsComponent,
    executionInitialState,
    breadcrumbs,
  } = useFlow<PayrollFlowContextInterface>()

  const landingBreadcrumb = breadcrumbs?.['landing']?.[0]
  const prefixBreadcrumbs = landingBreadcrumb ? [landingBreadcrumb] : undefined

  return (
    <PayrollExecutionFlow
      companyId={ensureRequired(companyId)}
      payrollId={ensureRequired(payrollUuid)}
      onEvent={onEvent}
      withReimbursements={withReimbursements}
      ConfirmWireDetailsComponent={ConfirmWireDetailsComponent}
      initialState={executionInitialState}
      prefixBreadcrumbs={prefixBreadcrumbs}
    />
  )
}

type LandingEventPayloads = {
  [componentEvents.RUN_PAYROLL_SELECTED]: {
    payrollUuid: string
  }
  [componentEvents.REVIEW_PAYROLL]: {
    payrollUuid: string
  }
}

const breadcrumbNavigateTransition =
  createBreadcrumbNavigateTransition<PayrollFlowContextInterface>()

const landingBreadcrumbNavigateTransition = transition(
  componentEvents.BREADCRUMB_NAVIGATE,
  'landing',
  guard(
    (_ctx: PayrollFlowContextInterface, ev: { payload: { key: string } }) =>
      ev.payload.key === 'landing',
  ),
  reduce(toLandingReducer),
)

function toLandingReducer(ctx: PayrollFlowContextInterface): PayrollFlowContextInterface {
  return {
    ...ctx,
    component: PayrollLandingContextual,
    payrollUuid: undefined,
    progressBarType: null,
    currentBreadcrumbId: 'landing',
    executionInitialState: undefined,
  }
}

const toExecutionReducer = (
  ctx: PayrollFlowContextInterface,
  ev: { payload: { payrollUuid: string } },
  executionInitialState: PayrollExecutionInitialState,
): PayrollFlowContextInterface => ({
  ...ctx,
  component: PayrollExecutionFlowContextual,
  payrollUuid: ev.payload.payrollUuid,
  showPayrollCancelledAlert: false,
  executionInitialState,
})

const landingMachine = {
  landing: state<MachineTransition>(
    transition(
      componentEvents.RUN_PAYROLL_SELECTED,
      'execution',
      reduce(
        (
          ctx: PayrollFlowContextInterface,
          ev: MachineEventType<LandingEventPayloads, typeof componentEvents.RUN_PAYROLL_SELECTED>,
        ) => toExecutionReducer(ctx, ev, 'configuration'),
      ),
    ),
    transition(
      componentEvents.REVIEW_PAYROLL,
      'execution',
      reduce(
        (
          ctx: PayrollFlowContextInterface,
          ev: MachineEventType<LandingEventPayloads, typeof componentEvents.REVIEW_PAYROLL>,
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
  ),
  execution: state<MachineTransition>(
    landingBreadcrumbNavigateTransition,
    transition(componentEvents.PAYROLL_EXIT_FLOW, 'landing', reduce(toLandingReducer)),
    transition(
      componentEvents.RUN_PAYROLL_CANCELLED,
      'landing',
      reduce(
        (ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
          ...toLandingReducer(ctx),
          showPayrollCancelledAlert: true,
        }),
      ),
    ),
    transition(
      componentEvents.RUN_PAYROLL_PROCESSED,
      'submittedOverview',
      reduce(
        (ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
          ...updateBreadcrumbs('submittedOverview', ctx, {
            startDate: ctx.payPeriod?.startDate ?? '',
            endDate: ctx.payPeriod?.endDate ?? '',
          }),
          component: PayrollOverviewContextual,
          progressBarType: 'breadcrumbs',
          executionInitialState: undefined,
          ctaConfig: {
            labelKey: 'exitFlowCta',
            namespace: 'Payroll.PayrollOverview',
          },
        }),
      ),
    ),
  ),
  blockers: state<MachineTransition>(
    breadcrumbNavigateTransition('landing'),
    transition(componentEvents.PAYROLL_EXIT_FLOW, 'landing', reduce(toLandingReducer)),
  ),
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
    transition(
      componentEvents.RUN_PAYROLL_CANCELLED,
      'landing',
      reduce(
        (ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
          ...toLandingReducer(ctx),
          showPayrollCancelledAlert: true,
        }),
      ),
    ),
    transition(componentEvents.PAYROLL_EXIT_FLOW, 'landing', reduce(toLandingReducer)),
  ),
  submittedReceipts: state<MachineTransition>(
    breadcrumbNavigateTransition('landing'),
    transition(componentEvents.PAYROLL_EXIT_FLOW, 'landing', reduce(toLandingReducer)),
  ),
}

export const PayrollFlow = ({
  companyId,
  onEvent,
  withReimbursements = true,
  ConfirmWireDetailsComponent,
}: PayrollFlowProps) => {
  const payrollFlow = useMemo(
    () =>
      createMachine('landing', landingMachine, (initialContext: PayrollFlowContextInterface) => ({
        ...initialContext,
        component: PayrollLandingContextual,
        companyId,
        progressBarType: null,
        breadcrumbs: buildBreadcrumbs(payrollFlowBreadcrumbsNodes),
        currentBreadcrumbId: 'landing',
        progressBarCta: SaveAndExitCta,
        withReimbursements,
        ConfirmWireDetailsComponent,
      })),
    [companyId, withReimbursements, ConfirmWireDetailsComponent],
  )

  return <Flow machine={payrollFlow} onEvent={onEvent} />
}
