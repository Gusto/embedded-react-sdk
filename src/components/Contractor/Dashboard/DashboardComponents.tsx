import { Dashboard, type DashboardTab, type DashboardSuccessAlert } from './Dashboard'
import { ProfileEditForm } from '@/components/Contractor/Profile/management/ProfileEditForm'
import { AddressEditForm } from '@/components/Contractor/Address/management/AddressEditForm'
import { PaymentMethodEditForm } from '@/components/Contractor/PaymentMethod/management/PaymentMethodEditForm'
import { CompensationEditForm } from '@/components/Contractor/Compensation/management/CompensationEditForm'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

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
  const { contractorId, onEvent, successAlert, selectedTab } = useFlow<DashboardContextInterface>()

  return (
    <Dashboard
      contractorId={ensureRequired(contractorId)}
      onEvent={onEvent}
      selectedTab={selectedTab}
      successAlert={successAlert ?? undefined}
    />
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
