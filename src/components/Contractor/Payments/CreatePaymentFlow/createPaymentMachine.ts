import { reduce, state, transition } from 'robot3'
import type { ContractorPaymentGroup } from '@gusto/embedded-api/models/components/contractorpaymentgroup'
import type { WireInRequest } from '@gusto/embedded-api/models/components/wireinrequest'
import {
  PaymentSummaryContextual,
  type CreatePaymentFlowContextInterface,
} from './CreatePaymentFlowComponents'
import { payrollWireEvents, componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import { updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'
import type { BreadcrumbNodes } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'

type EventPayloads = {
  [componentEvents.CONTRACTOR_PAYMENT_CREATED]: ContractorPaymentGroup
  [payrollWireEvents.PAYROLL_WIRE_FORM_DONE]: {
    wireInRequest: WireInRequest
    confirmationAlert: {
      title: string
      content?: string
    }
  }
}

/** @internal */
export const createPaymentBreadcrumbsNodes: BreadcrumbNodes = {
  createPayment: {
    parent: null,
    item: {
      id: 'createPayment',
      label: 'breadcrumbLabel',
      namespace: 'Contractor.Payments.CreatePayment',
      onNavigate: ((ctx: CreatePaymentFlowContextInterface) => ({
        ...updateBreadcrumbs('createPayment', ctx),
      })) as (context: unknown) => unknown,
    },
  },
  paymentSummary: {
    parent: null,
    item: {
      id: 'paymentSummary',
      label: 'breadcrumbLabel',
      namespace: 'Contractor.Payments.PaymentSummary',
    },
  },
}

/** @internal */
export const createPaymentMachine = {
  createPayment: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_PAYMENT_CREATED,
      'paymentSummary',
      reduce(
        (
          ctx: CreatePaymentFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.CONTRACTOR_PAYMENT_CREATED>,
        ): CreatePaymentFlowContextInterface => {
          return {
            ...updateBreadcrumbs('paymentSummary', ctx),
            component: PaymentSummaryContextual,
            createdPaymentGroupId: ev.payload.uuid,
            alerts: undefined,
          }
        },
      ),
    ),
  ),
  paymentSummary: state<MachineTransition>(
    transition(
      payrollWireEvents.PAYROLL_WIRE_FORM_DONE,
      'paymentSummary',
      reduce(
        (
          ctx: CreatePaymentFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof payrollWireEvents.PAYROLL_WIRE_FORM_DONE>,
        ): CreatePaymentFlowContextInterface => {
          return {
            ...ctx,
            alerts: [
              {
                type: 'success',
                title: 'wireDetailsSubmitted',
                content: ev.payload.confirmationAlert.content,
              },
            ],
          }
        },
      ),
    ),
  ),
}
