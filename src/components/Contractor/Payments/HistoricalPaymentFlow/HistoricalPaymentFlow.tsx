import { createMachine } from 'robot3'
import { useState } from 'react'
import { historicalPaymentMachine } from './historicalPaymentMachine'
import {
  CreateHistoricalPaymentContextual,
  type HistoricalPaymentFlowContextInterface,
  type HistoricalPaymentFlowProps,
} from './HistoricalPaymentFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import type { FlowBreadcrumb } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'

const EMPTY_BREADCRUMBS: FlowBreadcrumb[] = []

/**
 * Props for the flow-internal {@link HistoricalPaymentInternalFlow}, which layers a parent flow's
 * prefix breadcrumbs on top of the public {@link HistoricalPaymentFlowProps}.
 *
 * @internal
 */
export interface HistoricalPaymentInternalFlowProps extends HistoricalPaymentFlowProps {
  /**
   * Breadcrumbs prepended to this flow's trail. Set by a parent flow (e.g. `PaymentFlow`) so a
   * user can navigate out of this flow entirely -- this flow contributes no breadcrumb items of
   * its own (each of its own screens has its own Back button instead), so the trail is just
   * `prefixBreadcrumbs` passed straight through.
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
 * | `breadcrumb/navigate` | Fired when the user clicks a breadcrumb injected via `prefixBreadcrumbs` | `{ key: string, onNavigate: (ctx) => ctx }` |
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
 * renders this directly to give the user a way back to the payments landing screen.
 *
 * @internal
 */
export function HistoricalPaymentInternalFlow(props: HistoricalPaymentInternalFlowProps) {
  useUnstableFeature('historicalPayments', { throwIfDisabled: true })

  // Remount and reset all state if companyId ever changes
  return <HistoricalPaymentFlowMachine key={props.companyId} {...props} />
}

function HistoricalPaymentFlowMachine({
  companyId,
  onEvent,
  prefixBreadcrumbs = EMPTY_BREADCRUMBS,
}: HistoricalPaymentInternalFlowProps) {
  // Built once via a lazy useState initializer. If the companyId ever changes,
  // remount the entire component to reset all state, not just the state machine.
  const [historicalPaymentFlow] = useState(() => {
    const initialBreadcrumbContext = updateBreadcrumbs('createHistoricalPayment', {
      header: {
        type: 'breadcrumbs' as const,
        breadcrumbs: {
          createHistoricalPayment: prefixBreadcrumbs,
          historicalPaymentSummary: prefixBreadcrumbs,
        },
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
