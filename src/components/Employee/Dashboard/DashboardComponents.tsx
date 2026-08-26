import { useTranslation } from 'react-i18next'
import { Dashboard, type DashboardTab } from './Dashboard'
import { HomeAddressEditForm } from '@/components/Employee/HomeAddress/management/HomeAddressEditForm'
import { WorkAddressEditForm } from '@/components/Employee/WorkAddress/management/WorkAddressEditForm'
import { FederalTaxesEditForm } from '@/components/Employee/FederalTaxes/management/FederalTaxesEditForm'
import { StateTaxesEditForm } from '@/components/Employee/StateTaxes/management/StateTaxesEditForm'
import { ProfileEditForm } from '@/components/Employee/Profile/management/ProfileEditForm'
import { PaymentMethodBankForm } from '@/components/Employee/PaymentMethod/management/PaymentMethodBankForm'
import { PaymentMethodSplitForm } from '@/components/Employee/PaymentMethod/management/PaymentMethodSplitForm'
import { DocumentManager } from '@/components/Employee/Documents/management/DocumentManager'
import { DeductionsEditForm } from '@/components/Employee/Deductions/management/DeductionsEditForm'
import { CompensationEditForm } from '@/components/Employee/Compensation/management/CompensationEditForm/CompensationEditForm'
import { CompensationAddAnotherJobForm } from '@/components/Employee/Compensation/management/CompensationAddAnotherJobForm/CompensationAddAnotherJobForm'
import { CompensationAddJobForm } from '@/components/Employee/Compensation/management/CompensationAddJobForm/CompensationAddJobForm'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

/** @internal */
type DashboardSuccessAlert =
  | 'bankAccountAdded'
  | 'bankAccountDeleted'
  | 'splitUpdated'
  | 'deductionAdded'
  | 'deductionUpdated'
  | 'deductionDeleted'
  | 'jobAdded'
  | 'profileUpdated'
  | 'federalTaxesUpdated'
  | 'stateTaxesUpdated'

/** @internal */
export interface DashboardContextInterface extends FlowContextInterface {
  /** The associated employee identifier. */
  employeeId: string
  /** Form identifier set when the state machine transitions to the document viewer. */
  formId?: string
  /** Job identifier set when the state machine transitions to the edit-compensation screen. */
  currentJobId?: string | null
  /** Which success alert to surface above the dashboard cards, or `null` to clear it. */
  successAlert?: DashboardSuccessAlert | null
  /** Set by the EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED transition;
   *  consumed by `DeductionsEditFormContextual` to pre-populate the form. */
  editingDeductionId?: string
  /** Persists the active Dashboard tab across sub-flows so Cancel/Back
   *  returns to the originating tab instead of resetting to basic details. */
  selectedTab?: DashboardTab
}

/** @internal */
export function DashboardViewContextual() {
  useI18n('Employee.Dashboard')
  const { t } = useTranslation('Employee.Dashboard')
  const { employeeId, onEvent, successAlert, selectedTab } = useFlow<DashboardContextInterface>()
  const Components = useComponentContext()

  const alertLabels: Record<DashboardSuccessAlert, string> = {
    bankAccountAdded: t('alerts.bankAccountAdded'),
    bankAccountDeleted: t('alerts.bankAccountDeleted'),
    splitUpdated: t('alerts.splitUpdated'),
    deductionAdded: t('alerts.deductionAdded'),
    deductionUpdated: t('alerts.deductionUpdated'),
    deductionDeleted: t('alerts.deductionDeleted'),
    jobAdded: t('alerts.jobAdded'),
    profileUpdated: t('alerts.profileUpdated'),
    federalTaxesUpdated: t('alerts.federalTaxesUpdated'),
    stateTaxesUpdated: t('alerts.stateTaxesUpdated'),
  }

  return (
    <>
      {successAlert && (
        <Components.Alert
          status="success"
          label={alertLabels[successAlert]}
          onDismiss={() => {
            onEvent(componentEvents.EMPLOYEE_DISMISS, null)
          }}
          disableScrollIntoView
        />
      )}
      <Dashboard
        employeeId={ensureRequired(employeeId)}
        onEvent={onEvent}
        selectedTab={selectedTab}
      />
    </>
  )
}

/** @internal */
export function HomeAddressContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <HomeAddressEditForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

/** @internal */
export function WorkAddressContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <WorkAddressEditForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

/** @internal */
export function FederalTaxesContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <FederalTaxesEditForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

/** @internal */
export function StateTaxesContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <StateTaxesEditForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

/** @internal */
export function ProfileContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <ProfileEditForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

/** @internal */
export function PaymentBankFormContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <PaymentMethodBankForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

/** @internal */
export function PaymentSplitViewContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <PaymentMethodSplitForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

/** @internal */
export function DocumentManagerContextual() {
  const { employeeId, formId, onEvent } = useFlow<DashboardContextInterface>()
  return (
    <DocumentManager
      employeeId={ensureRequired(employeeId)}
      formId={ensureRequired(formId)}
      onEvent={onEvent}
    />
  )
}

/** @internal */
export function DeductionsEditFormContextual() {
  const { employeeId, editingDeductionId, onEvent } = useFlow<DashboardContextInterface>()
  return (
    <DeductionsEditForm
      employeeId={ensureRequired(employeeId)}
      editingDeductionId={editingDeductionId}
      onEvent={onEvent}
    />
  )
}

/** @internal */
export function AddJobContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <CompensationAddJobForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

/** @internal */
export function EditCompensationContextual() {
  const { employeeId, currentJobId, onEvent } = useFlow<DashboardContextInterface>()
  return (
    <CompensationEditForm
      employeeId={ensureRequired(employeeId)}
      jobId={ensureRequired(currentJobId ?? undefined)}
      onEvent={onEvent}
    />
  )
}

/** @internal */
export function AddAnotherJobContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <CompensationAddAnotherJobForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}
