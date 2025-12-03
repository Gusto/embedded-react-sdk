import { reduce, state, transition } from 'robot3'
import {
  CreatePaymentContextual,
  type PaymentFlowContextInterface,
  PaymentListContextual,
} from './PaymentFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'
import { updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'
import type { BreadcrumbNodes } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'

type EventPayloads = {
  [componentEvents.CONTRACTOR_PAYMENT_CREATE]: undefined
  [componentEvents.BREADCRUMB_NAVIGATE]: {
    key: string
    onNavigate: (ctx: PaymentFlowContextInterface) => PaymentFlowContextInterface
  }
}

export const payrollFlowBreadcrumbsNodes: BreadcrumbNodes = {
  landing: {
    parent: null,
    item: {
      id: 'landing',
      label: 'breadcrumbLabel',
      namespace: 'Contractor.Payments.PaymentsList',
      onNavigate: ((ctx: PaymentFlowContextInterface) => ({
        ...ctx,
        currentBreadcrumb: 'landing',
        progressBarType: null,
        component: PaymentListContextual,
      })) as (context: unknown) => unknown,
    },
  },
  createPayment: {
    parent: 'landing',
    item: {
      id: 'configuration',
      label: 'breadcrumbLabel',
      namespace: 'Payroll.PayrollConfiguration',
      onNavigate: ((ctx: PaymentFlowContextInterface) => ({
        ...updateBreadcrumbs('configuration', ctx),
        // component: PayrollConfigurationContextual,
      })) as (context: unknown) => unknown,
    },
  },
  overview: {
    parent: 'configuration',
    item: {
      id: 'overview',
      label: 'breadcrumbLabel',
      namespace: 'Payroll.PayrollOverview',
      onNavigate: ((ctx: PaymentFlowContextInterface) => ({
        ...updateBreadcrumbs('overview', ctx),
        // component: PayrollOverviewContextual,
        alerts: undefined,
      })) as (context: unknown) => unknown,
    },
  },
  editEmployeePayment: {
    parent: 'configuration',
    item: {
      id: 'editEmployee',
      label: 'breadcrumbLabel',
      namespace: 'Payroll.PayrollEditEmployee',
    },
  },
  history: {
    parent: 'overview',
    item: {
      id: 'receipts',
      label: 'breadcrumbLabel',
      namespace: 'Payroll.PayrollReceipts',
    },
  },
} as const

const createReducer = (props: Partial<PaymentFlowContextInterface>) => {
  return (ctx: PaymentFlowContextInterface): PaymentFlowContextInterface => ({
    ...ctx,
    ...props,
  })
}

// const breadcrumbNavigateTransition = (targetState: string) =>
//   transition(
//     componentEvents.BREADCRUMB_NAVIGATE,
//     targetState,
//     guard(
//       (ctx: PayrollFlowContextInterface, ev: { payload: { key: string } }) =>
//         ev.payload.key === targetState,
//     ),
//     reduce(
//       (
//         ctx: PayrollFlowContextInterface,
//         ev: MachineEventType<EventPayloads, typeof componentEvents.BREADCRUMB_NAVIGATE>,
//       ): PayrollFlowContextInterface => ev.payload.onNavigate(ctx),
//     ),
//   )

// const exitFlowTransition = transition(
//   componentEvents.PAYROLL_EXIT_FLOW,
//   'landing',
//   reduce(
//     createReducer({
//       component: PayrollLandingContextual,
//       progressBarType: null,
//       currentBreadcrumbId: 'landing',
//       alerts: undefined,
//     }),
//   ),
// )

export const payrollMachine = {
  landing: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_PAYMENT_CREATE,
      'createPayment',
      reduce(
        createReducer({
          component: CreatePaymentContextual,
          progressBarType: null,
          currentBreadcrumbId: 'createPayment',
        }),
      ),
    ),
  ),
  createPayment: state<MachineTransition>(),
}
