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
 * `creation` shows {@link TransitionCreation}; `configuration` shows {@link PayrollConfiguration}.
 * The component freezes the initial state from the resolve lookup. `configuration` has no outgoing
 * transitions (a plain zero-transition state, not a robot3 final state per SDK-1169) so its events
 * bubble via `onEvent` and the screen keeps working if the host stays mounted past completion.
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
