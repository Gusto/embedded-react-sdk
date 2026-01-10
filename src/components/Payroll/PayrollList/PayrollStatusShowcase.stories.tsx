import { fn } from '@storybook/test'
import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import type { WireInRequest } from '@gusto/embedded-api/models/components/wireinrequest'
import { PayrollListPresentation } from './PayrollListPresentation'

export default {
  title: 'Domain/Payroll/Status Showcase',
}

const createBasePayroll = (uuid: string): Payroll & { payrollType: 'Regular' } => ({
  payrollUuid: uuid,
  checkDate: '2025-12-12',
  payPeriod: {
    payScheduleUuid: 'schedule-1',
    startDate: '2025-11-01',
    endDate: '2025-11-15',
  },
  payrollType: 'Regular',
  processed: false,
})

const paySchedules = [{ uuid: 'schedule-1', version: '1', name: 'Bi-weekly' }]

export const AllStatusesShowcase = () => {
  const now = Date.now()
  const fiveHoursFromNow = new Date(now + 5 * 60 * 60 * 1000)
  const eightDaysFromNow = new Date(now + 8 * 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000)
  const sevenDaysFromNow = new Date(now + 7 * 24 * 60 * 60 * 1000)
  const yesterday = new Date(now - 24 * 60 * 60 * 1000)

  const payrolls: (Payroll & { payrollType: 'Regular' })[] = [
    // Priority 1: Processing Request Statuses
    {
      ...createBasePayroll('calculating'),
      processingRequest: { status: 'calculating' },
      payPeriod: {
        ...createBasePayroll('calculating').payPeriod,
        startDate: '2025-11-01',
        endDate: '2025-11-15',
      },
    },
    {
      ...createBasePayroll('ready-to-submit'),
      calculatedAt: new Date(),
      processingRequest: { status: 'calculate_success' },
      payPeriod: {
        ...createBasePayroll('ready-to-submit').payPeriod,
        startDate: '2025-11-02',
        endDate: '2025-11-16',
      },
    },
    {
      ...createBasePayroll('processing'),
      processingRequest: { status: 'submitting' },
      payPeriod: {
        ...createBasePayroll('processing').payPeriod,
        startDate: '2025-11-03',
        endDate: '2025-11-17',
      },
    },
    {
      ...createBasePayroll('processing-late'),
      processingRequest: { status: 'submitting' },
      payrollDeadline: threeDaysAgo,
      payPeriod: {
        ...createBasePayroll('processing-late').payPeriod,
        startDate: '2025-10-31',
        endDate: '2025-11-14',
      },
    },
    {
      ...createBasePayroll('failed'),
      processingRequest: {
        status: 'processing_failed',
      },
      payPeriod: {
        ...createBasePayroll('failed').payPeriod,
        startDate: '2025-11-04',
        endDate: '2025-11-18',
      },
    },
    {
      ...createBasePayroll('failed-late'),
      processingRequest: {
        status: 'processing_failed',
      },
      payrollDeadline: twoDaysAgo,
      payPeriod: {
        ...createBasePayroll('failed-late').payPeriod,
        startDate: '2025-11-05',
        endDate: '2025-11-19',
      },
    },

    // Priority 2: Wire-In Request Statuses
    {
      ...createBasePayroll('waiting-wire-in'),
      processed: true,
      checkDate: sevenDaysFromNow.toISOString(),
      payPeriod: {
        ...createBasePayroll('waiting-wire-in').payPeriod,
        startDate: '2025-11-06',
        endDate: '2025-11-20',
      },
    },
    {
      ...createBasePayroll('pending-approval'),
      processed: true,
      checkDate: sevenDaysFromNow.toISOString(),
      payPeriod: {
        ...createBasePayroll('pending-approval').payPeriod,
        startDate: '2025-11-07',
        endDate: '2025-11-21',
      },
    },

    // Priority 3: Deadline-Based Statuses
    {
      ...createBasePayroll('due-hours'),
      payrollDeadline: fiveHoursFromNow,
      payPeriod: {
        ...createBasePayroll('due-hours').payPeriod,
        startDate: '2025-11-09',
        endDate: '2025-11-23',
      },
    },
    {
      ...createBasePayroll('due-days'),
      payrollDeadline: eightDaysFromNow,
      payPeriod: {
        ...createBasePayroll('due-days').payPeriod,
        startDate: '2025-11-10',
        endDate: '2025-11-24',
      },
    },
    {
      ...createBasePayroll('days-late'),
      payrollDeadline: twoDaysAgo,
      payPeriod: {
        ...createBasePayroll('days-late').payPeriod,
        startDate: '2025-11-11',
        endDate: '2025-11-25',
      },
    },

    // Priority 4: Fallback Statuses
    {
      ...createBasePayroll('unprocessed'),
      payPeriod: {
        ...createBasePayroll('unprocessed').payPeriod,
        startDate: '2025-11-12',
        endDate: '2025-11-26',
      },
    },
    {
      ...createBasePayroll('pending'),
      processed: true,
      checkDate: sevenDaysFromNow.toISOString(),
      payPeriod: {
        ...createBasePayroll('pending').payPeriod,
        startDate: '2025-11-13',
        endDate: '2025-11-27',
      },
    },
    {
      ...createBasePayroll('paid'),
      processed: true,
      checkDate: yesterday.toISOString(),
      payPeriod: {
        ...createBasePayroll('paid').payPeriod,
        startDate: '2025-11-14',
        endDate: '2025-11-28',
      },
    },
  ]

  const wireInRequests: WireInRequest[] = [
    {
      status: 'awaiting_funds',
      paymentUuid: 'waiting-wire-in',
      wireInDeadline: fiveHoursFromNow.toISOString(),
    },
    {
      status: 'pending_review',
      paymentUuid: 'pending-approval',
    },
  ]

  return (
    <PayrollListPresentation
      payrolls={payrolls}
      paySchedules={paySchedules}
      onRunPayroll={fn().mockName('run_payroll')}
      onSubmitPayroll={fn().mockName('submit_payroll')}
      onSkipPayroll={fn().mockName('skip_payroll')}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={fn().mockName('dismiss_alert')}
      blockers={[]}
      skippingPayrollId={null}
      wireInRequests={wireInRequests}
    />
  )
}

export const Priority1_ProcessingStatuses = () => {
  const payrolls: (Payroll & { payrollType: 'Regular' })[] = [
    {
      ...createBasePayroll('calculating'),
      processingRequest: { status: 'calculating' },
    },
    {
      ...createBasePayroll('ready-to-submit'),
      calculatedAt: new Date(),
      processingRequest: { status: 'calculate_success' },
      payPeriod: {
        ...createBasePayroll('ready-to-submit').payPeriod,
        startDate: '2025-11-02',
        endDate: '2025-11-16',
      },
    },
    {
      ...createBasePayroll('processing'),
      processingRequest: { status: 'submitting' },
      payPeriod: {
        ...createBasePayroll('processing').payPeriod,
        startDate: '2025-11-03',
        endDate: '2025-11-17',
      },
    },
    {
      ...createBasePayroll('failed'),
      processingRequest: {
        status: 'processing_failed',
      },
      payPeriod: {
        ...createBasePayroll('failed').payPeriod,
        startDate: '2025-11-04',
        endDate: '2025-11-18',
      },
    },
  ]

  return (
    <PayrollListPresentation
      payrolls={payrolls}
      paySchedules={paySchedules}
      onRunPayroll={fn().mockName('run_payroll')}
      onSubmitPayroll={fn().mockName('submit_payroll')}
      onSkipPayroll={fn().mockName('skip_payroll')}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={fn().mockName('dismiss_alert')}
      blockers={[]}
      skippingPayrollId={null}
      wireInRequests={[]}
    />
  )
}

export const Priority2_WireInStatuses = () => {
  const now = Date.now()
  const fiveHoursFromNow = new Date(now + 5 * 60 * 60 * 1000)
  const sevenDaysFromNow = new Date(now + 7 * 24 * 60 * 60 * 1000)

  const payrolls: (Payroll & { payrollType: 'Regular' })[] = [
    {
      ...createBasePayroll('waiting-wire-in'),
      processed: true,
      checkDate: sevenDaysFromNow.toISOString(),
    },
    {
      ...createBasePayroll('pending-approval'),
      processed: true,
      checkDate: sevenDaysFromNow.toISOString(),
      payPeriod: {
        ...createBasePayroll('pending-approval').payPeriod,
        startDate: '2025-11-06',
        endDate: '2025-11-20',
      },
    },
  ]

  const wireInRequests: WireInRequest[] = [
    {
      status: 'awaiting_funds',
      paymentUuid: 'waiting-wire-in',
      wireInDeadline: fiveHoursFromNow.toISOString(),
    },
    {
      status: 'pending_review',
      paymentUuid: 'pending-approval',
    },
  ]

  return (
    <PayrollListPresentation
      payrolls={payrolls}
      paySchedules={paySchedules}
      onRunPayroll={fn().mockName('run_payroll')}
      onSubmitPayroll={fn().mockName('submit_payroll')}
      onSkipPayroll={fn().mockName('skip_payroll')}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={fn().mockName('dismiss_alert')}
      blockers={[]}
      skippingPayrollId={null}
      wireInRequests={wireInRequests}
    />
  )
}

export const Priority3_DeadlineStatuses = () => {
  const now = Date.now()
  const fiveHoursFromNow = new Date(now + 5 * 60 * 60 * 1000)
  const eightDaysFromNow = new Date(now + 8 * 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000)

  const payrolls: (Payroll & { payrollType: 'Regular' })[] = [
    {
      ...createBasePayroll('due-hours'),
      payrollDeadline: fiveHoursFromNow,
    },
    {
      ...createBasePayroll('due-days'),
      payrollDeadline: eightDaysFromNow,
      payPeriod: {
        ...createBasePayroll('due-days').payPeriod,
        startDate: '2025-11-09',
        endDate: '2025-11-23',
      },
    },
    {
      ...createBasePayroll('days-late'),
      payrollDeadline: twoDaysAgo,
      payPeriod: {
        ...createBasePayroll('days-late').payPeriod,
        startDate: '2025-11-10',
        endDate: '2025-11-24',
      },
    },
  ]

  return (
    <PayrollListPresentation
      payrolls={payrolls}
      paySchedules={paySchedules}
      onRunPayroll={fn().mockName('run_payroll')}
      onSubmitPayroll={fn().mockName('submit_payroll')}
      onSkipPayroll={fn().mockName('skip_payroll')}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={fn().mockName('dismiss_alert')}
      blockers={[]}
      skippingPayrollId={null}
      wireInRequests={[]}
    />
  )
}

export const Priority4_FallbackStatuses = () => {
  const now = Date.now()
  const sevenDaysFromNow = new Date(now + 7 * 24 * 60 * 60 * 1000)
  const yesterday = new Date(now - 24 * 60 * 60 * 1000)

  const payrolls: (Payroll & { payrollType: 'Regular' })[] = [
    {
      ...createBasePayroll('unprocessed'),
    },
    {
      ...createBasePayroll('pending'),
      processed: true,
      checkDate: sevenDaysFromNow.toISOString(),
      payPeriod: {
        ...createBasePayroll('pending').payPeriod,
        startDate: '2025-11-12',
        endDate: '2025-11-26',
      },
    },
    {
      ...createBasePayroll('paid'),
      processed: true,
      checkDate: yesterday.toISOString(),
      payPeriod: {
        ...createBasePayroll('paid').payPeriod,
        startDate: '2025-11-13',
        endDate: '2025-11-27',
      },
    },
  ]

  return (
    <PayrollListPresentation
      payrolls={payrolls}
      paySchedules={paySchedules}
      onRunPayroll={fn().mockName('run_payroll')}
      onSubmitPayroll={fn().mockName('submit_payroll')}
      onSkipPayroll={fn().mockName('skip_payroll')}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={fn().mockName('dismiss_alert')}
      blockers={[]}
      skippingPayrollId={null}
      wireInRequests={[]}
    />
  )
}

export const PriorityTest_ProcessingBeatsWireIn = () => {
  const now = Date.now()
  const fiveHoursFromNow = new Date(now + 5 * 60 * 60 * 1000)
  const sevenDaysFromNow = new Date(now + 7 * 24 * 60 * 60 * 1000)

  const payrolls: (Payroll & { payrollType: 'Regular' })[] = [
    {
      ...createBasePayroll('processing-with-wire'),
      processed: true,
      checkDate: sevenDaysFromNow.toISOString(),
      processingRequest: { status: 'submitting' },
    },
  ]

  const wireInRequests: WireInRequest[] = [
    {
      status: 'awaiting_funds',
      paymentUuid: 'processing-with-wire',
      wireInDeadline: fiveHoursFromNow.toISOString(),
    },
  ]

  return (
    <div>
      <div style={{ padding: '20px', background: '#f0f0f0', marginBottom: '20px' }}>
        <h3>Expected: Should show &ldquo;Processing&rdquo; (orange badge)</h3>
        <p>
          This payroll has BOTH processingRequest.status=&lsquo;submitting&rsquo; AND wireInRequest
          status=&lsquo;awaiting_funds&rsquo;. Processing status should win.
        </p>
      </div>
      <PayrollListPresentation
        payrolls={payrolls}
        paySchedules={paySchedules}
        onRunPayroll={fn().mockName('run_payroll')}
        onSubmitPayroll={fn().mockName('submit_payroll')}
        onSkipPayroll={fn().mockName('skip_payroll')}
        showSkipSuccessAlert={false}
        onDismissSkipSuccessAlert={fn().mockName('dismiss_alert')}
        blockers={[]}
        skippingPayrollId={null}
        wireInRequests={wireInRequests}
      />
    </div>
  )
}

export const PriorityTest_WireInBeatsDeadline = () => {
  const now = Date.now()
  const fiveHoursFromNow = new Date(now + 5 * 60 * 60 * 1000)
  const sevenDaysFromNow = new Date(now + 7 * 24 * 60 * 60 * 1000)

  const payrolls: (Payroll & { payrollType: 'Regular' })[] = [
    {
      ...createBasePayroll('wire-with-deadline'),
      processed: true,
      checkDate: sevenDaysFromNow.toISOString(),
      payrollDeadline: fiveHoursFromNow,
    },
  ]

  const wireInRequests: WireInRequest[] = [
    {
      status: 'pending_review',
      paymentUuid: 'wire-with-deadline',
    },
  ]

  return (
    <div>
      <div style={{ padding: '20px', background: '#f0f0f0', marginBottom: '20px' }}>
        <h3>Expected: Should show &ldquo;Pending approval&rdquo; (orange badge)</h3>
        <p>
          This payroll has BOTH wireInRequest status=&lsquo;pending_review&rsquo; AND
          payrollDeadline=&lsquo;5 hours from now&rsquo;. Wire-in status should win because
          processed=true.
        </p>
      </div>
      <PayrollListPresentation
        payrolls={payrolls}
        paySchedules={paySchedules}
        onRunPayroll={fn().mockName('run_payroll')}
        onSubmitPayroll={fn().mockName('submit_payroll')}
        onSkipPayroll={fn().mockName('skip_payroll')}
        showSkipSuccessAlert={false}
        onDismissSkipSuccessAlert={fn().mockName('dismiss_alert')}
        blockers={[]}
        skippingPayrollId={null}
        wireInRequests={wireInRequests}
      />
    </div>
  )
}

export const EdgeCase_SingleHourSingular = () => {
  const now = Date.now()
  const oneHourFromNow = new Date(now + 1 * 60 * 60 * 1000)

  const payrolls: (Payroll & { payrollType: 'Regular' })[] = [
    {
      ...createBasePayroll('one-hour'),
      payrollDeadline: oneHourFromNow,
    },
  ]

  return (
    <div>
      <div style={{ padding: '20px', background: '#f0f0f0', marginBottom: '20px' }}>
        <h3>Expected: Should show &ldquo;Due in 1 hour&rdquo; (singular)</h3>
        <p>Tests pluralization for exactly 1 hour</p>
      </div>
      <PayrollListPresentation
        payrolls={payrolls}
        paySchedules={paySchedules}
        onRunPayroll={fn().mockName('run_payroll')}
        onSubmitPayroll={fn().mockName('submit_payroll')}
        onSkipPayroll={fn().mockName('skip_payroll')}
        showSkipSuccessAlert={false}
        onDismissSkipSuccessAlert={fn().mockName('dismiss_alert')}
        blockers={[]}
        skippingPayrollId={null}
        wireInRequests={[]}
      />
    </div>
  )
}

export const EdgeCase_SingleDaySingular = () => {
  const now = Date.now()
  const oneDayFromNow = new Date(now + 1 * 24 * 60 * 60 * 1000)

  const payrolls: (Payroll & { payrollType: 'Regular' })[] = [
    {
      ...createBasePayroll('one-day'),
      payrollDeadline: oneDayFromNow,
    },
  ]

  return (
    <div>
      <div style={{ padding: '20px', background: '#f0f0f0', marginBottom: '20px' }}>
        <h3>Expected: Should show &ldquo;Due in 1 day&rdquo; (singular)</h3>
        <p>Tests pluralization for exactly 1 day</p>
      </div>
      <PayrollListPresentation
        payrolls={payrolls}
        paySchedules={paySchedules}
        onRunPayroll={fn().mockName('run_payroll')}
        onSubmitPayroll={fn().mockName('submit_payroll')}
        onSkipPayroll={fn().mockName('skip_payroll')}
        showSkipSuccessAlert={false}
        onDismissSkipSuccessAlert={fn().mockName('dismiss_alert')}
        blockers={[]}
        skippingPayrollId={null}
        wireInRequests={[]}
      />
    </div>
  )
}

export const EdgeCase_OneDayLateSingular = () => {
  const now = Date.now()
  const oneDayAgo = new Date(now - 1 * 24 * 60 * 60 * 1000)

  const payrolls: (Payroll & { payrollType: 'Regular' })[] = [
    {
      ...createBasePayroll('one-day-late'),
      payrollDeadline: oneDayAgo,
    },
  ]

  return (
    <div>
      <div style={{ padding: '20px', background: '#f0f0f0', marginBottom: '20px' }}>
        <h3>Expected: Should show &ldquo;1 day late&rdquo; (singular, red badge)</h3>
        <p>Tests pluralization for exactly 1 day late</p>
      </div>
      <PayrollListPresentation
        payrolls={payrolls}
        paySchedules={paySchedules}
        onRunPayroll={fn().mockName('run_payroll')}
        onSubmitPayroll={fn().mockName('submit_payroll')}
        onSkipPayroll={fn().mockName('skip_payroll')}
        showSkipSuccessAlert={false}
        onDismissSkipSuccessAlert={fn().mockName('dismiss_alert')}
        blockers={[]}
        skippingPayrollId={null}
        wireInRequests={[]}
      />
    </div>
  )
}

export const DualBadge_LateAndFailed = () => {
  const now = Date.now()
  const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000)

  const payrolls: (Payroll & { payrollType: 'Regular' })[] = [
    {
      ...createBasePayroll('late-and-failed'),
      payrollDeadline: twoDaysAgo,
      processingRequest: {
        status: 'processing_failed',
      },
    },
  ]

  return (
    <div>
      <div style={{ padding: '20px', background: '#f0f0f0', marginBottom: '20px' }}>
        <h3>
          Expected: Should show TWO badges - &ldquo;Failed&rdquo; (red) + &ldquo;2 days late&rdquo;
          (red)
        </h3>
        <p>Tests dual badge rendering for late + failed combination</p>
      </div>
      <PayrollListPresentation
        payrolls={payrolls}
        paySchedules={paySchedules}
        onRunPayroll={fn().mockName('run_payroll')}
        onSubmitPayroll={fn().mockName('submit_payroll')}
        onSkipPayroll={fn().mockName('skip_payroll')}
        showSkipSuccessAlert={false}
        onDismissSkipSuccessAlert={fn().mockName('dismiss_alert')}
        blockers={[]}
        skippingPayrollId={null}
        wireInRequests={[]}
      />
    </div>
  )
}

export const DualBadge_LateAndProcessing = () => {
  const now = Date.now()
  const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000)

  const payrolls: (Payroll & { payrollType: 'Regular' })[] = [
    {
      ...createBasePayroll('late-and-processing'),
      payrollDeadline: threeDaysAgo,
      processingRequest: { status: 'submitting' },
    },
  ]

  return (
    <div>
      <div style={{ padding: '20px', background: '#f0f0f0', marginBottom: '20px' }}>
        <h3>
          Expected: Should show TWO badges - &ldquo;Processing&rdquo; (orange) + &ldquo;3 days
          late&rdquo; (red)
        </h3>
        <p>Tests dual badge rendering for late + processing combination</p>
      </div>
      <PayrollListPresentation
        payrolls={payrolls}
        paySchedules={paySchedules}
        onRunPayroll={fn().mockName('run_payroll')}
        onSubmitPayroll={fn().mockName('submit_payroll')}
        onSkipPayroll={fn().mockName('skip_payroll')}
        showSkipSuccessAlert={false}
        onDismissSkipSuccessAlert={fn().mockName('dismiss_alert')}
        blockers={[]}
        skippingPayrollId={null}
        wireInRequests={[]}
      />
    </div>
  )
}

export const DualBadge_BothScenarios = () => {
  const now = Date.now()
  const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000)
  const fourDaysAgo = new Date(now - 4 * 24 * 60 * 60 * 1000)

  const payrolls: (Payroll & { payrollType: 'Regular' })[] = [
    {
      ...createBasePayroll('late-and-failed'),
      payrollDeadline: twoDaysAgo,
      processingRequest: {
        status: 'processing_failed',
      },
    },
    {
      ...createBasePayroll('late-and-processing'),
      payrollDeadline: fourDaysAgo,
      processingRequest: { status: 'submitting' },
      payPeriod: {
        ...createBasePayroll('late-and-processing').payPeriod,
        startDate: '2025-11-05',
        endDate: '2025-11-19',
      },
    },
  ]

  return (
    <div>
      <div style={{ padding: '20px', background: '#f0f0f0', marginBottom: '20px' }}>
        <h3>Both Dual Badge Scenarios Together</h3>
        <ul>
          <li>Row 1: &ldquo;Failed&rdquo; + &ldquo;2 days late&rdquo;</li>
          <li>Row 2: &ldquo;Processing&rdquo; + &ldquo;4 days late&rdquo;</li>
        </ul>
      </div>
      <PayrollListPresentation
        payrolls={payrolls}
        paySchedules={paySchedules}
        onRunPayroll={fn().mockName('run_payroll')}
        onSubmitPayroll={fn().mockName('submit_payroll')}
        onSkipPayroll={fn().mockName('skip_payroll')}
        showSkipSuccessAlert={false}
        onDismissSkipSuccessAlert={fn().mockName('dismiss_alert')}
        blockers={[]}
        skippingPayrollId={null}
        wireInRequests={[]}
      />
    </div>
  )
}

export const I18n_LongBadgeText = () => {
  const now = Date.now()
  const fifteenDaysAgo = new Date(now - 15 * 24 * 60 * 60 * 1000)
  const sevenDaysFromNow = new Date(now + 7 * 24 * 60 * 60 * 1000)

  const payrolls: (Payroll & { payrollType: 'Regular' })[] = [
    {
      ...createBasePayroll('wire-in-long'),
      processed: true,
      checkDate: sevenDaysFromNow.toISOString(),
      payPeriod: {
        ...createBasePayroll('wire-in-long').payPeriod,
        startDate: '2025-11-01',
        endDate: '2025-11-15',
      },
    },
    {
      ...createBasePayroll('very-late-processing'),
      processingRequest: { status: 'submitting' },
      payrollDeadline: fifteenDaysAgo,
      payPeriod: {
        ...createBasePayroll('very-late-processing').payPeriod,
        startDate: '2025-11-02',
        endDate: '2025-11-16',
      },
    },
    {
      ...createBasePayroll('very-late-failed'),
      processingRequest: {
        status: 'processing_failed',
      },
      payrollDeadline: fifteenDaysAgo,
      payPeriod: {
        ...createBasePayroll('very-late-failed').payPeriod,
        startDate: '2025-11-03',
        endDate: '2025-11-17',
      },
    },
  ]

  const wireInRequests: WireInRequest[] = [
    {
      status: 'awaiting_funds',
      paymentUuid: 'wire-in-long',
    },
  ]

  return (
    <div>
      <div style={{ padding: '20px', background: '#f0f0f0', marginBottom: '20px' }}>
        <h3>I18n Test: Long Badge Text</h3>
        <p>Tests badge layout with:</p>
        <ul>
          <li>Row 1: &ldquo;Waiting for wire in&rdquo; (long single badge)</li>
          <li>Row 2: &ldquo;Processing&rdquo; + &ldquo;15 days late&rdquo; (longer number)</li>
          <li>
            Row 3: &ldquo;Failed&rdquo; + &ldquo;15 days late&rdquo; (dual badges, longer number)
          </li>
        </ul>
        <p>
          <strong>Expected behavior:</strong> Badges should wrap cleanly when they don&rsquo;t fit
          side-by-side. Max-width of 220px should force wrapping for long combinations.
        </p>
      </div>
      <PayrollListPresentation
        payrolls={payrolls}
        paySchedules={paySchedules}
        onRunPayroll={fn().mockName('run_payroll')}
        onSubmitPayroll={fn().mockName('submit_payroll')}
        onSkipPayroll={fn().mockName('skip_payroll')}
        showSkipSuccessAlert={false}
        onDismissSkipSuccessAlert={fn().mockName('dismiss_alert')}
        blockers={[]}
        skippingPayrollId={null}
        wireInRequests={wireInRequests}
      />
    </div>
  )
}
