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
 * Composes {@link TransitionPayroll} (which owns the resolve/create decision and the
 * creation + configuration screens) with the shared payroll-execution states. The entry step
 * renders {@link TransitionPayroll}; the events its configuration screen emits
 * (`runPayroll/calculated`, `runPayroll/employee/edit`, `runPayroll/blockers/viewAll`, etc.) bubble
 * up and route into the reused overview / edit-employee / receipts / blockers states.
 *
 * Unlike {@link TransitionPayroll} used on its own, this flow owns the breadcrumb chrome and the
 * back-navigation between execution screens. It re-runs the same (cached) resolve lookup as
 * {@link TransitionPayroll} to seed its initial breadcrumb and payroll context.
 *
 * There is no terminal state (SDK-1169). Completion events (`runPayroll/submitted`,
 * `runPayroll/processed`, `payroll/saveAndExit`) bubble via `onEvent`; the parent decides what to do
 * next (in `Payroll.PayrollFlow` the parent machine handles them).
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

  // Freeze the machine in state (not a memo). Creating a transition payroll invalidates the SDK
  // query namespace, refetching this resolve query; a memo could recompute and re-seat the machine
  // mid-flow. The lazy initializer runs exactly once, capturing the initial resolve outcome.
  // TransitionPayroll freezes the same decision independently.
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
