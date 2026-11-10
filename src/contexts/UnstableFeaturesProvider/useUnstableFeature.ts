import { createContext, useContext } from 'react'

/**
 * Opt-in flags for SDK functionality that is still in active development.
 *
 * @remarks
 * Pass to {@link GustoProvider} via the `unstableFeatures` prop to enable a feature ahead of its
 * public release. Every flag defaults to disabled when omitted. When a feature graduates to
 * public release, its flag is deleted from this interface — there is no deprecation step. The
 * conditional checks that read it are deleted too, or moved to a {@link Features} flag when the
 * released feature still needs a way to turn it off. This interface may have no flags at all
 * at any given time — e.g. immediately after the last active flag graduates and before the next
 * one is added — the opt-in mechanism itself is permanent even when nothing is currently gated
 * behind it.
 *
 * @alpha
 */
export interface UnstableFeatures {
  /**
   * Recording contractor payments that were made outside of Gusto.
   *
   * When `true`, `ContractorManagement.PaymentsList` (and `ContractorManagement.PaymentFlow`, which
   * renders it) shows a "Record a historical payment" call to action that opens the historical
   * payment flow. `ContractorManagement.HistoricalPaymentFlow`,
   * `ContractorManagement.CreateHistoricalPayment`, and
   * `ContractorManagement.HistoricalPaymentSummary` can be mounted.
   *
   * When `false`, the call to action is hidden and those three components throw when mounted.
   *
   * @defaultValue `false`
   */
  historicalPayments?: boolean
  /**
   * Reviewing a single contractor's payment history.
   *
   * When `true`, `ContractorManagement.PaymentsCard` can be mounted, and the contractor
   * dashboard's Pay tab shows a "Recent payments" card.
   *
   * When `false`, the card is hidden on the Pay tab and throws when mounted directly. Gated
   * because the underlying endpoint reports a cancelled payment's status as `Funded` or
   * `Unfunded` with no field distinguishing it, so a cancelled payment can be shown as paid.
   *
   * @defaultValue `false`
   */
  contractorPaymentHistory?: boolean
  /**
   * Managing pay schedules and their employee assignments after onboarding.
   *
   * When `true`, `CompanyManagement.PaySchedule` and `CompanyManagement.PayScheduleAssignment` can
   * be mounted.
   *
   * When `false`, both components throw when mounted. `CompanyOnboarding.PaySchedule` is not
   * affected.
   *
   * @defaultValue `false`
   */
  managePaySchedules?: boolean
  /**
   * Reviewing a company's tax payments and their liabilities.
   *
   * When `true`, `CompanyManagement.TaxPaymentsFlow`, `CompanyManagement.TaxPaymentsList`, and
   * `CompanyManagement.TaxPaymentDetail` can be mounted.
   *
   * When `false`, all three components throw when mounted.
   *
   * @defaultValue `false`
   */
  taxPayments?: boolean
  /**
   * The centralized company settings dashboard.
   *
   * When `true`, `CompanyManagement.Dashboard` and `CompanyManagement.DashboardFlow` can be
   * mounted, along with the section cards they compose: `CompanyManagement.IndustryCard`,
   * `CompanyManagement.LocationsCard`, `CompanyManagement.FederalTaxesCard`,
   * `CompanyManagement.BankAccountCard`, `CompanyManagement.PaySchedulesCard` and
   * `CompanyManagement.StateTaxesCard`. The Pay schedules card additionally requires
   * `managePaySchedules` and is omitted from the dashboard when that flag is off; every other
   * card renders regardless.
   *
   * When `false`, each of them throws when mounted. The individual company components the
   * dashboard routes to, such as `CompanyOnboarding.Industry` and `CompanyOnboarding.Locations`,
   * are not affected.
   *
   * @defaultValue `false`
   */
  companySettingsDashboard?: boolean
}

/**
 * React context backing {@link useUnstableFeature}.
 *
 * @internal
 */
export const UnstableFeaturesContext = createContext<UnstableFeatures>({})

/**
 * Reads whether `feature` is enabled via {@link GustoProvider}'s `unstableFeatures` prop.
 *
 * @remarks
 * With `throwIfDisabled: true`, call unconditionally at the top of an alpha component's body —
 * not inside {@link WithUnstableFeature} — so mounting the component without opting in fails
 * loudly and immediately. This throws in every environment, including production: using an alpha
 * component without its flag is an integration mistake, not a runtime state, the same as
 * {@link useComponentContext} throwing when called outside a `ComponentsProvider`.
 *
 * @param feature - The {@link UnstableFeatures} flag to read.
 * @param options - Set `throwIfDisabled` to throw instead of returning `false` when `feature` is disabled.
 * @throws When `options.throwIfDisabled` is set and `feature` is not enabled.
 * @internal
 */
export const useUnstableFeature = (
  feature: keyof UnstableFeatures,
  options: { throwIfDisabled?: boolean } = { throwIfDisabled: false },
): boolean => {
  const features = useContext(UnstableFeaturesContext)
  const isEnabled = !!features[feature]

  if (options.throwIfDisabled && !isEnabled) {
    throw new Error(
      `This component requires the unstable feature flag "${feature}" to be enabled via GustoProvider's \`unstableFeatures\` prop.`,
    )
  }

  return isEnabled
}
