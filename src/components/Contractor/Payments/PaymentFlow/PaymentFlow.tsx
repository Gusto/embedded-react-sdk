import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { paymentFlowBreadcrumbsNodes, paymentMachine } from './paymentStateMachine'
import {
  PaymentListContextual,
  type PaymentFlowContextInterface,
  type PaymentFlowProps,
} from './PaymentFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

/**
 * Guided workflow for creating, managing, and viewing contractor payment groups for a company.
 *
 * @remarks
 * Composes the contractor payment subcomponents into a complete experience with breadcrumb navigation between the payments list, the create-payment form, the post-creation summary, the payment-history detail view, and individual contractor payment statements. Also routes into the information-requests flow when a payment-related request needs a response, and surfaces wire-transfer confirmation alerts after a wire details submission.
 *
 * Events emitted by the subcomponents bubble up through the single `onEvent` handler.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/payments/create` | Fired when the user chooses to create a new payment | — |
 * | `contractor/payments/created` | Fired when a payment group is successfully created | The created `ContractorPaymentGroup` |
 * | `contractor/payments/view` | Fired when the user selects a payment group to view | `{ paymentId: string }` |
 * | `contractor/payments/view/details` | Fired when the user views a specific contractor payment | `{ contractor: Contractor, paymentGroupId: string }` |
 * | `contractor/payments/cancel` | Fired when a payment is cancelled | `{ paymentId: string }` |
 * | `contractor/payments/exit` | Fired when the user completes the payment flow | `{ uuid?: string | null }` |
 * | `contractor/payments/rfi/respond` | Fired when the user clicks to respond to a pending information request | — |
 * | `payroll/wire/form/done` | Fired when wire transfer details are submitted | `{ wireInRequest: WireInRequest, confirmationAlert: { title: string, content?: string } }` |
 * | `informationRequest/form/done` | Fired when the information-requests flow completes | — |
 * | `informationRequest/form/cancel` | Fired when the information-requests flow is cancelled | — |
 * | `breadcrumb/navigate` | Fired when the user clicks a breadcrumb to navigate back | `{ key: string, onNavigate: (ctx) => ctx }` |
 *
 * @components
 * - {@link PaymentsList}
 * - {@link CreatePayment}
 * - {@link PaymentSummary}
 * - {@link PaymentHistory}
 * - {@link PaymentStatement}
 * - {@link InformationRequests.InformationRequestsFlow | InformationRequestsFlow}
 *
 * @param props - See {@link PaymentFlowProps}.
 * @returns The multi-step contractor payments workflow.
 * @public
 *
 * @example
 * ```tsx title="App.tsx"
 * import { ContractorManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <ContractorManagement.PaymentFlow
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export const PaymentFlow = ({ companyId, onEvent }: PaymentFlowProps) => {
  const paymentFlow = useMemo(
    () =>
      createMachine('landing', paymentMachine, (initialContext: PaymentFlowContextInterface) => ({
        ...initialContext,
        component: PaymentListContextual,
        companyId,
        header: {
          type: 'breadcrumbs' as const,
          breadcrumbs: buildBreadcrumbs(paymentFlowBreadcrumbsNodes),
        },
      })),
    [companyId],
  )
  return <Flow machine={paymentFlow} onEvent={onEvent} />
}
