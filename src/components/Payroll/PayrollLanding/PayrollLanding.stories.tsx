import { action } from '@ladle/react'
import { useState } from 'react'
import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import type { PayScheduleList } from '@gusto/embedded-api/models/components/payschedulelist'
import { PayrollHistoryPresentation } from '../PayrollHistory/PayrollHistoryPresentation'
import { PayrollListPresentation } from '../PayrollList/PayrollListPresentation'
import type { PayrollHistoryItem } from '../PayrollHistory/PayrollHistory'
import type { PayrollType } from '../PayrollList/types'
import { I18nWrapper } from '../../../../.ladle/helpers/I18nWrapper'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'Domain/Payroll/PayrollLanding',
}

const createMockPayroll = (id: string, processed: boolean, cancellable: boolean): Payroll =>
  ({
    payrollUuid: id,
    processed,
    checkDate: '2024-12-08',
    external: false,
    offCycle: false,
    payrollDeadline: new Date('2024-12-07T23:30:00Z'),
    payrollStatusMeta: {
      cancellable,
      expectedCheckDate: '2024-12-08',
      initialCheckDate: '2024-12-08',
      expectedDebitTime: '2024-12-07T23:30:00Z',
      payrollLate: false,
      initialDebitCutoffTime: '2024-12-07T23:30:00Z',
    },
    payPeriod: {
      startDate: '2024-11-24',
      endDate: '2024-12-07',
      payScheduleUuid: 'schedule-1',
    },
    totals: {
      netPay: '30198.76',
      grossPay: '38000.00',
    },
  }) as Payroll

const mockPayrollHistory: PayrollHistoryItem[] = [
  {
    id: '1',
    payPeriod: 'Jul 30 – Aug 13, 2025',
    type: 'Regular',
    payDate: 'Dec 8, 2024',
    status: 'In progress',
    amount: 30198.76,
    payroll: createMockPayroll('1', false, true),
  },
  {
    id: '2',
    payPeriod: 'Aug 13 – Aug 27, 2025',
    type: 'Regular',
    payDate: 'Dec 8, 2024',
    status: 'Unprocessed',
    amount: 30198.76,
    payroll: createMockPayroll('2', false, true),
  },
  {
    id: '3',
    payPeriod: 'Aug 27 – Sep 10, 2025',
    type: 'External',
    payDate: 'Nov 24, 2024',
    status: 'Complete',
    amount: 30842.99,
    payroll: createMockPayroll('3', true, false),
  },
]

const mockPayrolls: (Payroll & { payrollType: PayrollType })[] = [
  {
    uuid: 'payroll-1',
    payPeriod: {
      startDate: '2024-12-01',
      endDate: '2024-12-15',
      payScheduleUuid: 'schedule-1',
    },
    checkDate: '2024-12-15',
    payrollType: 'Regular',
  } as Payroll & { payrollType: PayrollType },
  {
    uuid: 'payroll-2',
    payPeriod: {
      startDate: '2024-12-16',
      endDate: '2024-12-31',
      payScheduleUuid: 'schedule-1',
    },
    checkDate: '2024-12-31',
    payrollType: 'Off-Cycle',
  } as Payroll & { payrollType: PayrollType },
]

const mockPaySchedules: PayScheduleList[] = [
  {
    uuid: 'schedule-1',
    name: 'Bi-weekly',
    customName: 'Bi-weekly',
    version: '1',
  },
]

// NOTE: This story is for demo purposes only and does not use the actual PayrollLanding.tsx component
// It creates a custom implementation to showcase the tab structure with presentation components
export const PayrollLandingStory = () => {
  return (
    <I18nWrapper>
      <PayrollLandingStoryContent />
    </I18nWrapper>
  )
}

const PayrollLandingStoryContent = () => {
  const [selectedTab, setSelectedTab] = useState('run-payroll')
  const { Tabs } = useComponentContext()

  const tabs = [
    {
      id: 'run-payroll',
      label: 'Run payroll',
      content: (
        <PayrollListPresentation
          payrolls={mockPayrolls}
          paySchedules={mockPaySchedules}
          onRunPayroll={action('onRunPayroll')}
        />
      ),
    },
    {
      id: 'payroll-history',
      label: 'Payroll history',
      content: (
        <PayrollHistoryPresentation
          payrollHistory={mockPayrollHistory}
          selectedTimeFilter="3months"
          onTimeFilterChange={action('onTimeFilterChange')}
          onViewSummary={action('onViewSummary')}
          onViewReceipt={action('onViewReceipt')}
          onCancelPayroll={action('onCancelPayroll')}
        />
      ),
    },
  ]

  return (
    <Tabs
      tabs={tabs}
      selectedId={selectedTab}
      onSelectionChange={setSelectedTab}
      aria-label="Payroll navigation"
    />
  )
}
