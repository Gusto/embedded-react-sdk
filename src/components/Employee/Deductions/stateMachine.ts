import { state, transition, reduce, state as final } from 'robot3'
import type { DeductionsContextInterface, EventPayloads } from './DeductionsComponents'
import { DeductionsListContextual, DeductionFormContextual } from './DeductionsComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

// Helper function to create consistent reducers
const createReducer =
  (props: Partial<DeductionsContextInterface>) => (ctx: DeductionsContextInterface) => ({
    ...ctx,
    ...props,
  })

export const deductionsStateMachine = {
  includeDeductions: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_YES,
      'addDeduction',
      reduce(
        createReducer({
          component: DeductionFormContextual,
          currentDeductionId: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_NO,
      'done',
      reduce((ctx: DeductionsContextInterface) => {
        // Emit the completion event to notify parent onboarding flow
        ctx.onEvent(componentEvents.EMPLOYEE_DEDUCTION_DONE)
        return ctx
      }),
    ),
  ),
  viewDeductions: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_ADD,
      'addDeduction',
      reduce(
        createReducer({
          component: DeductionFormContextual,
          currentDeductionId: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_EDIT,
      'editDeduction',
      reduce(
        (
          ctx: DeductionsContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.EMPLOYEE_DEDUCTION_EDIT>,
        ) => ({
          ...ctx,
          component: DeductionFormContextual,
          currentDeductionId: ev.payload.uuid,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_DELETED,
      'viewDeductions',
      reduce(
        createReducer({
          component: DeductionsListContextual,
        }),
      ),
    ),
    transition(componentEvents.EMPLOYEE_DEDUCTION_DONE, 'done'),
  ),
  addDeduction: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_CREATED,
      'viewDeductions',
      reduce(
        createReducer({
          component: DeductionsListContextual,
          currentDeductionId: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_CANCEL,
      'viewDeductions',
      reduce(
        createReducer({
          component: DeductionsListContextual,
          currentDeductionId: null,
        }),
      ),
    ),
  ),
  editDeduction: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_UPDATED,
      'viewDeductions',
      reduce(
        createReducer({
          component: DeductionsListContextual,
          currentDeductionId: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_CANCEL,
      'viewDeductions',
      reduce(
        createReducer({
          component: DeductionsListContextual,
          currentDeductionId: null,
        }),
      ),
    ),
  ),
  done: final(),
}
