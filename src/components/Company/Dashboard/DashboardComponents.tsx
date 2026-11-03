import { useTranslation } from 'react-i18next'
import { Dashboard, type DashboardTab } from './Dashboard'
import { Industry } from '@/components/Company/Industry'
import { Locations } from '@/components/Company/Locations/Locations'
import { FederalTaxes } from '@/components/Company/FederalTaxes'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

/** @internal */
type DashboardSuccessAlert = 'industryUpdated' | 'federalTaxesUpdated'

/** @internal */
export interface DashboardContextInterface extends FlowContextInterface {
  /** The associated company identifier. */
  companyId: string
  /** Which success alert to surface above the dashboard cards, or `null` to clear it. */
  successAlert?: DashboardSuccessAlert | null
  /** Persists the active Dashboard tab across spokes so Back returns to the
   *  originating tab instead of resetting to company details. */
  selectedTab?: DashboardTab
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
