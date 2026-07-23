import { createMachine } from 'robot3'
import { useState } from 'react'
import { viewHistoryBreadcrumbsNodes, viewHistoryMachine } from './viewHistoryMachine'
import {
  PaymentHistoryContextual,
  type ViewHistoryFlowContextInterface,
  type ViewHistoryFlowProps,
} from './ViewHistoryFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import type { FlowBreadcrumb } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { buildBreadcrumbs, updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'

const EMPTY_BREADCRUMBS: FlowBreadcrumb[] = []

/**
 * Props for the flow-internal {@link ViewHistoryInternalFlow}, which layers a parent flow's
 * prefix breadcrumbs on top of the public {@link ViewHistoryFlowProps}.
 *
 * @internal
 */
export interface ViewHistoryInternalFlowProps extends ViewHistoryFlowProps {
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
 * This is the inner flow that powers the view-history spoke of `ContractorManagement.PaymentFlow`.
 * Render it directly when you have built your own payments landing page and want to hand the user
 * off to the standard history-viewing experience without re-implementing it. The flow ships with
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
 * @param props - See {@link ViewHistoryFlowProps}.
 * @returns The composed view-history flow.
 * @alpha
 *
 * @example
 * ```tsx title="App.tsx"
 * import { ContractorManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <ContractorManagement.ViewHistoryFlow
 *       paymentId="0987fcea-7b59-4907-a301-f232b5aff508"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function ViewHistoryFlow(props: ViewHistoryFlowProps) {
  return <ViewHistoryInternalFlow {...props} />
}

/**
 * Flow-internal entry point for {@link ViewHistoryFlow} that additionally accepts
 * flow-injected `prefixBreadcrumbs`. Partners use {@link ViewHistoryFlow}; `PaymentFlow` renders
 * this directly to prepend its own breadcrumb trail.
 *
 * @internal
 */
export function ViewHistoryInternalFlow({
  paymentId,
  onEvent,
  prefixBreadcrumbs = EMPTY_BREADCRUMBS,
}: ViewHistoryInternalFlowProps) {
  // Built once via a lazy useState initializer, not useMemo -- see CreatePaymentFlow.tsx for why:
  // a useMemo keyed on `prefixBreadcrumbs` doesn't guarantee the machine's identity survives a
  // re-render triggered by a bubbled `onEvent` call.
  const [viewHistoryFlow] = useState(() => {
    const baseBreadcrumbs = buildBreadcrumbs(viewHistoryBreadcrumbsNodes)
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
      viewHistoryMachine,
      (initialContext: ViewHistoryFlowContextInterface) => ({
        ...initialContext,
        ...initialBreadcrumbContext,
        component: PaymentHistoryContextual,
        currentPaymentId: paymentId,
      }),
    )
  })

  return <Flow machine={viewHistoryFlow} onEvent={onEvent} />
}
