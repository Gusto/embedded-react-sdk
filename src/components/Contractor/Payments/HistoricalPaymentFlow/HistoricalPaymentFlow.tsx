import { createMachine } from 'robot3'
import { useState } from 'react'
import {
  historicalPaymentBreadcrumbsNodes,
  historicalPaymentMachine,
} from './historicalPaymentMachine'
import {
  CreateHistoricalPaymentContextual,
  type HistoricalPaymentFlowContextInterface,
  type HistoricalPaymentFlowProps,
} from './HistoricalPaymentFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import type { FlowBreadcrumb } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { buildBreadcrumbs, updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'

const EMPTY_BREADCRUMBS: FlowBreadcrumb[] = []

/**
 * Props for the flow-internal {@link HistoricalPaymentInternalFlow}, which layers a parent flow's
 * prefix breadcrumbs on top of the public {@link HistoricalPaymentFlowProps}.
 *
 * @internal
 */
export interface HistoricalPaymentInternalFlowProps extends HistoricalPaymentFlowProps {
  /**
   * Breadcrumbs prepended to the flow's own breadcrumb trail. Set by a parent flow (e.g.
   * `PaymentFlow`) so the breadcrumb history remains coherent across the handoff.
   */
  prefixBreadcrumbs?: FlowBreadcrumb[]
}

/**
 * Guided flow to record a historical contractor payment and review the resulting summary.
 *
 * @remarks
 * This is the inner flow that powers the historical-payment spoke of `ContractorManagement.PaymentFlow`.
 * Render it directly when you have built your own payments landing page and want to hand the user
 * off to the standard historical-payment experience without re-implementing it. A historical payment
 * already happened outside Gusto and does not move money, so unlike `CreatePaymentFlow` there is no
 * Fast ACH blocker or wire-transfer step.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/historicalPayments/edit` | The edit modal was opened for a contractor | — |
 * | `contractor/historicalPayments/update` | A contractor's payment values were updated locally | The updated form values (hours, wage, bonus, reimbursement, payment method, etc.) |
 * | `contractor/historicalPayments/preview` | The preview API call succeeded | The contractor payment group preview response |
 * | `contractor/historicalPayments/backToEdit` | The user returned from preview to continue editing | — |
 * | `contractor/historicalPayments/created` | The payment group was successfully created | The created `ContractorPaymentGroup` |
 * | `contractor/historicalPayments/exit` | User is done reviewing the summary | — |
 * | `breadcrumb/navigate` | Fired when the user clicks a breadcrumb to navigate back | `{ key: string, onNavigate: (ctx) => ctx }` |
 *
 * @components
 * - {@link CreateHistoricalPayment}
 * - {@link HistoricalPaymentSummary}
 *
 * @param props - See {@link HistoricalPaymentFlowProps}.
 * @returns The composed historical-payment flow.
 * @alpha
 *
 * @example
 * ```tsx title="App.tsx"
 * import { ContractorManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <ContractorManagement.HistoricalPaymentFlow
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function HistoricalPaymentFlow(props: HistoricalPaymentFlowProps) {
  return <HistoricalPaymentInternalFlow {...props} />
}

/**
 * Flow-internal entry point for {@link HistoricalPaymentFlow} that additionally accepts
 * flow-injected `prefixBreadcrumbs`. Partners use {@link HistoricalPaymentFlow}; `PaymentFlow`
 * renders this directly to prepend its own breadcrumb trail.
 *
 * @internal
 */
export function HistoricalPaymentInternalFlow({
  companyId,
  onEvent,
  prefixBreadcrumbs = EMPTY_BREADCRUMBS,
}: HistoricalPaymentInternalFlowProps) {
  // Built once via a lazy useState initializer, not useMemo: the machine's identity must survive
  // re-renders no matter what, and useMemo is only a performance hint React may discard, not an
  // identity guarantee. A useMemo keyed on `prefixBreadcrumbs` would recreate this machine (and
  // reset in-flight state, losing entered amounts) whenever the parent app re-renders in response
  // to a bubbled `onEvent` call, since an inline array literal upstream gets a new reference every
  // render.
  const [historicalPaymentFlow] = useState(() => {
    const baseBreadcrumbs = buildBreadcrumbs(historicalPaymentBreadcrumbsNodes)
    const breadcrumbs = Object.fromEntries(
      Object.entries(baseBreadcrumbs).map(([stateKey, trail]) => [
        stateKey,
        [...prefixBreadcrumbs, ...trail],
      ]),
    )

    const initialBreadcrumbContext = updateBreadcrumbs('createHistoricalPayment', {
      header: {
        type: 'breadcrumbs' as const,
        breadcrumbs,
      },
    })

    return createMachine(
      'createHistoricalPayment',
      historicalPaymentMachine,
      (initialContext: HistoricalPaymentFlowContextInterface) => ({
        ...initialContext,
        ...initialBreadcrumbContext,
        component: CreateHistoricalPaymentContextual,
        companyId,
      }),
    )
  })

  return <Flow machine={historicalPaymentFlow} onEvent={onEvent} />
}
