import { state, transition, reduce } from 'robot3'
import {
  SuspensionFormContextual,
  SuspensionSummaryContextual,
  type SuspensionFlowContextInterface,
} from './SuspensionFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

/**
 * State machine driving the company suspension flow: the reason/tax form transitions to the
 * read-only summary once the suspension is created.
 *
 * @remarks
 * `summary` is a terminal, zero-transition state rather than a robot3 `final()` — the summary and
 * form are public standalone components, so modeling completion as a final state would turn the
 * screen into a dead no-op if the host keeps the flow mounted (SDK-1169). Completion instead bubbles
 * out through `onEvent`.
 *
 * @internal
 */
export const suspensionMachine = {
  form: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_SUSPENSION_CREATED,
      'summary',
      reduce(
        (ctx: SuspensionFlowContextInterface): SuspensionFlowContextInterface => ({
          ...ctx,
          component: SuspensionSummaryContextual,
        }),
      ),
    ),
  ),
  summary: state<MachineTransition>(),
}

/** @internal */
export const suspensionInitialComponent = {
  form: SuspensionFormContextual,
  summary: SuspensionSummaryContextual,
}
