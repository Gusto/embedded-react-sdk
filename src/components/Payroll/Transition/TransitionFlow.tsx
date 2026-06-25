import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { transitionMachine, transitionBreadcrumbsNodes } from './transitionStateMachine'
import {
  TransitionCreationContextual,
  TransitionExecutionContextual,
  type TransitionFlowContextInterface,
  type TransitionFlowProps,
} from './TransitionFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

/**
 * Multi-step flow for running a transition payroll that covers the gap between an old and new pay schedule.
 *
 * @remarks
 * Starts on the creation step (configure check date, deductions, and tax withholding for the
 * transition pay period). After the payroll is created, the flow hands off to the standard
 * payroll execution experience — configure compensation, review, submit, and view receipts.
 *
 * If a `payrollUuid` is supplied, the flow skips creation and resumes directly in execution.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `breadcrumb/navigate` | Fired when the user navigates back to the creation step via breadcrumbs | `{ key: string }` |
 * | `transition/created` | Fired when the transition payroll is created and the flow advances to execution | `{ payrollUuid: string }` |
 *
 * Once execution begins, all standard run-payroll events are emitted as well.
 *
 * @components
 * - {@link TransitionCreation}
 * - {@link PayrollExecutionFlow}
 *
 * @param props - See {@link TransitionFlowProps}.
 * @returns The transition payroll flow.
 * @public
 *
 * @example
 * ```tsx title="App.tsx"
 * import { Payroll, type EventType } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <Payroll.TransitionFlow
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       startDate="2025-01-16"
 *       endDate="2025-01-31"
 *       payScheduleUuid="c75c1ef6-2ec0-4cca-94a5-8b4cf7e5ea21"
 *       onEvent={(eventType: EventType) => {
 *         if (eventType === 'runPayroll/submitted') {
 *           // Payroll submitted — navigate to your next screen
 *         }
 *       }}
 *     />
 *   )
 * }
 * ```
 */
export function TransitionFlow({
  companyId,
  startDate,
  endDate,
  payScheduleUuid,
  payrollUuid,
  onEvent,
}: TransitionFlowProps) {
  const hasExistingPayroll = Boolean(payrollUuid)
  const initialState = hasExistingPayroll ? 'execution' : 'createTransitionPayroll'
  const initialComponent = hasExistingPayroll
    ? TransitionExecutionContextual
    : TransitionCreationContextual

  const transitionFlowMachine = useMemo(
    () =>
      createMachine(
        initialState,
        transitionMachine,
        (initialContext: TransitionFlowContextInterface) => ({
          ...initialContext,
          component: initialComponent,
          companyId,
          startDate,
          endDate,
          payScheduleUuid,
          payrollUuid,
          header: {
            type: 'breadcrumbs' as const,
            breadcrumbs: buildBreadcrumbs(transitionBreadcrumbsNodes),
            currentBreadcrumbId: hasExistingPayroll ? undefined : 'createTransitionPayroll',
          },
        }),
      ),
    [companyId, startDate, endDate, payScheduleUuid, payrollUuid],
  )

  return <Flow machine={transitionFlowMachine} onEvent={onEvent} />
}
