import { createMachine, state, transition, reduce } from 'robot3'
import { useMemo } from 'react'
import { PayrollExecutionFlow } from '../PayrollExecutionFlow'
import { payrollFlowBreadcrumbsNodes } from './payrollStateMachine'
import type { PayrollFlowProps } from './PayrollFlowComponents'
import {
  SaveAndExitCta,
  PayrollLandingContextual,
  type PayrollFlowContextInterface,
} from './PayrollFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { useFlow } from '@/components/Flow/useFlow'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

function PayrollExecutionFlowContextual() {
  const { companyId, payrollUuid, onEvent, withReimbursements, ConfirmWireDetailsComponent } =
    useFlow<PayrollFlowContextInterface>()
  return (
    <PayrollExecutionFlow
      companyId={ensureRequired(companyId)}
      payrollId={ensureRequired(payrollUuid)}
      onEvent={onEvent}
      withReimbursements={withReimbursements}
      ConfirmWireDetailsComponent={ConfirmWireDetailsComponent}
    />
  )
}

type PayrollFlowEventPayloads = {
  [componentEvents.RUN_PAYROLL_SELECTED]: {
    payrollUuid: string
  }
  [componentEvents.REVIEW_PAYROLL]: {
    payrollUuid: string
  }
}

const toExecutionReducer = (
  ctx: PayrollFlowContextInterface,
  ev: MachineEventType<
    PayrollFlowEventPayloads,
    typeof componentEvents.RUN_PAYROLL_SELECTED | typeof componentEvents.REVIEW_PAYROLL
  >,
): PayrollFlowContextInterface => ({
  ...ctx,
  component: PayrollExecutionFlowContextual,
  payrollUuid: ev.payload.payrollUuid,
  showPayrollCancelledAlert: false,
})

const toLandingReducer = (ctx: PayrollFlowContextInterface): PayrollFlowContextInterface => ({
  ...ctx,
  component: PayrollLandingContextual,
  payrollUuid: undefined,
  progressBarType: null,
})

const landingMachine = {
  landing: state<MachineTransition>(
    transition(componentEvents.RUN_PAYROLL_SELECTED, 'execution', reduce(toExecutionReducer)),
    transition(componentEvents.REVIEW_PAYROLL, 'execution', reduce(toExecutionReducer)),
    transition(componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL, 'landing'),
  ),
  execution: state<MachineTransition>(
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
  ),
}

export const PayrollFlow = ({
  companyId,
  onEvent,
  withReimbursements = true,
  ConfirmWireDetailsComponent,
}: PayrollFlowProps) => {
  const landingFlow = useMemo(
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

  return <Flow machine={landingFlow} onEvent={onEvent} />
}
