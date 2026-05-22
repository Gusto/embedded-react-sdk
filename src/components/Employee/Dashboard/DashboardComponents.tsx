import { useTranslation } from 'react-i18next'
import type { Job } from '@gusto/embedded-api/models/components/job'
import { Dashboard, type DashboardTab } from './Dashboard'
import { getPendingCompensationChanges } from './getPendingCompensationChanges'
import { HomeAddress } from '@/components/Employee/HomeAddress/management/HomeAddress'
import { WorkAddress } from '@/components/Employee/WorkAddress/management/WorkAddress'
import { FederalTaxes } from '@/components/Employee/FederalTaxes/management/FederalTaxes'
import { StateTaxes } from '@/components/Employee/StateTaxes/management/StateTaxes'
import { Profile } from '@/components/Employee/Profile/management/Profile'
import { BankForm } from '@/components/Employee/PaymentMethod/onboarding/BankForm'
import { SplitView } from '@/components/Employee/PaymentMethod/onboarding/SplitView'
import { DocumentManager } from '@/components/Employee/Documents/management/DocumentManager'
import { DeductionsForm } from '@/components/Employee/Deductions/DeductionsForm/DeductionsForm'
import {
  ManagementEditCompensation,
  ManagementEditPendingCompensation,
} from '@/components/Employee/Compensation/management'
import { useDeductionsList } from '@/components/Employee/Deductions/shared'
import { AddAnotherJob } from '@/components/Employee/Compensation/management/AddAnotherJob/AddAnotherJob'
import { EditCompensation } from '@/components/Employee/Compensation/onboarding/EditCompensation/EditCompensation'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseComponent, BaseLayout } from '@/components/Base'
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

export interface DashboardContextInterface extends FlowContextInterface {
  employeeId: string
  formId?: string
  currentJob?: Job | null
  successAlert?: DashboardSuccessAlert | null
  /** Set by the EMPLOYEE_DEDUCTION_EDIT transition; consumed by
   *  DeductionFormContextual to pre-populate the form. */
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
  return <HomeAddress employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function WorkAddressContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <WorkAddress employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
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
  return <Profile employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function PaymentBankFormContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return (
    <BaseComponent onEvent={onEvent}>
      <BankForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
    </BaseComponent>
  )
}

export function PaymentSplitViewContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return (
    <BaseComponent onEvent={onEvent}>
      <SplitView employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
    </BaseComponent>
  )
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

export function DeductionFormContextual() {
  const { employeeId, editingDeductionId, onEvent } = useFlow<DashboardContextInterface>()
  // The same list query the form hooks use internally — React Query dedupes,
  // so this just looks up the loaded row to pre-populate edit mode.
  const list = useDeductionsList({ employeeId: ensureRequired(employeeId) })

  if (list.isLoading) {
    return <BaseLayout isLoading error={list.errorHandling.errors} />
  }

  const deduction = editingDeductionId
    ? (list.data.deductions.find(d => d.uuid === editingDeductionId) ?? null)
    : null

  return (
    <BaseLayout error={list.errorHandling.errors}>
      <DeductionsForm
        employeeId={ensureRequired(employeeId)}
        deduction={deduction}
        onSaved={(saved, mode) => {
          onEvent(
            mode === 'create'
              ? componentEvents.EMPLOYEE_DEDUCTION_CREATED
              : componentEvents.EMPLOYEE_DEDUCTION_UPDATED,
            saved,
          )
        }}
        onCancel={() => {
          onEvent(componentEvents.CANCEL)
        }}
      />
    </BaseLayout>
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
