import { reduce, state, transition } from 'robot3'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import { getContractorDisplayName } from '../CreatePayment/helpers'
import {
  PaymentHistoryContextual,
  PaymentStatementContextual,
  type ViewHistoryFlowContextInterface,
} from './ViewHistoryFlowComponents'
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
  createBreadcrumbNavigateTransition<ViewHistoryFlowContextInterface>()

/** @internal */
export const viewHistoryBreadcrumbsNodes: BreadcrumbNodes = {
  history: {
    parent: null,
    item: {
      id: 'history',
      label: 'breadcrumbLabel',
      namespace: 'Contractor.Payments.PaymentHistory',
      onNavigate: ((ctx: ViewHistoryFlowContextInterface) => ({
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
export const viewHistoryMachine = {
  history: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_PAYMENT_VIEW_DETAILS,
      'statement',
      reduce(
        (
          ctx: ViewHistoryFlowContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.CONTRACTOR_PAYMENT_VIEW_DETAILS
          >,
        ): ViewHistoryFlowContextInterface => {
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
