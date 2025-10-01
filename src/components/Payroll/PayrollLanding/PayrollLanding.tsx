import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PayrollHistoryFlow } from '../PayrollHistoryFlow/PayrollHistoryFlow'
import { PayrollList } from '../PayrollList/PayrollList'
import { PayrollOverview } from '../PayrollOverview/PayrollOverview'
import { PayrollReceipts } from '../PayrollReceipts/PayrollReceipts'
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
  const [previousView, setPreviousView] = useState<'history' | 'overview' | null>(null)
  const { Tabs } = useComponentContext()

  useI18n('Payroll.PayrollLanding')
  const { t } = useTranslation('Payroll.PayrollLanding')

  useEffect(() => {
    // Track state changes for debugging if needed
  }, [showReceiptForPayrollId, showSummaryForPayrollId, previousView])

  const wrappedOnEvent: typeof onEvent = (event, payload) => {
    if (event === componentEvents.RUN_PAYROLL_RECEIPT_VIEWED) {
      const { payrollId } = payload as { payrollId: string }
      setShowReceiptForPayrollId(payrollId)
      setShowSummaryForPayrollId(null)
      setPreviousView('history')
      // Propagate to parent as well
      onEvent(event, payload)
      return
    } else if (event === componentEvents.RUN_PAYROLL_SUMMARY_VIEWED) {
      const { payrollId } = payload as { payrollId: string }
      setShowSummaryForPayrollId(payrollId)
      setShowReceiptForPayrollId(null)
      setPreviousView('history')
      // Propagate to parent as well
      onEvent(event, payload)
      return
    } else if (event === componentEvents.RUN_PAYROLL_RECEIPT_GET) {
      const { payrollId } = payload as { payrollId: string }
      setShowReceiptForPayrollId(payrollId)
      setShowSummaryForPayrollId(null)
      setPreviousView('overview')
      // Don't propagate - we're handling it here
      return
    } else if (event === componentEvents.RUN_PAYROLL_BACK) {
      if (previousView === 'overview') {
        // Going back from receipt to overview - restore the overview
        const payrollId = showReceiptForPayrollId
        setShowReceiptForPayrollId(null)
        setShowSummaryForPayrollId(payrollId)
        setPreviousView('history')
        // Don't propagate - we're handling it here
        return
      } else if (previousView === 'history') {
        // Going back from receipt/overview to history tabs
        setShowReceiptForPayrollId(null)
        setShowSummaryForPayrollId(null)
        setPreviousView(null)
        // Don't propagate - we're handling it here
        return
      }
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
      content: <PayrollHistoryFlow companyId={companyId} onEvent={wrappedOnEvent} />,
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
