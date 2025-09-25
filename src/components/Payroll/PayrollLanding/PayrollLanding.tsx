import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PayrollHistory } from '../PayrollHistory/PayrollHistory'
import { PayrollList } from '../PayrollList/PayrollList'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useI18n } from '@/i18n'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface PayrollLandingProps extends BaseComponentInterface<'Payroll.PayrollLanding'> {
  companyId: string
}

export function PayrollLanding(props: PayrollLandingProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

export const Root = ({ onEvent, companyId }: PayrollLandingProps) => {
  const [selectedTab, setSelectedTab] = useState('run-payroll')
  const { Tabs } = useComponentContext()

  useI18n('Payroll.PayrollLanding')
  const { t } = useTranslation('Payroll.PayrollLanding')

  const tabs = [
    {
      id: 'run-payroll',
      label: t('tabs.runPayroll'),
      content: <PayrollList companyId={companyId} onEvent={onEvent} />,
    },
    {
      id: 'payroll-history',
      label: t('tabs.payrollHistory'),
      content: <PayrollHistory companyId={companyId} onEvent={onEvent} />,
    },
  ]

  return (
    <Tabs
      tabs={tabs}
      selectedId={selectedTab}
      onSelectionChange={setSelectedTab}
      aria-label={t('aria.tabNavigation')}
    />
  )
}
