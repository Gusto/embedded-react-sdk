import { reduce, state, transition } from 'robot3'
import {
  CreatePaymentContextual,
  OverviewPaymentContextual,
  type PaymentFlowContextInterface,
  PaymentListContextual,
} from './PaymentFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import { updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'
import type { BreadcrumbNodes } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { createBreadcrumbNavigateTransition } from '@/components/Common/FlowBreadcrumbs/breadcrumbTransitionHelpers'

type EventPayloads = {
  [componentEvents.CONTRACTOR_PAYMENT_CREATE]: undefined
  [componentEvents.CONTRACTOR_PAYMENT_PREVIEW]: undefined
  [componentEvents.CONTRACTOR_PAYMENT_EDIT]: undefined
  [componentEvents.CONTRACTOR_PAYMENT_UPDATE]: undefined
  [componentEvents.CONTRACTOR_PAYMENT_SUBMIT]: undefined
  [componentEvents.BREADCRUMB_NAVIGATE]: {
    key: string
    onNavigate: (ctx: PaymentFlowContextInterface) => PaymentFlowContextInterface
  }
}

export const paymentFlowBreadcrumbsNodes: BreadcrumbNodes = {
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
      id: 'createPayment',
      label: 'breadcrumbLabel',
      namespace: 'Contractor.Payments.CreatePayment',
      onNavigate: ((ctx: PaymentFlowContextInterface) => ({
        ...updateBreadcrumbs('createPayment', ctx),
        // component: PayrollConfigurationContextual,
      })) as (context: unknown) => unknown,
    },
  },
  overview: {
    parent: 'createPayment',
    item: {
      id: 'overview',
      label: 'breadcrumbLabel',
      namespace: 'Contractor.Payments.Overview',
      onNavigate: ((ctx: PaymentFlowContextInterface) => ({
        ...updateBreadcrumbs('overview', ctx),
        // component: PayrollOverviewContextual,
        alerts: undefined,
      })) as (context: unknown) => unknown,
    },
  },
  editPayment: {
    //TODO: this node is not used - should consider nulls for these
    parent: 'createPayment',
    item: {
      id: 'editPayment',
      label: 'breadcrumbLabel',
      namespace: 'Contractor.Payments.EditPayment',
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

const breadcrumbNavigateTransition =
  createBreadcrumbNavigateTransition<PaymentFlowContextInterface>()

export const paymentMachine = {
  landing: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_PAYMENT_CREATE,
      'createPayment',
      reduce(
        (
          ctx: PaymentFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.CONTRACTOR_PAYMENT_CREATE>,
        ): PaymentFlowContextInterface => {
          return {
            ...updateBreadcrumbs('createPayment', ctx),
            component: CreatePaymentContextual,
            progressBarType: 'breadcrumbs',
          }
        },
      ),
    ),
  ),
  createPayment: state<MachineTransition>(
    // transition(
    //   componentEvents.CONTRACTOR_PAYMENT_PREVIEW,
    //   'overview',
    //   reduce(
    //     (
    //       ctx: PaymentFlowContextInterface,
    //       ev: MachineEventType<EventPayloads, typeof componentEvents.CONTRACTOR_PAYMENT_CREATE>,
    //     ): PaymentFlowContextInterface => {
    //       return {
    //         ...updateBreadcrumbs('overview', ctx),
    //         component: OverviewPaymentContextual,
    //       }
    //     },
    //   ),
    // ),
    // transition(
    //   componentEvents.CONTRACTOR_PAYMENT_EDIT,
    //   'editPayment',
    //   reduce(
    //     (
    //       ctx: PaymentFlowContextInterface,
    //       ev: MachineEventType<EventPayloads, typeof componentEvents.CONTRACTOR_PAYMENT_EDIT>,
    //     ): PaymentFlowContextInterface => {
    //       return {
    //         ...updateBreadcrumbs('editPayment', ctx),
    //         component: EditPaymentContextual,
    //         progressBarType: null,
    //       }
    //     },
    //   ),
    // ),
    breadcrumbNavigateTransition('landing'),
  ),
  editPayment: state<MachineTransition>( //TODO: should not update breadcrumbs here, just hide progress bar
    transition(
      componentEvents.CONTRACTOR_PAYMENT_UPDATE,
      'createPayment',
      reduce(
        (
          ctx: PaymentFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.CONTRACTOR_PAYMENT_UPDATE>,
        ): PaymentFlowContextInterface => {
          return {
            ...updateBreadcrumbs('createPayment', ctx),
            component: CreatePaymentContextual,
            currentBreadcrumbId: 'createPayment',
          }
        },
      ),
    ),
    transition(
      componentEvents.CANCEL,
      'createPayment',
      reduce(
        createReducer({
          progressBarType: 'breadcrumbs',
          component: CreatePaymentContextual,
          currentBreadcrumbId: 'createPayment',
        }),
      ),
    ),
    breadcrumbNavigateTransition('landing'),
  ),
  overview: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_PAYMENT_SUBMIT,
      'landing',
      reduce(
        (
          ctx: PaymentFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.CONTRACTOR_PAYMENT_SUBMIT>,
        ): PaymentFlowContextInterface => {
          return {
            ...updateBreadcrumbs('landing', ctx),
            component: PaymentListContextual,
            progressBarType: null,
          }
        },
      ),
    ),
    transition(
      componentEvents.CONTRACTOR_PAYMENT_CREATE,
      'createPayment',
      reduce(
        (
          ctx: PaymentFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.CONTRACTOR_PAYMENT_CREATE>,
        ): PaymentFlowContextInterface => {
          return {
            ...updateBreadcrumbs('createPayment', ctx),
            component: CreatePaymentContextual,
          }
        },
      ),
    ),
  ),
}
