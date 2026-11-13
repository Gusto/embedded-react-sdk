import { useTranslation } from 'react-i18next'
import { Dashboard, type DashboardTab } from './Dashboard'
import { useViewerSignatoryId } from './ViewerSignatoryContext'
import { Industry } from '@/components/Company/Industry'
import { Locations } from '@/components/Company/Locations/Locations'
import { FederalTaxes } from '@/components/Company/FederalTaxes'
import { BankAccount } from '@/components/Company/BankAccount/BankAccount'
import { PaySchedule } from '@/components/Company/PaySchedule/management'
import { StateTaxes } from '@/components/Company/StateTaxes/management'
import { TaxPaymentsFlow } from '@/components/Company/TaxPayments'
import { AssignSignatory } from '@/components/Company/AssignSignatory'
import { ViewerBoundDocumentSigner } from '@/components/Company/DocumentSigner/DocumentSigner'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

/** @internal */
type DashboardSuccessAlert =
  | 'industryUpdated'
  | 'federalTaxesUpdated'
  | 'locationsUpdated'
  | 'bankAccountUpdated'
  | 'stateTaxesUpdated'
  | 'signatoryUpdated'
  | 'formsSigned'

/** @internal */
export interface DashboardContextInterface extends FlowContextInterface {
  /** The associated company identifier. */
  companyId: string
  /** Which success alert to surface above the dashboard cards, or `null` to clear it. */
  successAlert?: DashboardSuccessAlert | null
  /**
   * Alert to surface once the user leaves the current spoke. Spokes whose saves
   * happen mid-flow — `Locations`, where a company usually adds several addresses
   * in one visit, or `BankAccount`, where adding an account and verifying its
   * micro-deposits are separate steps — record the alert here instead of returning
   * to the dashboard on each save, since transitioning would eject the user from
   * the spoke.
   */
  pendingAlert?: DashboardSuccessAlert | null
  /** Persists the active Dashboard tab across spokes so Back returns to the
   *  originating tab instead of resetting to company details. */
  selectedTab?: DashboardTab
  /**
   * Identifier of the company's current signatory, recorded when the Signatory
   * card requests an edit. `AssignSignatory` needs it to amend that record:
   * without one its create form treats the submit as a fresh assignment and
   * deletes the existing signatory before creating a replacement.
   */
  signatoryId?: string
  /** Forwarded to the pay schedule spoke to show the AutoPilot row and its Edit action. */
  enableAutoPilot?: boolean
  /** Forwarded to the pay schedule spoke to show its Manage action. */
  enableMultipleSchedules?: boolean
}

/** @internal */
export function DashboardViewContextual() {
  useI18n('Company.Dashboard')
  const { t } = useTranslation('Company.Dashboard')
  const { companyId, onEvent, successAlert, selectedTab } = useFlow<DashboardContextInterface>()
  const Components = useComponentContext()

  const alertLabels: Record<DashboardSuccessAlert, string> = {
    industryUpdated: t('alerts.industryUpdated'),
    federalTaxesUpdated: t('alerts.federalTaxesUpdated'),
    locationsUpdated: t('alerts.locationsUpdated'),
    bankAccountUpdated: t('alerts.bankAccountUpdated'),
    stateTaxesUpdated: t('alerts.stateTaxesUpdated'),
    signatoryUpdated: t('alerts.signatoryUpdated'),
    formsSigned: t('alerts.formsSigned'),
  }

  return (
    <>
      {successAlert && (
        <Components.Alert
          status="success"
          label={alertLabels[successAlert]}
          onDismiss={() => {
            onEvent(componentEvents.COMPANY_DASHBOARD_ALERT_DISMISSED, null)
          }}
          disableScrollIntoView
        />
      )}
      <Dashboard
        companyId={ensureRequired(companyId)}
        onEvent={onEvent}
        selectedTab={selectedTab}
      />
    </>
  )
}

/** @internal */
export function IndustryContextual() {
  const { companyId, onEvent } = useFlow<DashboardContextInterface>()
  return <Industry companyId={ensureRequired(companyId)} onEvent={onEvent} />
}

/** @internal */
export function LocationsContextual() {
  const { companyId, onEvent } = useFlow<DashboardContextInterface>()
  return <Locations companyId={ensureRequired(companyId)} onEvent={onEvent} />
}

/** @internal */
export function FederalTaxesContextual() {
  const { companyId, onEvent } = useFlow<DashboardContextInterface>()
  return <FederalTaxes companyId={ensureRequired(companyId)} onEvent={onEvent} />
}

/** @internal */
export function BankAccountContextual() {
  const { companyId, onEvent } = useFlow<DashboardContextInterface>()
  return <BankAccount companyId={ensureRequired(companyId)} onEvent={onEvent} />
}

/** @internal */
export function PayScheduleContextual() {
  const { companyId, onEvent, enableAutoPilot, enableMultipleSchedules } =
    useFlow<DashboardContextInterface>()
  return (
    <PaySchedule
      companyId={ensureRequired(companyId)}
      onEvent={onEvent}
      enableAutoPilot={enableAutoPilot}
      enableMultipleSchedules={enableMultipleSchedules}
    />
  )
}

/** @internal */
export function StateTaxesContextual() {
  const { companyId, onEvent } = useFlow<DashboardContextInterface>()
  return <StateTaxes companyId={ensureRequired(companyId)} onEvent={onEvent} />
}

/** @internal */
export function TaxPaymentsContextual() {
  const { companyId, onEvent } = useFlow<DashboardContextInterface>()
  return <TaxPaymentsFlow companyId={ensureRequired(companyId)} onEvent={onEvent} />
}

/**
 * Keyed on the viewer because `DocumentSigner` reads `signatoryId` only when it mounts.
 *
 * @internal
 */
export function CompanyFormsContextual() {
  const { companyId, onEvent } = useFlow<DashboardContextInterface>()
  const viewerSignatoryId = useViewerSignatoryId()
  return (
    <ViewerBoundDocumentSigner
      key={viewerSignatoryId}
      companyId={ensureRequired(companyId)}
      signatoryId={viewerSignatoryId}
      onEvent={onEvent}
    />
  )
}

/** @internal */
export function AssignSignatoryContextual() {
  const { companyId, signatoryId, onEvent } = useFlow<DashboardContextInterface>()
  return (
    <AssignSignatory
      companyId={ensureRequired(companyId)}
      signatoryId={signatoryId}
      onEvent={onEvent}
    />
  )
}
