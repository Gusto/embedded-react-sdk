import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PayrollHistory } from '../PayrollHistory/PayrollHistory'
import { PayrollList } from '../PayrollList/PayrollList'
import { PayrollOverview } from '../PayrollOverview/PayrollOverview'
import { PayrollReceipts } from '../PayrollReceipts/PayrollReceipts'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { useFlow } from '@/components/Flow/useFlow'
import { useI18n } from '@/i18n'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { FlowContextInterface } from '@/components/Flow/useFlow'

export interface PayrollLandingFlowProps extends BaseComponentInterface<'Payroll.PayrollLanding'> {
  companyId: string
}

export interface PayrollLandingFlowContextInterface extends FlowContextInterface {
  component: (() => React.JSX.Element) | null
  companyId: string
  payrollUuid?: string
  previousState?: 'tabs' | 'overview'
  selectedTab?: string
}

export function PayrollLandingTabsContextual() {
  const {
    companyId,
    onEvent,
    selectedTab = 'run-payroll',
  } = useFlow<PayrollLandingFlowContextInterface>()
  const [currentTab, setCurrentTab] = useState(selectedTab)
  const { Tabs } = useComponentContext()

  useI18n('Payroll.PayrollLanding')
  const { t } = useTranslation('Payroll.PayrollLanding')

  const tabs = [
    {
      id: 'run-payroll',
      label: t('tabs.runPayroll'),
      content: <PayrollList companyId={ensureRequired(companyId)} onEvent={onEvent} />,
    },
    {
      id: 'payroll-history',
      label: t('tabs.payrollHistory'),
      content: <PayrollHistory companyId={ensureRequired(companyId)} onEvent={onEvent} />,
    },
  ]

  return (
    <Tabs
      tabs={tabs}
      selectedId={currentTab}
      onSelectionChange={setCurrentTab}
      aria-label={t('aria.tabNavigation')}
    />
  )
}

export function PayrollLandingReceiptsContextual() {
  const { payrollUuid, onEvent } = useFlow<PayrollLandingFlowContextInterface>()

  return <PayrollReceipts onEvent={onEvent} payrollId={ensureRequired(payrollUuid)} />
}

export function PayrollLandingOverviewContextual() {
  const { companyId, payrollUuid, onEvent } = useFlow<PayrollLandingFlowContextInterface>()

  return (
    <PayrollOverview
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      payrollId={ensureRequired(payrollUuid)}
    />
  )
}
