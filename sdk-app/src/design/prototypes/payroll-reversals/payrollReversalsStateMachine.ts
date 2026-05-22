import { transition, reduce, state } from 'robot3'
import { payrollReversalEvents } from './events'
import {
  SelectPayrollContextual,
  SelectEmployeesContextual,
  ReviewContextual,
  DoneContextual,
  type PayrollReversalsFlowContextInterface,
} from './PayrollReversalsFlowComponents'
import type { MachineTransition } from '@/types/Helpers'

const createReducer = (props: Partial<PayrollReversalsFlowContextInterface>) => {
  return (ctx: PayrollReversalsFlowContextInterface): PayrollReversalsFlowContextInterface => ({
    ...ctx,
    ...props,
  })
}

export const payrollReversalsMachine = {
  warning: state<MachineTransition>(
    transition(
      payrollReversalEvents.REVERSAL_CONTINUE_TO_PAYROLL_SELECT,
      'selectPayroll',
      reduce(
        createReducer({
          component: SelectPayrollContextual,
          header: null,
        }),
      ),
    ),
    transition(
      payrollReversalEvents.REVERSAL_CANCEL,
      'done',
      reduce(
        createReducer({
          component: DoneContextual,
          header: null,
        }),
      ),
    ),
  ),
  selectPayroll: state<MachineTransition>(
    transition(
      payrollReversalEvents.REVERSAL_PAYROLL_SELECTED,
      'selectEmployees',
      reduce(
        (
          ctx: PayrollReversalsFlowContextInterface,
          event: { payload: PayrollReversalsFlowContextInterface['selectedPayroll'] },
        ) =>
          createReducer({
            component: SelectEmployeesContextual,
            selectedPayroll: event.payload,
            selectedEmployeeUuids: [],
            header: null,
          })(ctx),
      ),
    ),
    transition(
      payrollReversalEvents.REVERSAL_CANCEL,
      'done',
      reduce(
        createReducer({
          component: DoneContextual,
          header: null,
        }),
      ),
    ),
  ),
  selectEmployees: state<MachineTransition>(
    transition(
      payrollReversalEvents.REVERSAL_CONTINUE_TO_REVIEW,
      'review',
      reduce(
        (
          ctx: PayrollReversalsFlowContextInterface,
          event: { payload: string[] },
        ) =>
          createReducer({
            component: ReviewContextual,
            selectedEmployeeUuids: event.payload,
            header: null,
          })(ctx),
      ),
    ),
    transition(
      payrollReversalEvents.REVERSAL_BACK_TO_PAYROLL,
      'selectPayroll',
      reduce(
        createReducer({
          component: SelectPayrollContextual,
          header: null,
        }),
      ),
    ),
    transition(
      payrollReversalEvents.REVERSAL_CANCEL,
      'done',
      reduce(
        createReducer({
          component: DoneContextual,
          header: null,
        }),
      ),
    ),
  ),
  review: state<MachineTransition>(
    transition(
      payrollReversalEvents.REVERSAL_SUBMIT,
      'done',
      reduce(
        createReducer({
          component: DoneContextual,
          header: null,
        }),
      ),
    ),
    transition(
      payrollReversalEvents.REVERSAL_BACK_TO_EMPLOYEES,
      'selectEmployees',
      reduce(
        createReducer({
          component: SelectEmployeesContextual,
          header: null,
        }),
      ),
    ),
    transition(
      payrollReversalEvents.REVERSAL_CANCEL,
      'done',
      reduce(
        createReducer({
          component: DoneContextual,
          header: null,
        }),
      ),
    ),
  ),
  done: state<MachineTransition>(
    transition(
      payrollReversalEvents.REVERSAL_CONTINUE_TO_PAYROLL_SELECT,
      'selectPayroll',
      reduce(
        createReducer({
          component: SelectPayrollContextual,
          selectedPayroll: null,
          selectedEmployeeUuids: [],
          header: null,
        }),
      ),
    ),
  ),
}
