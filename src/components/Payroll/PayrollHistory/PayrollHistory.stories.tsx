import { action } from '@ladle/react'
import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import { I18nWrapper } from '../../../../.ladle/helpers/I18nWrapper'
import { PayrollHistoryPresentation } from './PayrollHistoryPresentation'
import type { PayrollHistoryItem } from './PayrollHistory'

export default {
  title: 'Domain/Payroll/PayrollHistory',
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
  {
    id: '4',
    payPeriod: 'Sep 10 – Sep 24, 2025',
    type: 'Regular',
    payDate: 'Oct 1, 2024',
    status: 'Submitted',
    amount: 28456.5,
    payroll: createMockPayroll('4', false, true),
  },
]

export const PayrollHistoryStory = () => {
  return (
    <I18nWrapper>
      <PayrollHistoryPresentation
        payrollHistory={mockPayrollHistory}
        selectedTimeFilter="3months"
        onTimeFilterChange={action('onTimeFilterChange')}
        onViewSummary={action('onViewSummary')}
        onViewReceipt={action('onViewReceipt')}
        onCancelPayroll={action('onCancelPayroll')}
      />
    </I18nWrapper>
  )
}

export const EmptyState = () => {
  return (
    <I18nWrapper>
      <PayrollHistoryPresentation
        payrollHistory={[]}
        selectedTimeFilter="3months"
        onTimeFilterChange={action('onTimeFilterChange')}
        onViewSummary={action('onViewSummary')}
        onViewReceipt={action('onViewReceipt')}
        onCancelPayroll={action('onCancelPayroll')}
      />
    </I18nWrapper>
  )
}
