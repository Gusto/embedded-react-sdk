import { createMachine } from 'robot3'
import { useState } from 'react'
import { viewPaymentBreadcrumbsNodes, viewPaymentMachine } from './viewPaymentMachine'
import {
  PaymentHistoryContextual,
  type ViewPaymentFlowContextInterface,
  type ViewPaymentFlowProps,
} from './ViewPaymentFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import type { FlowBreadcrumb } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { buildBreadcrumbs, updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'

const EMPTY_BREADCRUMBS: FlowBreadcrumb[] = []

/**
 * Props for the flow-internal {@link ViewPaymentInternalFlow}, which layers a parent flow's
 * prefix breadcrumbs on top of the public {@link ViewPaymentFlowProps}.
 *
 * @internal
 */
export interface ViewPaymentInternalFlowProps extends ViewPaymentFlowProps {
  /**
   * Breadcrumbs prepended to the flow's own breadcrumb trail. Set by a parent flow (e.g.
   * `PaymentFlow`) so the breadcrumb history remains coherent across the handoff.
   */
  prefixBreadcrumbs?: FlowBreadcrumb[]
}

/**
 * Guided flow to inspect a contractor payment group's history and drill into an individual
 * contractor's payment statement.
 *
 * @remarks
 * This is the inner flow that powers the view-payment spoke of `ContractorManagement.PaymentFlow`.
 * Render it directly when you have built your own payments landing page and want to hand the user
 * off to the standard payment-viewing experience without re-implementing it. The flow ships with
 * breadcrumb navigation and lets the user cancel an individual payment from the history screen.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/payments/view/details` | Fired when the user views a specific contractor payment | `{ contractor: Contractor, paymentGroupId: string }` |
 * | `contractor/payments/cancel` | Fired when a payment is cancelled | `{ paymentId: string }` |
 * | `breadcrumb/navigate` | Fired when the user clicks a breadcrumb to navigate back | `{ key: string, onNavigate: (ctx) => ctx }` |
 *
 * @components
 * - {@link PaymentHistory}
 * - {@link PaymentStatement}
 *
 * @param props - See {@link ViewPaymentFlowProps}.
 * @returns The composed view-payment flow.
 * @alpha
 *
 * @example
 * ```tsx title="App.tsx"
 * import { ContractorManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <ContractorManagement.ViewPaymentFlow
 *       paymentId="0987fcea-7b59-4907-a301-f232b5aff508"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function ViewPaymentFlow(props: ViewPaymentFlowProps) {
  return <ViewPaymentInternalFlow {...props} />
}

/**
 * Flow-internal entry point for {@link ViewPaymentFlow} that additionally accepts
 * flow-injected `prefixBreadcrumbs`. Partners use {@link ViewPaymentFlow}; `PaymentFlow` renders
 * this directly to prepend its own breadcrumb trail.
 *
 * @internal
 */
export function ViewPaymentInternalFlow({
  paymentId,
  onEvent,
  prefixBreadcrumbs = EMPTY_BREADCRUMBS,
}: ViewPaymentInternalFlowProps) {
  // Built once via a lazy useState initializer, not useMemo -- see CreatePaymentFlow.tsx for why:
  // a useMemo keyed on `prefixBreadcrumbs` doesn't guarantee the machine's identity survives a
  // re-render triggered by a bubbled `onEvent` call.
  const [viewPaymentFlow] = useState(() => {
    const baseBreadcrumbs = buildBreadcrumbs(viewPaymentBreadcrumbsNodes)
    const breadcrumbs = Object.fromEntries(
      Object.entries(baseBreadcrumbs).map(([stateKey, trail]) => [
        stateKey,
        [...prefixBreadcrumbs, ...trail],
      ]),
    )

    const initialBreadcrumbContext = updateBreadcrumbs('history', {
      header: {
        type: 'breadcrumbs' as const,
        breadcrumbs,
      },
    })

    return createMachine(
      'history',
      viewPaymentMachine,
      (initialContext: ViewPaymentFlowContextInterface) => ({
        ...initialContext,
        ...initialBreadcrumbContext,
        component: PaymentHistoryContextual,
        currentPaymentId: paymentId,
      }),
    )
  })

  return <Flow machine={viewPaymentFlow} onEvent={onEvent} />
}
