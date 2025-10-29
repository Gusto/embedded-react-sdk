import { transition, reduce, state, guard } from 'robot3'
import {
  PayrollLandingTabsContextual,
  PayrollLandingReceiptsContextual,
  PayrollLandingOverviewContextual,
  type PayrollLandingFlowContextInterface,
} from './PayrollLandingFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.RUN_PAYROLL_RECEIPT_VIEWED]: {
    payrollId: string
  }
  [componentEvents.RUN_PAYROLL_SUMMARY_VIEWED]: {
    payrollId: string
  }
  [componentEvents.RUN_PAYROLL_RECEIPT_GET]: {
    payrollId: string
  }
}

const createReducer = (props: Partial<PayrollLandingFlowContextInterface>) => {
  return (ctx: PayrollLandingFlowContextInterface): PayrollLandingFlowContextInterface => ({
    ...ctx,
    ...props,
  })
}

export const payrollLandingMachine = {
  tabs: state<MachineTransition>(
    transition(
      componentEvents.RUN_PAYROLL_RECEIPT_VIEWED,
      'receipt',
      reduce(
        (
          ctx: PayrollLandingFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.RUN_PAYROLL_RECEIPT_VIEWED>,
        ): PayrollLandingFlowContextInterface => ({
          ...ctx,
          component: PayrollLandingReceiptsContextual,
          payrollUuid: ev.payload.payrollId,
          previousState: 'tabs',
          selectedTab: 'payroll-history', // Receipt viewed from payroll history tab
        }),
      ),
    ),
    transition(
      componentEvents.RUN_PAYROLL_SUMMARY_VIEWED,
      'overview',
      reduce(
        (
          ctx: PayrollLandingFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.RUN_PAYROLL_SUMMARY_VIEWED>,
        ): PayrollLandingFlowContextInterface => ({
          ...ctx,
          component: PayrollLandingOverviewContextual,
          payrollUuid: ev.payload.payrollId,
          previousState: 'tabs',
          selectedTab: 'payroll-history', // Summary viewed from payroll history tab
        }),
      ),
    ),
  ),
  overview: state<MachineTransition>(
    transition(
      componentEvents.RUN_PAYROLL_BACK,
      'tabs',
      reduce(
        createReducer({
          component: PayrollLandingTabsContextual,
          payrollUuid: undefined,
          previousState: undefined,
          // Preserve selectedTab when going back to tabs
        }),
      ),
    ),
    transition(
      componentEvents.RUN_PAYROLL_RECEIPT_GET,
      'receipt',
      reduce(
        (
          ctx: PayrollLandingFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.RUN_PAYROLL_RECEIPT_GET>,
        ): PayrollLandingFlowContextInterface => {
          return {
            ...ctx,
            component: PayrollLandingReceiptsContextual,
            payrollUuid: ev.payload.payrollId,
            previousState: 'overview',
          }
        },
      ),
    ),
  ),
  receipt: state<MachineTransition>(
    transition(
      componentEvents.RUN_PAYROLL_BACK,
      'overview',
      reduce(
        createReducer({
          component: PayrollLandingOverviewContextual,
          previousState: 'tabs',
        }),
      ),
      guard((ctx: PayrollLandingFlowContextInterface) => {
        return ctx.previousState === 'overview'
      }),
    ),
    transition(
      componentEvents.RUN_PAYROLL_BACK,
      'tabs',
      reduce(
        createReducer({
          component: PayrollLandingTabsContextual,
          payrollUuid: undefined,
          previousState: undefined,
        }),
      ),
      guard((ctx: PayrollLandingFlowContextInterface) => {
        return ctx.previousState === 'tabs'
      }),
    ),
  ),
}
