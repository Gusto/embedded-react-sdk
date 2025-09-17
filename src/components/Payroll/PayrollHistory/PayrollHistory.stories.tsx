import { action } from '@ladle/react'
import { PayrollHistoryPresentation } from './PayrollHistoryPresentation'
import type { PayrollHistoryItem } from './PayrollHistoryPresentation'

export default {
  title: 'Domain/Payroll/PayrollHistory',
}

const mockPayrollHistory: PayrollHistoryItem[] = [
  {
    id: '1',
    payPeriod: 'Jul 30 – Aug 13, 2025',
    type: 'Regular',
    payDate: 'Dec 8, 2024',
    status: 'In progress',
    amount: 30198.76,
  },
  {
    id: '2',
    payPeriod: 'Aug 13 – Aug 27, 2025',
    type: 'Regular',
    payDate: 'Dec 8, 2024',
    status: 'Unprocessed',
    amount: 30198.76,
  },
  {
    id: '3',
    payPeriod: 'Aug 27 – Sep 10, 2025',
    type: 'Dismissal',
    payDate: 'Nov 24, 2024',
    status: 'Complete',
    amount: 30842.99,
  },
  {
    id: '4',
    payPeriod: 'Sep 10 – Sep 24, 2025',
    type: 'Regular',
    payDate: 'Oct 1, 2024',
    status: 'Submitted',
    amount: 28456.5,
  },
]

export const PayrollHistoryStory = () => {
  return (
    <PayrollHistoryPresentation
      payrollHistory={mockPayrollHistory}
      selectedTimeFilter="3months"
      onTimeFilterChange={action('onTimeFilterChange')}
      onViewSummary={action('onViewSummary')}
      onViewReceipt={action('onViewReceipt')}
      onCancelPayroll={action('onCancelPayroll')}
    />
  )
}

export const EmptyState = () => {
  return (
    <PayrollHistoryPresentation
      payrollHistory={[]}
      selectedTimeFilter="3months"
      onTimeFilterChange={action('onTimeFilterChange')}
      onViewSummary={action('onViewSummary')}
      onViewReceipt={action('onViewReceipt')}
      onCancelPayroll={action('onCancelPayroll')}
    />
  )
}
