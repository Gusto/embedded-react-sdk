import type { DeductionsContextInterface, EventPayloads } from './deductionsContextualComponents'
import {
  DeductionsListContextual,
  DeductionsFormContextual,
} from './deductionsContextualComponents'
import { state, transition, reduce } from '@/lib/state-machine'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

/**
 * `EMPLOYEE_DEDUCTION_DONE` deliberately has no transition out of `list`. `Flow` re-emits every
 * event to the upstream `onEvent` regardless of whether the local machine has a matching
 * transition, so the parent flow still advances/unmounts this component on that signal. Modeling
 * completion as a final state instead left `component` pointing at a step whose controls
 * could never fire another transition — if a host doesn't unmount immediately, the screen would
 * look interactive but be permanently dead (see SDK-1169, the same bug in
 * `Compensation`'s onboarding machine). Staying in `list` means a host that keeps this component
 * mounted past completion keeps a fully working deductions list instead.
 *
 * @internal
 */
export const deductionsMachine = {
  list: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_ADD,
      'form',
      reduce((ctx: DeductionsContextInterface): DeductionsContextInterface => ({
        ...ctx,
        component: DeductionsFormContextual,
        editingDeductionId: undefined,
      })),
    ),
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_EDIT,
      'form',
      reduce(
        (
          ctx: DeductionsContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_DEDUCTION_EDIT>,
        ): DeductionsContextInterface => ({
          ...ctx,
          component: DeductionsFormContextual,
          editingDeductionId: ev.payload.uuid,
        }),
      ),
    ),
  ),
  form: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_CREATED,
      'list',
      reduce((ctx: DeductionsContextInterface): DeductionsContextInterface => ({
        ...ctx,
        component: DeductionsListContextual,
        editingDeductionId: undefined,
      })),
    ),
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_UPDATED,
      'list',
      reduce((ctx: DeductionsContextInterface): DeductionsContextInterface => ({
        ...ctx,
        component: DeductionsListContextual,
        editingDeductionId: undefined,
      })),
    ),
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_CANCEL,
      'list',
      reduce((ctx: DeductionsContextInterface): DeductionsContextInterface => ({
        ...ctx,
        component: DeductionsListContextual,
        editingDeductionId: undefined,
      })),
    ),
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_CANCEL_EMPTY,
      'list',
      reduce((ctx: DeductionsContextInterface): DeductionsContextInterface => ({
        ...ctx,
        component: DeductionsListContextual,
        editingDeductionId: undefined,
      })),
    ),
  ),
}
