import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { dashboardStateMachine } from './dashboardStateMachine'
import { type DashboardContextInterface, DashboardViewContextual } from './DashboardComponents'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'

/**
 * Props for {@link DashboardFlow}.
 *
 * @alpha
 */
export interface DashboardFlowProps extends BaseComponentInterface<never> {
  /** The associated company identifier. */
  companyId: string
}

/**
 * Hub for viewing and managing a company's settings.
 *
 * @remarks
 * Renders a tabbed view of a company's settings (Company details, Pay, Taxes), wires each card's
 * Edit or Manage CTA to the matching company component, and surfaces success alerts at the top of
 * the dashboard after a successful edit. Wraps the dashboard in error and suspense boundaries.
 *
 * This is a hub-and-spoke surface with no terminal step, so it can stay mounted indefinitely. Each
 * spoke renders an existing company component — `CompanyOnboarding.Industry`,
 * `CompanyOnboarding.Locations`, `CompanyOnboarding.FederalTaxes`, `CompanyOnboarding.BankAccount` —
 * beneath a "Back to company
 * settings" header, which is the reliable way back: those components are submit-only or open
 * directly into a form, and their own Cancel affordances belong to screens inside them.
 *
 * Every card and tab section is also exported as a self-contained block that can be dropped into a
 * custom layout without the surrounding dashboard chrome (see the components below). Using the
 * individual cards means owning the card-to-edit-screen swap, any success alerts, and
 * cross-component state yourself.
 *
 * Requires the `companySettingsDashboard` unstable feature flag; mounting it without the flag
 * throws.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/management/industry/editRequested` | Fired when "Edit" is clicked on the Industry card | `{ companyId: string }` |
 * | `company/industry/selected` | Fired after an industry is saved; the dashboard returns to the cards and surfaces the "Industry updated" alert | The updated `industry` |
 * | `company/management/locations/editRequested` | Fired when "Manage" is clicked on the Locations card | `{ companyId: string }` |
 * | `company/location/add` | Fired when "Add location" is clicked on the manage screen; the manage screen stays open | — |
 * | `company/location/add/done` | Fired after a new location is created; the manage screen stays open | Created `Location` entity |
 * | `company/location/edit` | Fired when a location's "Edit" menu item is chosen; the manage screen stays open | — |
 * | `company/location/edit/done` | Fired after a location is updated; the manage screen stays open | Updated `Location` entity |
 * | `company/location/done` | Fired when Continue is clicked on the manage screen; the dashboard returns to the cards | — |
 * | `company/management/bankAccount/editRequested` | Fired when "Manage" or "Add bank account" is clicked on the Bank account card | `{ companyId: string }` |
 * | `company/bankAccount/change` | Fired when "Change bank account" is clicked on the manage screen; the manage screen stays open | — |
 * | `company/bankAccount/created` | Fired after a bank account is created; the manage screen stays open | Created `CompanyBankAccount` entity |
 * | `company/bankAccount/verify` | Fired when "Verify bank account" is clicked; the manage screen stays open | The `CompanyBankAccount` being verified |
 * | `company/bankAccount/verified` | Fired after micro-deposits are verified; the manage screen stays open | Verified `CompanyBankAccount` entity |
 * | `company/bankAccount/done` | Fired when Continue is clicked on the manage screen; the dashboard returns to the cards and surfaces the "Bank account updated" alert | — |
 * | `company/management/federalTaxes/editRequested` | Fired when "Edit" is clicked on the Federal taxes card | `{ companyId: string }` |
 * | `company/federalTaxes/updated` | Fired after a federal-taxes save succeeds, immediately before `company/federalTaxes/done` | Updated `FederalTaxDetails` entity |
 * | `company/federalTaxes/done` | Fired after a federal-taxes save succeeds; the dashboard returns to the cards and surfaces the "Federal tax settings updated" alert | — |
 * | `company/dashboard/tabChange` | Fired when the user switches dashboard tabs | `{ tab: 'companyDetails' \| 'pay' \| 'taxes' }` |
 * | `company/dashboard/back` | Fired when the user clicks "Back to company settings" on a spoke; the dashboard returns to the cards | — |
 * | `company/dashboard/alertDismissed` | Fired when the user dismisses a top-of-dashboard success alert | — |
 *
 * @components
 * - {@link Dashboard}
 * - {@link IndustryCard}
 * - {@link LocationsCard}
 * - {@link BankAccountCard}
 * - {@link FederalTaxesCard}
 *
 * @param props - See {@link DashboardFlowProps}.
 * @returns The tabbed dashboard with internal navigation between cards and edit screens.
 * @alpha
 * @group Flow components
 *
 * @example
 * ```tsx title="App.tsx"
 * import { CompanyManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <CompanyManagement.DashboardFlow
 *       companyId="4b3f930f-82cd-48a8-b797-798686e12e5e"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export const DashboardFlow = ({ companyId, onEvent }: DashboardFlowProps) => {
  useUnstableFeature('companySettingsDashboard', { throwIfDisabled: true })

  const dashboardMachine = useMemo(
    () =>
      createMachine(
        'index',
        dashboardStateMachine,
        (initialContext: DashboardContextInterface) => ({
          ...initialContext,
          component: DashboardViewContextual,
          companyId,
        }),
      ),
    [companyId],
  )

  return <Flow machine={dashboardMachine} onEvent={onEvent} />
}
