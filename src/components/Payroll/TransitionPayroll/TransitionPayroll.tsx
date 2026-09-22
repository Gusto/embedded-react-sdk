import { useState } from 'react'
import { createMachine } from 'robot3'
import { transitionPayrollMachine } from './transitionPayrollStateMachine'
import {
  TransitionCreationContextual,
  PayrollConfigurationContextual,
  type TransitionPayrollContextInterface,
} from './TransitionPayrollComponents'
import { useResolveTransitionPayroll } from './useResolveTransitionPayroll'
import type { TransitionPayrollProps } from './TransitionPayrollTypes'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { Flow } from '@/components/Flow/Flow'

/**
 * Resolves and runs a transition payroll for a pay-schedule change, picking up an existing
 * unprocessed transition payroll when one exists and creating one otherwise.
 *
 * @remarks
 * When a company changes its pay schedule, a coverage gap can open between the last pay period on
 * the old schedule and the first on the new one. The platform creates a single unprocessed
 * off-cycle "transition" payroll for that gap. This component owns the resolve/resume decision that
 * a composing flow (`Payroll.PayrollFlow`) previously kept internal, so it can be composed directly:
 *
 * - If an unprocessed transition payroll already exists for the pay period, it starts on
 *   {@link PayrollConfiguration} for that payroll.
 * - Otherwise it starts on {@link TransitionCreation}; once created it advances to
 *   {@link PayrollConfiguration}.
 *
 * The initial screen is frozen at mount from the resolve lookup. Creating the payroll invalidates
 * the SDK query cache, so deriving the screen live would re-seat the machine mid-flow.
 *
 * The configuration screen's events (calculate, employee edit, blockers, etc.) are emitted through
 * `onEvent` for the host to route. The component does not own those destinations; compose it inside
 * {@link TransitionFlow} to get the full run-payroll experience, or handle the events directly.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `transition/created` | The transition payroll has been created and the flow advances to configuration | `{ payrollUuid: string }` |
 *
 * Once configuration begins, all standard run-payroll events are emitted as well (e.g.
 * `runPayroll/calculated`, `runPayroll/employee/edit`, `runPayroll/blockers/viewAll`).
 *
 * @components
 * - {@link TransitionCreation}
 * - {@link PayrollConfiguration}
 *
 * @param props - See {@link TransitionPayrollProps}.
 * @returns The transition payroll component.
 * @public
 *
 * @example
 * ```tsx title="App.tsx"
 * import { Payroll, type EventType } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <Payroll.TransitionPayroll
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       startDate="2025-01-16"
 *       endDate="2025-01-31"
 *       payScheduleUuid="c75c1ef6-2ec0-4cca-94a5-8b4cf7e5ea21"
 *       onEvent={(eventType: EventType) => {
 *         if (eventType === 'runPayroll/calculated') {
 *           // Payroll calculated — navigate to your review screen
 *         }
 *       }}
 *     />
 *   )
 * }
 * ```
 */
export function TransitionPayroll(props: TransitionPayrollProps) {
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
}: TransitionPayrollProps) {
  const { onEvent } = useBase()

  const resolvedPayrollUuid = useResolveTransitionPayroll({
    companyId,
    startDate,
    endDate,
    payScheduleUuid,
  })

  // Freeze the machine in state (not a memo). Creating a transition payroll invalidates the whole
  // SDK query namespace, which refetches the resolve query; a memo could recompute and re-seat the
  // machine, orphaning its interpreter mid-flow. The lazy initializer runs exactly once, capturing
  // the initial resolve outcome.
  const [machine] = useState(() => {
    const hasExisting = Boolean(resolvedPayrollUuid)
    return createMachine(
      hasExisting ? 'configuration' : 'creation',
      transitionPayrollMachine,
      (initialContext: TransitionPayrollContextInterface) => ({
        ...initialContext,
        component: hasExisting ? PayrollConfigurationContextual : TransitionCreationContextual,
        companyId,
        startDate,
        endDate,
        payScheduleUuid,
        payrollUuid: resolvedPayrollUuid,
        withReimbursements,
      }),
    )
  })

  return <Flow machine={machine} onEvent={onEvent} />
}
