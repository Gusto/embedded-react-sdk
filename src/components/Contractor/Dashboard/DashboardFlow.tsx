import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { dashboardStateMachine } from './dashboardStateMachine'
import { type DashboardContextInterface, DashboardViewContextual } from './DashboardComponents'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'

/**
 * Props for {@link DashboardFlow}.
 *
 * @public
 */
export interface DashboardFlowProps extends BaseComponentInterface<never> {
  /** The associated contractor identifier. */
  contractorId: string
}

/**
 * Hub for viewing and managing a single contractor's details, pay, and documents.
 *
 * @remarks
 * Renders a tabbed view of a contractor (Details, Pay, Documents), wires the
 * card surfaces to their corresponding edit screens via an internal state
 * machine, and surfaces success alerts at the top of the dashboard after
 * each successful edit. Wraps the dashboard in error and suspense
 * boundaries.
 *
 * Every tab section of the dashboard is also exported as a self-contained
 * block that can be dropped into a custom layout without the surrounding
 * dashboard chrome (see the blocks below). Each block wraps its read-only
 * card, its edit form, and the card↔form transitions as a single drop-in.
 * For cases where that built-in orchestration doesn't fit — rendering a
 * form in a modal, driving navigation via a router, or showing a card
 * read-only — each block's card and form are also exported individually
 * (e.g. {@link CompensationCard}, {@link CompensationEditForm}). Using the
 * individual pieces means owning the swap, any success alerts, and
 * cross-component state yourself.
 *
 * The dashboard composes self-fetching cards and their edit forms and
 * forwards every event they emit to the partner via `onEvent`; its internal
 * state machine also reacts to a subset of these events to swap between the
 * cards and edit screens and to surface success alerts. The table below is
 * the complete, current set of events observable from `DashboardFlow`,
 * grouped by the tab that emits them.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/management/profile/editRequested` | Fired when "Edit" is clicked on the Profile card | `{ contractorId: string }` |
 * | `contractor/management/profile/updated` | Fired after the profile edit form is saved; the dashboard returns to the cards and surfaces the "Profile updated" alert | Updated `Contractor` entity |
 * | `contractor/management/profile/editCancelled` | Fired when the user clicks Cancel on the profile edit form; the dashboard returns to the cards | — |
 * | `contractor/management/address/editRequested` | Fired when "Edit" is clicked on the Address card | `{ contractorId: string }` |
 * | `contractor/management/address/updated` | Fired after the address edit form is saved; the dashboard returns to the cards and surfaces the "Address updated" alert | Updated `ContractorAddress` entity |
 * | `contractor/management/address/editCancelled` | Fired when the user clicks Cancel on the address edit form; the dashboard returns to the cards | — |
 * | `contractor/management/paymentMethod/card/addRequested` | Fired when "Add bank account" is clicked on the Payment card | `{ contractorId: string }` |
 * | `contractor/management/paymentMethod/card/editRequested` | Fired when "Edit" is chosen from the bank account row menu | `{ contractorId: string }` |
 * | `contractor/management/paymentMethod/card/removed` | Fired after the bank account is removed from the card; the dashboard surfaces the "Bank account removed" alert | Updated `ContractorPaymentMethod` entity |
 * | `contractor/management/paymentMethod/bankForm/submitted` | Fired after the bank-account form is saved; the dashboard returns to the cards and surfaces the "Bank account added" alert | Created `ContractorBankAccount` entity |
 * | `contractor/management/paymentMethod/bankForm/cancelled` | Fired when the user cancels the bank-account form; the dashboard returns to the cards | — |
 * | `contractor/management/compensation/editRequested` | Fired when "Edit" is clicked on the Compensation card | `{ contractorId: string }` |
 * | `contractor/management/compensation/updated` | Fired after compensation is saved; the dashboard returns to the cards and surfaces the "Compensation updated" alert | Updated `Contractor` entity |
 * | `contractor/management/compensation/editCancelled` | Fired when the user cancels editing compensation; the dashboard returns to the cards | — |
 * | `contractor/management/documents/card/viewRequested` | Fired when a document row's "View" button is clicked, before the PDF is fetched | `{ contractorId: string, documentUuid: string }` |
 * | `contractor/management/documents/card/viewed` | Fired after the PDF is fetched and opened in a new tab | `{ contractorId: string, documentUuid: string }` |
 * | `contractor/dashboard/tabChange` | Fired when the user switches dashboard tabs | `{ tab: 'details' \| 'pay' \| 'documents' }` |
 * | `contractor/dashboard/alertDismissed` | Fired when the user dismisses a top-of-dashboard success alert | — |
 *
 * @components
 * - {@link Dashboard}
 * - {@link ProfileEditForm}
 * - {@link AddressEditForm}
 * - {@link PaymentMethodEditForm}
 * - {@link CompensationEditForm}
 * - {@link DocumentsCard}
 *
 * @param props - See {@link DashboardFlowProps}.
 * @returns The tabbed dashboard with internal navigation between cards and edit screens.
 * @public
 * @group Flow components
 *
 * @example
 * ```tsx title="App.tsx"
 * import { ContractorManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <ContractorManagement.DashboardFlow
 *       contractorId="4b3f930f-82cd-48a8-b797-798686e12e5e"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export const DashboardFlow = ({ contractorId, onEvent }: DashboardFlowProps) => {
  const dashboardMachine = useMemo(
    () =>
      createMachine(
        'index',
        dashboardStateMachine,
        (initialContext: DashboardContextInterface) => ({
          ...initialContext,
          component: DashboardViewContextual,
          contractorId,
        }),
      ),
    [contractorId],
  )

  return <Flow machine={dashboardMachine} onEvent={onEvent} />
}
