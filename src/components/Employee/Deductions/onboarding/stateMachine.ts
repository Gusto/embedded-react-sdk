import { state, transition, reduce, state as final } from 'robot3'
import type { DeductionsContextInterface, EventPayloads } from './deductionsContextualComponents'
import {
  DeductionsListContextual,
  DeductionsFormContextual,
} from './deductionsContextualComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

/** @internal */
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
    transition(componentEvents.EMPLOYEE_DEDUCTION_DONE, 'done'),
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
  done: final(),
}
