import { reduce, state, transition } from 'robot3'
import type { ContractorPaymentGroup } from '@gusto/embedded-api/models/components/contractorpaymentgroup'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { getContractorDisplayName } from '../CreatePayment/helpers'
import {
  CreatePaymentContextual,
  type PaymentFlowContextInterface,
  PaymentHistoryContextual,
  PaymentListContextual,
  PaymentStatementContextual,
} from './PaymentFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import { updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'
import type { BreadcrumbNodes } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { createBreadcrumbNavigateTransition } from '@/components/Common/FlowBreadcrumbs/breadcrumbTransitionHelpers'

type EventPayloads = {
  [componentEvents.CONTRACTOR_PAYMENT_CREATE]: undefined
  [componentEvents.CONTRACTOR_PAYMENT_CREATED]: ContractorPaymentGroup
  [componentEvents.CONTRACTOR_PAYMENT_VIEW]: { paymentId: string }
  [componentEvents.CONTRACTOR_PAYMENT_VIEW_DETAILS]: {
    contractor: Contractor
    paymentGroupId: string
  }
  [componentEvents.CONTRACTOR_PAYMENT_CANCEL]: { paymentId: string }
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
      })) as (context: unknown) => unknown,
    },
  },
  history: {
    parent: 'landing',
    item: {
      id: 'history',
      label: 'breadcrumbLabel',
      namespace: 'Contractor.Payments.PaymentHistory',
      onNavigate: ((ctx: PaymentFlowContextInterface) => ({
        ...updateBreadcrumbs('history', ctx),
        component: PaymentHistoryContextual,
      })) as (context: unknown) => unknown,
    },
  },
  statement: {
    parent: 'history',
    item: {
      id: 'statement',
      label: 'breadcrumbLabel',
      namespace: 'Contractor.Payments.PaymentStatement',
    },
  },
} as const

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
            alerts: undefined,
          }
        },
      ),
    ),
    transition(
      componentEvents.CONTRACTOR_PAYMENT_VIEW,
      'history',
      reduce(
        (
          ctx: PaymentFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.CONTRACTOR_PAYMENT_VIEW>,
        ): PaymentFlowContextInterface => {
          return {
            ...updateBreadcrumbs('history', ctx),
            component: PaymentHistoryContextual,
            currentPaymentId: ev.payload.paymentId,
            progressBarType: 'breadcrumbs',
            alerts: undefined,
          }
        },
      ),
    ),
  ),
  createPayment: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_PAYMENT_CREATED,
      'landing',
      reduce(
        (
          ctx: PaymentFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.CONTRACTOR_PAYMENT_CREATED>,
        ): PaymentFlowContextInterface => {
          const contractorPaymentGroup = ev.payload
          const contractorCount = contractorPaymentGroup.contractorPayments?.length || 0

          return {
            ...updateBreadcrumbs('landing', ctx),
            progressBarType: null,
            component: PaymentListContextual,
            alerts: [
              {
                type: 'success',
                title: 'paymentCreatedSuccessfully',
                translationParams: {
                  count: contractorCount,
                },
              },
            ],
          }
        },
      ),
    ),
    breadcrumbNavigateTransition('landing'),
  ),
  history: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_PAYMENT_VIEW_DETAILS,
      'statement',
      reduce(
        (
          ctx: PaymentFlowContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.CONTRACTOR_PAYMENT_VIEW_DETAILS
          >,
        ): PaymentFlowContextInterface => {
          return {
            ...updateBreadcrumbs('statement', ctx, {
              contractorName: getContractorDisplayName(ev.payload.contractor),
            }),
            component: PaymentStatementContextual,
            currentContractorUuid: ev.payload.contractor.uuid,
            currentPaymentId: ev.payload.paymentGroupId,
            progressBarType: 'breadcrumbs',
            alerts: undefined,
          }
        },
      ),
    ),
    transition(
      componentEvents.CONTRACTOR_PAYMENT_CANCEL,
      'landing',
      reduce(
        (
          ctx: PaymentFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.CONTRACTOR_PAYMENT_CANCEL>,
        ): PaymentFlowContextInterface => {
          return {
            ...updateBreadcrumbs('landing', ctx),
            progressBarType: null,
            component: PaymentListContextual,
            alerts: [
              {
                type: 'success',
                title: 'paymentCancelledSuccessfully',
              },
            ],
          }
        },
      ),
    ),
    breadcrumbNavigateTransition('landing'),
  ),
  statement: state<MachineTransition>(
    breadcrumbNavigateTransition('landing'),
    breadcrumbNavigateTransition('history'),
  ),
}
