import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PayrollHistory } from '../PayrollHistory/PayrollHistory'
import { PayrollList } from '../PayrollList/PayrollList'
import { PayrollReceipts } from '../PayrollReceipts/PayrollReceipts'
import { PayrollOverview } from '../PayrollOverview/PayrollOverview'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useI18n } from '@/i18n'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { componentEvents } from '@/shared/constants'

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
  const [showReceiptForPayrollId, setShowReceiptForPayrollId] = useState<string | null>(null)
  const [showSummaryForPayrollId, setShowSummaryForPayrollId] = useState<string | null>(null)
  const { Tabs } = useComponentContext()

  useI18n('Payroll.PayrollLanding')
  const { t } = useTranslation('Payroll.PayrollLanding')

  const wrappedOnEvent: typeof onEvent = (event, payload) => {
    if (event === componentEvents.RUN_PAYROLL_RECEIPT_VIEWED) {
      const { payrollId } = payload as { payrollId: string }
      setShowReceiptForPayrollId(payrollId)
    } else if (event === componentEvents.RUN_PAYROLL_SUMMARY_VIEWED) {
      const { payrollId } = payload as { payrollId: string }
      setShowSummaryForPayrollId(payrollId)
    } else if (event === componentEvents.RUN_PAYROLL_BACK) {
      setShowReceiptForPayrollId(null)
      setShowSummaryForPayrollId(null)
    }
    onEvent(event, payload)
  }

  if (showReceiptForPayrollId) {
    return (
      <PayrollReceipts
        onEvent={wrappedOnEvent}
        payrollId={showReceiptForPayrollId}
        showBackButton={true}
      />
    )
  }

  if (showSummaryForPayrollId) {
    return (
      <PayrollOverview
        onEvent={wrappedOnEvent}
        companyId={companyId}
        payrollId={showSummaryForPayrollId}
        showBackButton={true}
      />
    )
  }

  const tabs = [
    {
      id: 'run-payroll',
      label: t('tabs.runPayroll'),
      content: <PayrollList companyId={companyId} onEvent={wrappedOnEvent} />,
    },
    {
      id: 'payroll-history',
      label: t('tabs.payrollHistory'),
      content: <PayrollHistory companyId={companyId} onEvent={wrappedOnEvent} />,
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
