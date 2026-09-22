import { state, transition, reduce } from 'robot3'
import {
  PayrollConfigurationContextual,
  type TransitionPayrollContextInterface,
} from './TransitionPayrollComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

/**
 * State machine for {@link TransitionPayroll}.
 *
 * @remarks
 * Two states model the two screens the component owns:
 *
 * - `creation` — collect the transition payroll details ({@link TransitionCreation}).
 * - `configuration` — review and calculate the resolved payroll ({@link PayrollConfiguration}).
 *
 * The initial state is frozen by the component from the resolve lookup: `configuration` when an
 * unprocessed transition payroll already exists, otherwise `creation`.
 *
 * `configuration` intentionally has no outgoing transitions. Per SDK-1169 it is a plain
 * zero-transition state, not a robot3 final state, so a host that keeps the component mounted past
 * completion keeps a working screen. The configuration screen's own events (calculate, employee
 * edit, blockers, etc.) bubble upward via `onEvent` for the host (or {@link TransitionFlow}) to
 * route.
 *
 * @internal
 */
export const transitionPayrollMachine = {
  creation: state<MachineTransition>(
    transition(
      componentEvents.TRANSITION_CREATED,
      'configuration',
      reduce(
        (
          ctx: TransitionPayrollContextInterface,
          ev: { payload?: { payrollUuid?: string } },
        ): TransitionPayrollContextInterface => ({
          ...ctx,
          payrollUuid: ev.payload?.payrollUuid,
          component: PayrollConfigurationContextual,
        }),
      ),
    ),
  ),

  configuration: state<MachineTransition>(),
}
