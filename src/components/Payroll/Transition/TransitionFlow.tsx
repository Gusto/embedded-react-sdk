import { useState } from 'react'
import { createMachine } from 'robot3'
import { useResolveTransitionPayroll } from '../TransitionPayroll/useResolveTransitionPayroll'
import { transitionMachine, transitionBreadcrumbsNodes } from './transitionStateMachine'
import {
  TransitionPayrollContextual,
  type TransitionFlowContextInterface,
  type TransitionFlowProps,
} from './TransitionFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { buildBreadcrumbs, updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'

/**
 * Macro flow that runs a transition payroll end to end: resolve or create the payroll, then
 * configure, review, submit, and view receipts.
 *
 * @remarks
 * Renders {@link TransitionPayroll} as its entry step, then routes the events its configuration
 * screen emits into the shared payroll-execution states (overview, edit-employee, receipts,
 * blockers). It owns the breadcrumb chrome and back-navigation, and re-runs the same cached resolve
 * lookup to seed its initial breadcrumb and payroll context.
 *
 * There is no terminal state (SDK-1169). Completion events bubble via `onEvent` for the parent to
 * handle (in `Payroll.PayrollFlow` the parent machine does).
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `transition/created` | Fired when the transition payroll is created and the flow advances to configuration | `{ payrollUuid: string }` |
 * | `breadcrumb/navigate` | Fired when the user navigates via the breadcrumb header | `{ key: string }` |
 *
 * All standard run-payroll events are emitted once configuration begins.
 *
 * @components
 * - {@link TransitionPayroll}
 * - {@link PayrollOverview}
 * - {@link PayrollEditEmployee}
 * - {@link PayrollReceipts}
 * - {@link PayrollBlockerList}
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
export function TransitionFlow(props: TransitionFlowProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({
  companyId,
  startDate,
  endDate,
  payScheduleUuid,
  withReimbursements = true,
}: TransitionFlowProps) {
  const { onEvent } = useBase()

  const resolvedPayrollUuid = useResolveTransitionPayroll({
    companyId,
    startDate,
    endDate,
    payScheduleUuid,
  })

  // Freeze the machine once. Creating a payroll refetches the resolve query, so recomputing this
  // would re-seat the machine mid-flow. TransitionPayroll freezes the same decision independently.
  const [machine] = useState(() => {
    const initialBreadcrumbId = resolvedPayrollUuid ? 'configuration' : 'createTransitionPayroll'
    const breadcrumbs = buildBreadcrumbs(transitionBreadcrumbsNodes)
    const initialBreadcrumbContext = updateBreadcrumbs(
      initialBreadcrumbId,
      { header: { type: 'breadcrumbs' as const, breadcrumbs } },
      { startDate, endDate },
    )

    return createMachine(
      'transitionPayroll',
      transitionMachine,
      (initialContext: TransitionFlowContextInterface) => ({
        ...initialContext,
        ...initialBreadcrumbContext,
        component: TransitionPayrollContextual,
        companyId,
        startDate,
        endDate,
        payScheduleUuid,
        payrollUuid: resolvedPayrollUuid,
        withReimbursements,
        withOffcyclePayroll: true,
      }),
    )
  })

  return <Flow machine={machine} onEvent={onEvent} />
}
