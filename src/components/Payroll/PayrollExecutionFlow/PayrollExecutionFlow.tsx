import { useMemo } from 'react'
import { createMachine } from 'robot3'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import type { ConfirmWireDetailsComponentType } from '../ConfirmWireDetails/ConfirmWireDetails'
import {
  PayrollConfigurationContextual,
  PayrollOverviewContextual,
  SaveAndExitCta,
  type PayrollFlowContextInterface,
} from '../PayrollFlow/PayrollFlowComponents'
import {
  payrollExecutionMachine,
  getPayrollExecutionBreadcrumbsNodes,
} from './payrollExecutionMachine'
import { Flow } from '@/components/Flow/Flow'
import type { FlowBreadcrumb } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { buildBreadcrumbs, updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'

const EMPTY_BREADCRUMBS: FlowBreadcrumb[] = []

/**
 * Entry point for {@link PayrollExecutionFlow}. Determines which screen the flow renders first.
 *
 * @public
 */
export type PayrollExecutionInitialState = 'configuration' | 'overview'

/**
 * Props for {@link PayrollExecutionFlow}.
 *
 * @public
 */
export interface PayrollExecutionFlowProps {
  /** The associated company identifier. */
  companyId: string
  /**
   * The identifier of the payroll to execute. The payroll must already exist (e.g. created by a
   * prior creation step or by the standard `PayrollFlow` selection).
   */
  payrollId: string
  /** Event handler that receives the `RUN_PAYROLL_*` events emitted during the flow. */
  onEvent: OnEventType<EventType, unknown>
  /** Optional pay period metadata used to seed breadcrumb labels and date context. */
  initialPayPeriod?: PayrollPayPeriodType
  /**
   * When true, surfaces dismissal-specific copy and breadcrumbs (used by `Payroll.DismissalFlow`).
   * Defaults to `false`.
   */
  isDismissalPayroll?: boolean
  /** Optional flag to show or hide reimbursement fields throughout the flow. Defaults to `true`. */
  withReimbursements?: boolean
  /** Optional custom component to replace the default wire details confirmation UI. */
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
  /**
   * Optional breadcrumbs prepended to the flow's own breadcrumb trail. Useful when embedding inside
   * a parent flow (e.g. an off-cycle creation step) so the breadcrumb history remains coherent.
   */
  prefixBreadcrumbs?: FlowBreadcrumb[]
  /**
   * Where the flow starts. Use `'overview'` when you want to drop the user directly on the review
   * screen (e.g. resuming an already-calculated payroll). Defaults to `'configuration'`.
   */
  initialState?: PayrollExecutionInitialState
}

const INITIAL_COMPONENT_MAP = {
  configuration: PayrollConfigurationContextual,
  overview: PayrollOverviewContextual,
} as const

const INITIAL_NAMESPACE_MAP = {
  configuration: 'Payroll.PayrollConfiguration' as const,
  overview: 'Payroll.PayrollOverview' as const,
} as const

/**
 * Guided flow to configure, review, and submit a single payroll.
 *
 * @remarks
 * This is the inner flow that powers the back half of `Payroll.PayrollFlow`, and it is also reused
 * by the off-cycle, dismissal, and transition flows after they have created their respective
 * payrolls. Render it directly when you have built your own payroll-creation step and want to hand
 * the user off to the standard execution experience without re-implementing it. The flow ships
 * with breadcrumb navigation and the standard wire-confirmation UX.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `runPayroll/edit` | Fired when user chooses to edit payroll | — |
 * | `runPayroll/calculated` | Fired when payroll calculation completes | `{ payrollUuid, payPeriod?, alert? }` |
 * | `runPayroll/employee/edit` | Fired when user opens an employee row to edit | `{ employeeId, firstName, lastName }` |
 * | `runPayroll/employee/saved` | Fired when employee edits are saved | — |
 * | `runPayroll/employee/cancelled` | Fired when employee edits are cancelled | — |
 * | `runPayroll/submitting` | Fired when payroll submission begins | — |
 * | `runPayroll/submitted` | Fired when payroll is successfully submitted | Response from the Submit payroll endpoint |
 * | `runPayroll/processed` | Fired when payroll processing is completed | — |
 * | `runPayroll/processingFailed` | Fired when payroll processing fails | Error details |
 * | `runPayroll/cancelled` | Fired when a payroll is cancelled | Response from the Cancel payroll endpoint |
 * | `runPayroll/receipt/get` | Fired when user requests payroll receipt | `{ payrollId }` |
 * | `runPayroll/receipt/viewed` | Fired when the receipt screen is viewed | — |
 * | `runPayroll/pdfPaystub/viewed` | Fired when user views employee paystub PDF | `{ employeeId }` |
 * | `runPayroll/blockers/viewAll` | Fired when user opens the full blockers list | — |
 * | `payroll/saveAndExit` | Fired when user uses the save-and-exit CTA | — |
 *
 * @components
 * - {@link PayrollConfiguration}
 * - {@link PayrollOverview}
 * - {@link PayrollEditEmployee}
 * - {@link PayrollReceipts}
 * - {@link PayrollBlockerList}
 *
 * @param input - {@link PayrollExecutionFlowProps}
 * @returns The rendered execution flow.
 * @public
 *
 * @example
 * ```tsx title="App.tsx"
 * import { Payroll, type EventType } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <Payroll.PayrollExecutionFlow
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       payrollId="0987fcea-7b59-4907-a301-f232b5aff508"
 *       onEvent={(eventType: EventType) => {
 *         if (eventType === 'runPayroll/submitted') {
 *           // Payroll submitted — navigate to your next screen
 *         }
 *       }}
 *     />
 *   )
 * }
 * ```
 */
export function PayrollExecutionFlow({
  companyId,
  payrollId,
  onEvent,
  initialPayPeriod,
  isDismissalPayroll: isDismissal = false,
  withReimbursements = true,
  ConfirmWireDetailsComponent,
  prefixBreadcrumbs = EMPTY_BREADCRUMBS,
  initialState = 'configuration',
}: PayrollExecutionFlowProps) {
  const executionFlowMachine = useMemo(() => {
    const breadcrumbNodes = getPayrollExecutionBreadcrumbsNodes(isDismissal)
    const baseBreadcrumbs = buildBreadcrumbs(breadcrumbNodes)
    const displayOnlyPrefixes = prefixBreadcrumbs.map(({ onNavigate, ...rest }) => rest)
    const breadcrumbs = Object.fromEntries(
      Object.entries(baseBreadcrumbs).map(([stateKey, trail]) => [
        stateKey,
        [...displayOnlyPrefixes, ...trail],
      ]),
    )

    const initialBreadcrumbContext = updateBreadcrumbs(
      initialState,
      {
        header: {
          type: 'breadcrumbs' as const,
          breadcrumbs,
          cta: SaveAndExitCta,
        },
      },
      {
        startDate: initialPayPeriod?.startDate ?? '',
        endDate: initialPayPeriod?.endDate ?? '',
      },
    )

    return createMachine(
      initialState,
      payrollExecutionMachine,
      (initialContext: PayrollFlowContextInterface) => ({
        ...initialContext,
        ...initialBreadcrumbContext,
        component: INITIAL_COMPONENT_MAP[initialState],
        companyId,
        payrollUuid: payrollId,
        payPeriod: initialPayPeriod,
        withReimbursements,
        ConfirmWireDetailsComponent,
        ctaConfig: {
          labelKey: 'exitFlowCta',
          namespace: INITIAL_NAMESPACE_MAP[initialState],
        },
      }),
    )
  }, [
    companyId,
    payrollId,
    isDismissal,
    withReimbursements,
    ConfirmWireDetailsComponent,
    prefixBreadcrumbs,
    initialState,
  ])

  return <Flow machine={executionFlowMachine} onEvent={onEvent} />
}
