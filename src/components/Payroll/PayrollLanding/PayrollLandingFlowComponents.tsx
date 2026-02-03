import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWireInRequestsListSuspense } from '@gusto/embedded-api/react-query/wireInRequestsList'
import { usePayrollsGetBlockersSuspense } from '@gusto/embedded-api/react-query/payrollsGetBlockers'
import { PayrollHistory } from '../PayrollHistory/PayrollHistory'
import { PayrollList } from '../PayrollList/PayrollList'
import { PayrollOverview } from '../PayrollOverview/PayrollOverview'
import { PayrollReceipts } from '../PayrollReceipts/PayrollReceipts'
import {
  ConfirmWireDetails,
  type ConfirmWireDetailsComponentType,
} from '../ConfirmWireDetails/ConfirmWireDetails'
import { PayrollBlockerAlerts } from '../PayrollBlocker/components/PayrollBlockerAlerts'
import type { ApiPayrollBlocker } from '../PayrollBlocker/payrollHelpers'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { useFlow } from '@/components/Flow/useFlow'
import { useI18n } from '@/i18n'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { FlowContextInterface } from '@/components/Flow/useFlow'
import { Flex } from '@/components/Common/Flex/Flex'
import { componentEvents } from '@/shared/constants'

export interface PayrollLandingFlowProps extends BaseComponentInterface<'Payroll.PayrollLanding'> {
  companyId: string
  withReimbursements?: boolean
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
}

export interface PayrollLandingFlowContextInterface extends FlowContextInterface {
  component: (() => React.JSX.Element) | null
  companyId: string
  payrollUuid?: string
  previousState?: 'tabs' | 'overview'
  selectedTab?: string
  withReimbursements: boolean
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
  startDate?: string
  endDate?: string
}

export function PayrollLandingTabsContextual() {
  const {
    companyId,
    onEvent,
    selectedTab = 'run-payroll',
    ConfirmWireDetailsComponent = ConfirmWireDetails,
  } = useFlow<PayrollLandingFlowContextInterface>()
  const [currentTab, setCurrentTab] = useState(selectedTab)
  const { Tabs } = useComponentContext()

  useI18n('Payroll.PayrollLanding')
  const { t } = useTranslation('Payroll.PayrollLanding')

  const { data: wireInRequestsData } = useWireInRequestsListSuspense({
    companyUuid: ensureRequired(companyId),
  })

  const hasActiveWireInRequests = (wireInRequestsData.wireInRequestList || []).some(
    r => r.status === 'awaiting_funds',
  )

  const { data: blockersData } = usePayrollsGetBlockersSuspense({
    companyUuid: ensureRequired(companyId),
  })

  const payrollBlockerList = blockersData.payrollBlockerList ?? []

  const blockers: ApiPayrollBlocker[] = payrollBlockerList.map(blocker => ({
    key: blocker.key ?? 'unknown',
    message: blocker.message,
  }))

  const onViewBlockers = () => {
    onEvent(componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL)
  }

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
    <Flex flexDirection="column" gap={32}>
      {hasActiveWireInRequests && (
        <ConfirmWireDetailsComponent companyId={ensureRequired(companyId)} onEvent={onEvent} />
      )}
      <PayrollBlockerAlerts blockers={blockers} onMultipleViewClick={onViewBlockers} />
      <Tabs
        tabs={tabs}
        selectedId={currentTab}
        onSelectionChange={setCurrentTab}
        aria-label={t('aria.tabNavigation')}
      />
    </Flex>
  )
}

export function PayrollLandingReceiptsContextual() {
  const { payrollUuid, onEvent, withReimbursements } = useFlow<PayrollLandingFlowContextInterface>()

  return (
    <PayrollReceipts
      onEvent={onEvent}
      payrollId={ensureRequired(payrollUuid)}
      withReimbursements={withReimbursements}
    />
  )
}

export function PayrollLandingOverviewContextual() {
  const { companyId, payrollUuid, onEvent, withReimbursements, ConfirmWireDetailsComponent } =
    useFlow<PayrollLandingFlowContextInterface>()

  return (
    <PayrollOverview
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      payrollId={ensureRequired(payrollUuid)}
      withReimbursements={withReimbursements}
      ConfirmWireDetailsComponent={ConfirmWireDetailsComponent}
    />
  )
}
