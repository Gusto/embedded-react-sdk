import { useTranslation } from 'react-i18next'
import { Dashboard } from './Dashboard'
import { HomeAddress } from '@/components/Employee/HomeAddress/management/HomeAddress'
import { WorkAddress } from '@/components/Employee/WorkAddress/management/WorkAddress'
import { FederalTaxes } from '@/components/Employee/FederalTaxes/management/FederalTaxes'
import { StateTaxes } from '@/components/Employee/StateTaxes/management/StateTaxes'
import { Profile } from '@/components/Employee/Profile/management/Profile'
import { BankForm } from '@/components/Employee/PaymentMethod/onboarding/BankForm'
import { SplitView } from '@/components/Employee/PaymentMethod/onboarding/SplitView'
import { DocumentManager } from '@/components/Employee/Documents/management/DocumentManager'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseComponent } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

export type DashboardSuccessAlert = 'bankAccountAdded' | 'bankAccountDeleted' | 'splitUpdated'

export interface DashboardContextInterface extends FlowContextInterface {
  employeeId: string
  formId?: string
  successAlert?: DashboardSuccessAlert | null
}

export function DashboardViewContextual() {
  useI18n('Employee.Dashboard')
  const { t } = useTranslation('Employee.Dashboard')
  const { employeeId, onEvent, successAlert } = useFlow<DashboardContextInterface>()
  const Components = useComponentContext()

  const alertLabels: Record<DashboardSuccessAlert, string> = {
    bankAccountAdded: t('alerts.bankAccountAdded'),
    bankAccountDeleted: t('alerts.bankAccountDeleted'),
    splitUpdated: t('alerts.splitUpdated'),
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
      <Dashboard employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
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
