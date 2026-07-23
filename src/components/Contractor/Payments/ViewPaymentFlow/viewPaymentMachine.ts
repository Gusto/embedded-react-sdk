import { reduce, state, transition } from 'robot3'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { getContractorDisplayName } from '../CreatePayment/helpers'
import {
  PaymentHistoryContextual,
  PaymentStatementContextual,
  type ViewPaymentFlowContextInterface,
} from './ViewPaymentFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import { updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'
import type { BreadcrumbNodes } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { createBreadcrumbNavigateTransition } from '@/components/Common/FlowBreadcrumbs/breadcrumbTransitionHelpers'

type EventPayloads = {
  [componentEvents.CONTRACTOR_PAYMENT_VIEW_DETAILS]: {
    contractor: Contractor
    paymentGroupId: string
  }
}

const breadcrumbNavigateTransition =
  createBreadcrumbNavigateTransition<ViewPaymentFlowContextInterface>()

/** @internal */
export const viewPaymentBreadcrumbsNodes: BreadcrumbNodes = {
  history: {
    parent: null,
    item: {
      id: 'history',
      label: 'breadcrumbLabel',
      namespace: 'Contractor.Payments.PaymentHistory',
      onNavigate: ((ctx: ViewPaymentFlowContextInterface) => ({
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
}

/** @internal */
export const viewPaymentMachine = {
  history: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_PAYMENT_VIEW_DETAILS,
      'statement',
      reduce(
        (
          ctx: ViewPaymentFlowContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.CONTRACTOR_PAYMENT_VIEW_DETAILS
          >,
        ): ViewPaymentFlowContextInterface => {
          return {
            ...updateBreadcrumbs('statement', ctx, {
              contractorName: getContractorDisplayName(ev.payload.contractor),
            }),
            component: PaymentStatementContextual,
            currentContractorUuid: ev.payload.contractor.uuid,
            currentPaymentId: ev.payload.paymentGroupId,
          }
        },
      ),
    ),
  ),
  statement: state<MachineTransition>(breadcrumbNavigateTransition('history')),
}
