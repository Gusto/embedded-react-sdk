import { useTranslation } from 'react-i18next'
import { Dashboard, type DashboardTab } from './Dashboard'
import { ProfileEditForm } from '@/components/Contractor/Profile/management/ProfileEditForm'
import { AddressEditForm } from '@/components/Contractor/Address/management/AddressEditForm'
import { PaymentMethodEditForm } from '@/components/Contractor/PaymentMethod/management/PaymentMethodEditForm'
import { CompensationEditForm } from '@/components/Contractor/Compensation/management/CompensationEditForm'
import { BaseBoundaries } from '@/components/Base'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

/** @internal */
type DashboardSuccessAlert =
  | 'profileUpdated'
  | 'addressUpdated'
  | 'bankAccountAdded'
  | 'bankAccountRemoved'
  | 'compensationUpdated'

/** @internal */
export interface DashboardContextInterface extends FlowContextInterface {
  /** The associated contractor identifier. */
  contractorId: string
  /** Which success alert to surface above the dashboard cards, or `null` to clear it. */
  successAlert?: DashboardSuccessAlert | null
  /** Persists the active Dashboard tab across sub-flows so Cancel/Back
   *  returns to the originating tab instead of resetting to details. */
  selectedTab?: DashboardTab
}

/** @internal */
export function DashboardViewContextual() {
  return (
    <BaseBoundaries componentName="Contractor.Dashboard">
      <DashboardViewContextualRoot />
    </BaseBoundaries>
  )
}

function DashboardViewContextualRoot() {
  useI18n('Contractor.Dashboard')
  const { t } = useTranslation('Contractor.Dashboard')
  const { contractorId, onEvent, successAlert, selectedTab } = useFlow<DashboardContextInterface>()
  const Components = useComponentContext()

  const alertLabels: Record<DashboardSuccessAlert, string> = {
    profileUpdated: t('alerts.profileUpdated'),
    addressUpdated: t('alerts.addressUpdated'),
    bankAccountAdded: t('alerts.bankAccountAdded'),
    bankAccountRemoved: t('alerts.bankAccountRemoved'),
    compensationUpdated: t('alerts.compensationUpdated'),
  }

  return (
    <>
      {successAlert && (
        <Components.Alert
          status="success"
          label={alertLabels[successAlert]}
          onDismiss={() => {
            onEvent(componentEvents.CONTRACTOR_DASHBOARD_ALERT_DISMISSED, null)
          }}
          disableScrollIntoView
        />
      )}
      <Dashboard
        contractorId={ensureRequired(contractorId)}
        onEvent={onEvent}
        selectedTab={selectedTab}
      />
    </>
  )
}

/** @internal */
export function ProfileContextual() {
  const { contractorId, onEvent } = useFlow<DashboardContextInterface>()
  return <ProfileEditForm contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
}

/** @internal */
export function AddressContextual() {
  const { contractorId, onEvent } = useFlow<DashboardContextInterface>()
  return <AddressEditForm contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
}

/** @internal */
export function PaymentMethodEditFormContextual() {
  const { contractorId, onEvent } = useFlow<DashboardContextInterface>()
  return <PaymentMethodEditForm contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
}

/** @internal */
export function CompensationEditFormContextual() {
  const { contractorId, onEvent } = useFlow<DashboardContextInterface>()
  return <CompensationEditForm contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
}
