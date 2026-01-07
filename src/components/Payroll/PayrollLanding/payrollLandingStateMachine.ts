import { transition, reduce, state, guard } from 'robot3'
import {
  PayrollLandingTabsContextual,
  PayrollLandingReceiptsContextual,
  PayrollLandingOverviewContextual,
  type PayrollLandingFlowContextInterface,
} from './PayrollLandingFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import type { BreadcrumbNodes } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'
import { createBreadcrumbNavigateTransition } from '@/components/Common/FlowBreadcrumbs/breadcrumbTransitionHelpers'

type EventPayloads = {
  [componentEvents.RUN_PAYROLL_RECEIPT_VIEWED]: {
    payrollId: string
    startDate?: string
    endDate?: string
  }
  [componentEvents.RUN_PAYROLL_SUMMARY_VIEWED]: {
    payrollId: string
    startDate?: string
    endDate?: string
  }
  [componentEvents.RUN_PAYROLL_RECEIPT_GET]: {
    payrollId: string
  }
}

export const payrollLandingBreadcrumbNodes: BreadcrumbNodes = {
  tabs: {
    parent: null,
    item: {
      id: 'tabs',
      label: 'breadcrumbs.landing',
      namespace: 'Payroll.PayrollLanding',
      onNavigate: ((ctx: PayrollLandingFlowContextInterface) => ({
        ...ctx,
        currentBreadcrumbId: 'tabs',
        progressBarType: null,
        component: PayrollLandingTabsContextual,
        payrollUuid: undefined,
        previousState: undefined,
        startDate: undefined,
        endDate: undefined,
      })) as (context: unknown) => unknown,
    },
  },
  overview: {
    parent: 'tabs',
    item: {
      id: 'overview',
      label: 'breadcrumbs.overview',
      namespace: 'Payroll.PayrollLanding',
    },
  },
  receipt: {
    parent: 'tabs',
    item: {
      id: 'receipt',
      label: 'breadcrumbs.receipt',
      namespace: 'Payroll.PayrollLanding',
    },
  },
} as const

const createReducer = (props: Partial<PayrollLandingFlowContextInterface>) => {
  return (ctx: PayrollLandingFlowContextInterface): PayrollLandingFlowContextInterface => ({
    ...ctx,
    ...props,
  })
}

const breadcrumbNavigateTransition =
  createBreadcrumbNavigateTransition<PayrollLandingFlowContextInterface>()

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
          ...updateBreadcrumbs('receipt', ctx, {
            startDate: ev.payload.startDate ?? '',
            endDate: ev.payload.endDate ?? '',
          }),
          component: PayrollLandingReceiptsContextual,
          payrollUuid: ev.payload.payrollId,
          previousState: 'tabs',
          selectedTab: 'payroll-history',
          progressBarType: 'breadcrumbs',
          startDate: ev.payload.startDate,
          endDate: ev.payload.endDate,
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
          ...updateBreadcrumbs('overview', ctx, {
            startDate: ev.payload.startDate ?? '',
            endDate: ev.payload.endDate ?? '',
          }),
          component: PayrollLandingOverviewContextual,
          payrollUuid: ev.payload.payrollId,
          previousState: 'tabs',
          selectedTab: 'payroll-history',
          progressBarType: 'breadcrumbs',
          startDate: ev.payload.startDate,
          endDate: ev.payload.endDate,
        }),
      ),
    ),
  ),
  overview: state<MachineTransition>(
    breadcrumbNavigateTransition('tabs'),
    transition(
      componentEvents.RUN_PAYROLL_BACK,
      'tabs',
      reduce(
        createReducer({
          component: PayrollLandingTabsContextual,
          payrollUuid: undefined,
          previousState: undefined,
          progressBarType: null,
          currentBreadcrumbId: 'tabs',
          startDate: undefined,
          endDate: undefined,
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
            ...updateBreadcrumbs('receipt', ctx, {
              startDate: ctx.startDate ?? '',
              endDate: ctx.endDate ?? '',
            }),
            component: PayrollLandingReceiptsContextual,
            payrollUuid: ev.payload.payrollId,
            previousState: 'overview',
            progressBarType: 'breadcrumbs',
          }
        },
      ),
    ),
  ),
  receipt: state<MachineTransition>(
    breadcrumbNavigateTransition('tabs'),
    transition(
      componentEvents.RUN_PAYROLL_BACK,
      'overview',
      reduce(
        (ctx: PayrollLandingFlowContextInterface): PayrollLandingFlowContextInterface => ({
          ...updateBreadcrumbs('overview', ctx, {
            startDate: ctx.startDate ?? '',
            endDate: ctx.endDate ?? '',
          }),
          component: PayrollLandingOverviewContextual,
          previousState: 'tabs',
          progressBarType: 'breadcrumbs',
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
          progressBarType: null,
          currentBreadcrumbId: 'tabs',
          startDate: undefined,
          endDate: undefined,
        }),
      ),
      guard((ctx: PayrollLandingFlowContextInterface) => {
        return ctx.previousState === 'tabs'
      }),
    ),
  ),
}
