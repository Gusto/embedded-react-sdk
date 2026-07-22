import { reduce, state, transition } from 'robot3'
import type { WireInRequest } from '@gusto/embedded-api/models/components/wireinrequest'
import {
  CreatePaymentFlowContextual,
  InformationRequestsContextual,
  PaymentListContextual,
  type PaymentFlowContextInterface,
  ViewHistoryFlowContextual,
} from './PaymentFlowComponents'
import { componentEvents, informationRequestEvents, payrollWireEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import { patchBreadcrumbsHeader } from '@/helpers/breadcrumbHelpers'
import type { BreadcrumbNodes } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { createBreadcrumbNavigateTransition } from '@/components/Common/FlowBreadcrumbs/breadcrumbTransitionHelpers'

type EventPayloads = {
  [componentEvents.CONTRACTOR_PAYMENT_CREATE]: undefined
  [componentEvents.CONTRACTOR_PAYMENT_EXIT]: { uuid?: string | null }
  [componentEvents.CONTRACTOR_PAYMENT_VIEW]: { paymentId: string }
  [componentEvents.CONTRACTOR_PAYMENT_CANCEL]: { paymentId: string }
  [componentEvents.CONTRACTOR_PAYMENT_RFI_RESPOND]: undefined
  [componentEvents.BREADCRUMB_NAVIGATE]: {
    key: string
    onNavigate: (ctx: PaymentFlowContextInterface) => PaymentFlowContextInterface
  }
  [informationRequestEvents.INFORMATION_REQUEST_FORM_DONE]: undefined
  [informationRequestEvents.INFORMATION_REQUEST_FORM_CANCEL]: undefined
  [payrollWireEvents.PAYROLL_WIRE_FORM_DONE]: {
    wireInRequest: WireInRequest
    confirmationAlert: {
      title: string
      content?: string
    }
  }
}

/**
 * Hub-level breadcrumb nodes for {@link PaymentFlow}.
 *
 * @remarks
 * Only `landing` is defined here — the `createPayment` and `history` spokes own and render their
 * own breadcrumb trails (via `CreatePaymentFlow`/`ViewHistoryFlow`), prefixed with this `landing`
 * item so the trail reads continuously across the hub/spoke boundary.
 *
 * @internal
 */
export const paymentFlowBreadcrumbsNodes: BreadcrumbNodes = {
  landing: {
    parent: null,
    item: {
      id: 'landing',
      label: 'breadcrumbLabel',
      namespace: 'Contractor.Payments.PaymentsList',
      onNavigate: ((ctx: PaymentFlowContextInterface) => ({
        ...patchBreadcrumbsHeader(ctx, { currentBreadcrumbId: undefined }),
        component: PaymentListContextual,
      })) as (context: unknown) => unknown,
    },
  },
}

const breadcrumbNavigateTransition =
  createBreadcrumbNavigateTransition<PaymentFlowContextInterface>()

/**
 * Hub machine for {@link PaymentFlow}.
 *
 * @remarks
 * `createPayment` and `history` each stay active for the full lifetime of their respective spoke
 * (`CreatePaymentFlow`, `ViewHistoryFlow`) rather than tracking the spoke's internal screen. The
 * spoke's own machine drives its internal steps and breadcrumb trail; events it can't handle
 * locally (e.g. the `landing` breadcrumb, or a terminal exit/cancel event) bubble up here to
 * transition the hub back to `landing`.
 *
 * @internal
 */
export const paymentMachine = {
  landing: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_PAYMENT_CREATE,
      'createPayment',
      reduce((ctx: PaymentFlowContextInterface): PaymentFlowContextInterface => {
        return {
          ...ctx,
          component: CreatePaymentFlowContextual,
          alerts: undefined,
        }
      }),
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
            ...ctx,
            component: ViewHistoryFlowContextual,
            currentPaymentId: ev.payload.paymentId,
            alerts: undefined,
          }
        },
      ),
    ),
    transition(
      componentEvents.CONTRACTOR_PAYMENT_RFI_RESPOND,
      'informationRequests',
      reduce((ctx: PaymentFlowContextInterface): PaymentFlowContextInterface => {
        return {
          ...patchBreadcrumbsHeader(ctx, { currentBreadcrumbId: undefined }),
          component: InformationRequestsContextual,
        }
      }),
    ),
    transition(
      payrollWireEvents.PAYROLL_WIRE_FORM_DONE,
      'landing',
      reduce(
        (
          ctx: PaymentFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof payrollWireEvents.PAYROLL_WIRE_FORM_DONE>,
        ): PaymentFlowContextInterface => {
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
  createPayment: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_PAYMENT_EXIT,
      'landing',
      reduce((ctx: PaymentFlowContextInterface): PaymentFlowContextInterface => {
        return {
          ...patchBreadcrumbsHeader(ctx, { currentBreadcrumbId: undefined }),
          component: PaymentListContextual,
          alerts: undefined,
        }
      }),
    ),
    breadcrumbNavigateTransition('landing'),
  ),
  history: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_PAYMENT_CANCEL,
      'landing',
      reduce((ctx: PaymentFlowContextInterface): PaymentFlowContextInterface => {
        return {
          ...patchBreadcrumbsHeader(ctx, { currentBreadcrumbId: undefined }),
          component: PaymentListContextual,
          alerts: [
            {
              type: 'success',
              title: 'paymentCancelledSuccessfully',
            },
          ],
        }
      }),
    ),
    breadcrumbNavigateTransition('landing'),
  ),
  informationRequests: state<MachineTransition>(
    transition(
      informationRequestEvents.INFORMATION_REQUEST_FORM_DONE,
      'landing',
      reduce((ctx: PaymentFlowContextInterface): PaymentFlowContextInterface => {
        return {
          ...patchBreadcrumbsHeader(ctx, { currentBreadcrumbId: undefined }),
          component: PaymentListContextual,
        }
      }),
    ),
    transition(
      informationRequestEvents.INFORMATION_REQUEST_FORM_CANCEL,
      'landing',
      reduce((ctx: PaymentFlowContextInterface): PaymentFlowContextInterface => {
        return {
          ...patchBreadcrumbsHeader(ctx, { currentBreadcrumbId: undefined }),
          component: PaymentListContextual,
        }
      }),
    ),
  ),
}
