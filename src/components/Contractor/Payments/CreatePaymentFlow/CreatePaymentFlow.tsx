import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { createPaymentBreadcrumbsNodes, createPaymentMachine } from './createPaymentMachine'
import {
  CreatePaymentContextual,
  type CreatePaymentFlowContextInterface,
  type CreatePaymentFlowProps,
} from './CreatePaymentFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import type { FlowBreadcrumb } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { buildBreadcrumbs, updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'

const EMPTY_BREADCRUMBS: FlowBreadcrumb[] = []

/**
 * Props for the flow-internal {@link CreatePaymentInternalFlow}, which layers a parent flow's
 * prefix breadcrumbs on top of the public {@link CreatePaymentFlowProps}.
 *
 * @internal
 */
export interface CreatePaymentInternalFlowProps extends CreatePaymentFlowProps {
  /**
   * Breadcrumbs prepended to the flow's own breadcrumb trail. Set by a parent flow (e.g.
   * `PaymentFlow`) so the breadcrumb history remains coherent across the handoff.
   */
  prefixBreadcrumbs?: FlowBreadcrumb[]
}

/**
 * Guided flow to create a contractor payment and review the resulting summary.
 *
 * @remarks
 * This is the inner flow that powers the create-payment spoke of `ContractorManagement.PaymentFlow`.
 * Render it directly when you have built your own payments landing page and want to hand the user
 * off to the standard create-payment experience without re-implementing it. The flow ships with
 * breadcrumb navigation and handles Fast ACH blockers and wire transfer requirements inline.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/payments/created` | Fired when a payment group is successfully created | The created `ContractorPaymentGroup` |
 * | `contractor/payments/exit` | Fired when the user completes the payment flow | `{ uuid?: string \| null }` |
 * | `payroll/wire/form/done` | Fired when wire transfer details are submitted | `{ wireInRequest: WireInRequest, confirmationAlert: { title: string, content?: string } }` |
 * | `breadcrumb/navigate` | Fired when the user clicks a breadcrumb to navigate back | `{ key: string, onNavigate: (ctx) => ctx }` |
 *
 * @components
 * - {@link CreatePayment}
 * - {@link PaymentSummary}
 *
 * @param props - See {@link CreatePaymentFlowProps}.
 * @returns The composed create-payment flow.
 * @alpha
 *
 * @example
 * ```tsx title="App.tsx"
 * import { ContractorManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <ContractorManagement.CreatePaymentFlow
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function CreatePaymentFlow(props: CreatePaymentFlowProps) {
  return <CreatePaymentInternalFlow {...props} />
}

/**
 * Flow-internal entry point for {@link CreatePaymentFlow} that additionally accepts
 * flow-injected `prefixBreadcrumbs`. Partners use {@link CreatePaymentFlow}; `PaymentFlow` renders
 * this directly to prepend its own breadcrumb trail.
 *
 * @internal
 */
export function CreatePaymentInternalFlow({
  companyId,
  onEvent,
  prefixBreadcrumbs = EMPTY_BREADCRUMBS,
}: CreatePaymentInternalFlowProps) {
  const createPaymentFlow = useMemo(() => {
    const baseBreadcrumbs = buildBreadcrumbs(createPaymentBreadcrumbsNodes)
    const displayOnlyPrefixes = prefixBreadcrumbs.map(({ onNavigate, ...rest }) => rest)
    const breadcrumbs = Object.fromEntries(
      Object.entries(baseBreadcrumbs).map(([stateKey, trail]) => [
        stateKey,
        [...displayOnlyPrefixes, ...trail],
      ]),
    )

    const initialBreadcrumbContext = updateBreadcrumbs('createPayment', {
      header: {
        type: 'breadcrumbs' as const,
        breadcrumbs,
      },
    })

    return createMachine(
      'createPayment',
      createPaymentMachine,
      (initialContext: CreatePaymentFlowContextInterface) => ({
        ...initialContext,
        ...initialBreadcrumbContext,
        component: CreatePaymentContextual,
        companyId,
      }),
    )
  }, [companyId, prefixBreadcrumbs])

  return <Flow machine={createPaymentFlow} onEvent={onEvent} />
}
