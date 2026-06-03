import { useTranslation } from 'react-i18next'
import type { Job } from '@gusto/embedded-api-v-2025-11-15/models/components/job'
import { Dashboard, type DashboardTab } from './Dashboard'
import { getPendingCompensationChanges } from './getPendingCompensationChanges'
import { HomeAddressEditForm } from '@/components/Employee/HomeAddress/management/HomeAddressEditForm'
import { WorkAddressEditForm } from '@/components/Employee/WorkAddress/management/WorkAddressEditForm'
import { FederalTaxes } from '@/components/Employee/FederalTaxes/management/FederalTaxes'
import { StateTaxes } from '@/components/Employee/StateTaxes/management/StateTaxes'
import { ProfileEditForm } from '@/components/Employee/Profile/management/ProfileEditForm'
import { PaymentMethodBankForm } from '@/components/Employee/PaymentMethod/management/PaymentMethodBankForm'
import { PaymentMethodSplitForm } from '@/components/Employee/PaymentMethod/management/PaymentMethodSplitForm'
import { DocumentManager } from '@/components/Employee/Documents/management/DocumentManager'
import { DeductionsEditForm } from '@/components/Employee/Deductions/management/DeductionsEditForm'
import {
  ManagementEditCompensation,
  ManagementEditPendingCompensation,
} from '@/components/Employee/Compensation/management'
import { AddAnotherJob } from '@/components/Employee/Compensation/management/AddAnotherJob/AddAnotherJob'
import { EditCompensation } from '@/components/Employee/Compensation/onboarding/EditCompensation/EditCompensation'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

export type DashboardSuccessAlert =
  | 'bankAccountAdded'
  | 'bankAccountDeleted'
  | 'splitUpdated'
  | 'deductionAdded'
  | 'deductionUpdated'
  | 'deductionDeleted'
  | 'jobAdded'
  | 'profileUpdated'
  | 'documentSigned'

export interface DashboardContextInterface extends FlowContextInterface {
  employeeId: string
  formId?: string
  currentJob?: Job | null
  successAlert?: DashboardSuccessAlert | null
  /** Set by the EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED transition;
   *  consumed by `DeductionsEditFormContextual` to pre-populate the form. */
  editingDeductionId?: string
  /** Persists the active Dashboard tab across sub-flows so Cancel/Back
   *  returns to the originating tab instead of resetting to basic details. */
  selectedTab?: DashboardTab
}

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
    documentSigned: t('alerts.documentSigned'),
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

export function HomeAddressContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <HomeAddressEditForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function WorkAddressContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <WorkAddressEditForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function FederalTaxesContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <FederalTaxes employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function StateTaxesContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <StateTaxes employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function ProfileContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <ProfileEditForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function PaymentBankFormContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <PaymentMethodBankForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function PaymentSplitViewContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <PaymentMethodSplitForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

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

export function AddJobContextual() {
  useI18n('Employee.Dashboard')
  const { t } = useTranslation('Employee.Dashboard')
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return (
    <EditCompensation
      employeeId={ensureRequired(employeeId)}
      title={t('compensationFlow.addJobTitle')}
      submitCtaLabel={t('compensationFlow.saveCta')}
      onEvent={onEvent}
      onCancel={() => {
        onEvent(componentEvents.CANCEL)
      }}
    />
  )
}

export function EditCompensationContextual() {
  const { employeeId, currentJob, onEvent } = useFlow<DashboardContextInterface>()

  // Use getPendingCompensationChanges to find the nearest pending comp — the
  // API does not guarantee ordering of job.compensations, so we rely on the
  // same sorted helper that drives the card display (ascending by effectiveDate).
  const pendingChanges = getPendingCompensationChanges(currentJob ? [currentJob] : [])
  const nearestPending = pendingChanges[0]

  if (nearestPending) {
    return (
      <ManagementEditPendingCompensation
        employeeId={ensureRequired(employeeId)}
        jobId={ensureRequired(currentJob?.uuid)}
        compensationId={nearestPending.compensationUuid}
        isNewJob={nearestPending.isNewJob}
        isPrimaryJob={currentJob?.primary ?? false}
        onEvent={onEvent}
        onCancel={() => {
          onEvent(componentEvents.CANCEL, null)
        }}
      />
    )
  }

  return (
    <ManagementEditCompensation
      employeeId={ensureRequired(employeeId)}
      jobId={ensureRequired(currentJob?.uuid)}
      onEvent={onEvent}
      onCancel={() => {
        onEvent(componentEvents.CANCEL, null)
      }}
    />
  )
}

export function AddAnotherJobContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return (
    <AddAnotherJob
      employeeId={ensureRequired(employeeId)}
      onEvent={onEvent}
      onCancel={() => {
        onEvent(componentEvents.CANCEL)
      }}
    />
  )
}
