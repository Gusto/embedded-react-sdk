import { state, transition, reduce, state as final } from 'robot3'
import type { DeductionsContextInterface, EventPayloads } from './DeductionsComponents'
import {
  DeductionsListContextual,
  DeductionFormContextual,
  IncludeDeductionsFormContextual,
} from './DeductionsComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType } from '@/types/Helpers'

// Helper function to create consistent reducers
const createReducer =
  (props: Partial<DeductionsContextInterface>) => (ctx: DeductionsContextInterface) => ({
    ...ctx,
    ...props,
  })

export const deductionsStateMachine = {
  includeDeductions: state(
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_YES,
      'addDeduction',
      reduce(
        createReducer({
          component: DeductionFormContextual,
          currentDeduction: null,
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
    // Allow direct bypass to add deduction
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_ADD,
      'addDeduction',
      reduce(
        createReducer({
          component: DeductionFormContextual,
          currentDeduction: null,
        }),
      ),
    ),
    // Allow bypass to view deductions if user wants to see existing ones first
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_DONE,
      'viewDeductions',
      reduce(
        createReducer({
          component: DeductionsListContextual,
        }),
      ),
    ),
  ),
  viewDeductions: state(
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_ADD,
      'addDeduction',
      reduce(
        createReducer({
          component: DeductionFormContextual,
          currentDeduction: null,
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
          currentDeduction: ev.payload,
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
    // Allow going back to include deductions when there are no existing deductions
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_CANCEL,
      'includeDeductions',
      reduce(
        createReducer({
          component: IncludeDeductionsFormContextual,
        }),
      ),
    ),
  ),
  addDeduction: state(
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_CREATED,
      'viewDeductions',
      reduce(
        createReducer({
          component: DeductionsListContextual,
          currentDeduction: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_CANCEL,
      'viewDeductions',
      reduce(
        createReducer({
          component: DeductionsListContextual,
          currentDeduction: null,
        }),
      ),
    ),
  ),
  editDeduction: state(
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_UPDATED,
      'viewDeductions',
      reduce(
        createReducer({
          component: DeductionsListContextual,
          currentDeduction: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_DEDUCTION_CANCEL,
      'viewDeductions',
      reduce(
        createReducer({
          component: DeductionsListContextual,
          currentDeduction: null,
        }),
      ),
    ),
  ),
  done: final(),
}
