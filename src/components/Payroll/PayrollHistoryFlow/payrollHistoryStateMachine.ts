import { transition, reduce, state, guard } from 'robot3'
import {
  PayrollHistoryContextual,
  PayrollHistoryOverviewContextual,
  PayrollHistoryReceiptsContextual,
  type PayrollHistoryFlowContextInterface,
} from './PayrollHistoryFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.RUN_PAYROLL_SUMMARY_VIEWED]: {
    payrollId: string
  }
  [componentEvents.RUN_PAYROLL_RECEIPT_VIEWED]: {
    payrollId: string
  }
}

const createReducer = (props: Partial<PayrollHistoryFlowContextInterface>) => {
  return (ctx: PayrollHistoryFlowContextInterface): PayrollHistoryFlowContextInterface => ({
    ...ctx,
    ...props,
  })
}

export const payrollHistoryMachine = {
  history: state<MachineTransition>(
    transition(
      componentEvents.RUN_PAYROLL_SUMMARY_VIEWED,
      'overview',
      reduce(
        (
          ctx: PayrollHistoryFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.RUN_PAYROLL_SUMMARY_VIEWED>,
        ): PayrollHistoryFlowContextInterface => {
          return {
            ...ctx,
            component: PayrollHistoryOverviewContextual,
            payrollId: ev.payload.payrollId,
            previousState: 'history',
          }
        },
      ),
    ),
    transition(
      componentEvents.RUN_PAYROLL_RECEIPT_VIEWED,
      'receipt',
      reduce(
        (
          ctx: PayrollHistoryFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.RUN_PAYROLL_RECEIPT_VIEWED>,
        ): PayrollHistoryFlowContextInterface => {
          return {
            ...ctx,
            component: PayrollHistoryReceiptsContextual,
            payrollId: ev.payload.payrollId,
            previousState: 'history',
          }
        },
      ),
    ),
  ),
  overview: state<MachineTransition>(
    transition(
      componentEvents.RUN_PAYROLL_BACK,
      'history',
      reduce(
        createReducer({
          component: PayrollHistoryContextual,
          payrollId: undefined,
          previousState: undefined,
        }),
      ),
    ),
    transition(
      componentEvents.RUN_PAYROLL_RECEIPT_GET,
      'receipt',
      reduce((ctx: PayrollHistoryFlowContextInterface): PayrollHistoryFlowContextInterface => {
        // eslint-disable-next-line no-console
        console.log('[PayrollHistoryFlow] Transitioning from overview to receipt', {
          currentContext: ctx,
          newPreviousState: 'overview',
        })
        return {
          ...ctx,
          component: PayrollHistoryReceiptsContextual,
          previousState: 'overview',
        }
      }),
    ),
  ),
  receipt: state<MachineTransition>(
    transition(
      componentEvents.RUN_PAYROLL_BACK,
      'overview',
      reduce((ctx: PayrollHistoryFlowContextInterface): PayrollHistoryFlowContextInterface => {
        // eslint-disable-next-line no-console
        console.log('[PayrollHistoryFlow] Transitioning from receipt to overview', {
          currentContext: ctx,
          guardPassed: true,
        })
        return {
          ...ctx,
          component: PayrollHistoryOverviewContextual,
          previousState: 'history',
        }
      }),
      guard((ctx: PayrollHistoryFlowContextInterface) => {
        const passed = ctx.previousState === 'overview'
        // eslint-disable-next-line no-console
        console.log('[PayrollHistoryFlow] Receipt->Overview guard check', {
          previousState: ctx.previousState,
          guardPassed: passed,
        })
        return passed
      }),
    ),
    transition(
      componentEvents.RUN_PAYROLL_BACK,
      'history',
      reduce((ctx: PayrollHistoryFlowContextInterface): PayrollHistoryFlowContextInterface => {
        // eslint-disable-next-line no-console
        console.log('[PayrollHistoryFlow] Transitioning from receipt to history', {
          currentContext: ctx,
          guardPassed: true,
        })
        return {
          ...ctx,
          component: PayrollHistoryContextual,
          payrollId: undefined,
          previousState: undefined,
        }
      }),
      guard((ctx: PayrollHistoryFlowContextInterface) => {
        const passed = ctx.previousState === 'history'
        // eslint-disable-next-line no-console
        console.log('[PayrollHistoryFlow] Receipt->History guard check', {
          previousState: ctx.previousState,
          guardPassed: passed,
        })
        return passed
      }),
    ),
  ),
}
