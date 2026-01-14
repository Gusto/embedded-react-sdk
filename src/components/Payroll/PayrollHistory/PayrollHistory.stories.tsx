import { fn } from 'storybook/test'
import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import type { WireInRequest } from '@gusto/embedded-api/models/components/wireinrequest'
import { PayrollHistoryPresentation } from './PayrollHistoryPresentation'

export default {
  title: 'Domain/Payroll/PayrollHistory',
}

const createMockPayroll = (id: string, overrides: Partial<Payroll> = {}): Payroll => ({
  payrollUuid: id,
  processed: false,
  checkDate: '2024-12-08',
  external: false,
  offCycle: false,
  payrollDeadline: new Date('2024-12-07T23:30:00Z'),
  payrollStatusMeta: {
    cancellable: true,
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
  ...overrides,
})

const mockPayrollHistory: Payroll[] = [
  createMockPayroll('1', {
    processed: true,
    checkDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    payPeriod: { startDate: '2024-11-01', endDate: '2024-11-15', payScheduleUuid: 'schedule-1' },
  }),
  createMockPayroll('2', {
    processed: true,
    checkDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    payPeriod: { startDate: '2024-11-16', endDate: '2024-11-30', payScheduleUuid: 'schedule-1' },
  }),
  createMockPayroll('3', {
    processed: false,
    calculatedAt: new Date(),
    processingRequest: { status: 'calculate_success' },
    payPeriod: { startDate: '2024-12-01', endDate: '2024-12-15', payScheduleUuid: 'schedule-1' },
  }),
]

const mockWireInRequests: WireInRequest[] = [{ status: 'awaiting_funds', paymentUuid: '2' }]

export const PayrollHistoryStory = () => {
  return (
    <PayrollHistoryPresentation
      payrollHistory={mockPayrollHistory}
      wireInRequests={mockWireInRequests}
      selectedTimeFilter="3months"
      onTimeFilterChange={fn().mockName('onTimeFilterChange')}
      onViewSummary={fn().mockName('onViewSummary')}
      onViewReceipt={fn().mockName('onViewReceipt')}
      onCancelPayroll={fn().mockName('onCancelPayroll')}
      cancelDialogItem={null}
      onCancelDialogOpen={fn().mockName('onCancelDialogOpen')}
      onCancelDialogClose={fn().mockName('onCancelDialogClose')}
    />
  )
}

export const AllStatusesShowcase = () => {
  const now = Date.now()
  const fiveHoursFromNow = new Date(now + 5 * 60 * 60 * 1000)
  const eightDaysFromNow = new Date(now + 8 * 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000)
  const sevenDaysFromNow = new Date(now + 7 * 24 * 60 * 60 * 1000)
  const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000)

  const showcasePayrolls: Payroll[] = [
    createMockPayroll('calculating', {
      processingRequest: { status: 'calculating' },
      payPeriod: { startDate: '2024-10-01', endDate: '2024-10-15', payScheduleUuid: 'schedule-1' },
    }),
    createMockPayroll('ready-to-submit', {
      calculatedAt: new Date(),
      processingRequest: { status: 'calculate_success' },
      payPeriod: { startDate: '2024-10-16', endDate: '2024-10-31', payScheduleUuid: 'schedule-1' },
    }),
    createMockPayroll('processing', {
      processingRequest: { status: 'submitting' },
      payPeriod: { startDate: '2024-11-01', endDate: '2024-11-15', payScheduleUuid: 'schedule-1' },
    }),
    createMockPayroll('failed', {
      processingRequest: { status: 'processing_failed' },
      payPeriod: { startDate: '2024-11-16', endDate: '2024-11-30', payScheduleUuid: 'schedule-1' },
    }),
    createMockPayroll('waiting-wire-in', {
      processed: true,
      checkDate: sevenDaysFromNow.toISOString(),
      payPeriod: { startDate: '2024-12-01', endDate: '2024-12-15', payScheduleUuid: 'schedule-1' },
    }),
    createMockPayroll('pending-approval', {
      processed: true,
      checkDate: sevenDaysFromNow.toISOString(),
      payPeriod: { startDate: '2024-12-16', endDate: '2024-12-31', payScheduleUuid: 'schedule-1' },
    }),
    createMockPayroll('due-in-hours', {
      payrollDeadline: fiveHoursFromNow,
      payPeriod: { startDate: '2025-01-16', endDate: '2025-01-31', payScheduleUuid: 'schedule-1' },
    }),
    createMockPayroll('due-in-days', {
      payrollDeadline: eightDaysFromNow,
      payPeriod: { startDate: '2025-02-01', endDate: '2025-02-15', payScheduleUuid: 'schedule-1' },
    }),
    createMockPayroll('days-late', {
      payrollDeadline: twoDaysAgo,
      payPeriod: { startDate: '2025-02-16', endDate: '2025-02-28', payScheduleUuid: 'schedule-1' },
    }),
    createMockPayroll('paid', {
      processed: true,
      checkDate: tenDaysAgo.toISOString(),
      payPeriod: { startDate: '2025-03-01', endDate: '2025-03-15', payScheduleUuid: 'schedule-1' },
    }),
    createMockPayroll('pending', {
      processed: true,
      checkDate: sevenDaysFromNow.toISOString(),
      payPeriod: { startDate: '2025-03-16', endDate: '2025-03-31', payScheduleUuid: 'schedule-1' },
    }),
  ]

  const showcaseWireInRequests: WireInRequest[] = [
    { status: 'awaiting_funds', paymentUuid: 'waiting-wire-in' },
    { status: 'pending_review', paymentUuid: 'pending-approval' },
  ]

  return (
    <PayrollHistoryPresentation
      payrollHistory={showcasePayrolls}
      wireInRequests={showcaseWireInRequests}
      selectedTimeFilter="3months"
      onTimeFilterChange={fn().mockName('onTimeFilterChange')}
      onViewSummary={fn().mockName('onViewSummary')}
      onViewReceipt={fn().mockName('onViewReceipt')}
      onCancelPayroll={fn().mockName('onCancelPayroll')}
      cancelDialogItem={null}
      onCancelDialogOpen={fn().mockName('onCancelDialogOpen')}
      onCancelDialogClose={fn().mockName('onCancelDialogClose')}
    />
  )
}

export const CancelDialog = () => {
  const cancelPayroll = createMockPayroll('cancel-dialog', {
    processed: false,
    payrollDeadline: new Date('2024-12-20T23:30:00Z'),
    payPeriod: { startDate: '2024-12-01', endDate: '2024-12-15', payScheduleUuid: 'schedule-1' },
  })

  return (
    <PayrollHistoryPresentation
      payrollHistory={[cancelPayroll]}
      wireInRequests={[]}
      selectedTimeFilter="3months"
      onTimeFilterChange={fn().mockName('onTimeFilterChange')}
      onViewSummary={fn().mockName('onViewSummary')}
      onViewReceipt={fn().mockName('onViewReceipt')}
      onCancelPayroll={fn().mockName('onCancelPayroll')}
      cancelDialogItem={cancelPayroll}
      onCancelDialogOpen={fn().mockName('onCancelDialogOpen')}
      onCancelDialogClose={fn().mockName('onCancelDialogClose')}
    />
  )
}

export const EmptyState = () => {
  return (
    <PayrollHistoryPresentation
      payrollHistory={[]}
      wireInRequests={[]}
      selectedTimeFilter="3months"
      onTimeFilterChange={fn().mockName('onTimeFilterChange')}
      onViewSummary={fn().mockName('onViewSummary')}
      onViewReceipt={fn().mockName('onViewReceipt')}
      onCancelPayroll={fn().mockName('onCancelPayroll')}
      cancelDialogItem={null}
      onCancelDialogOpen={fn().mockName('onCancelDialogOpen')}
      onCancelDialogClose={fn().mockName('onCancelDialogClose')}
    />
  )
}
