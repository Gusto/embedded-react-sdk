import { fn } from 'storybook/test'
import { PayrollListPresentation } from './PayrollListPresentation'

export default {
  title: 'Domain/Payroll/PayrollList',
}

const runPayrollAction = fn().mockName('run_payroll')
const submitPayrollAction = fn().mockName('submit_payroll')
const skipPayrollAction = fn().mockName('skip_payroll')
const dismissAlertAction = fn().mockName('dismiss_alert')

export const PayrollListStory = () => {
  return (
    <PayrollListPresentation
      payrolls={[
        {
          checkDate: '2025-12-12',
          payrollDeadline: new Date(),
          payrollUuid: 'abcd',
          payPeriod: { payScheduleUuid: '1234', startDate: '2025-01-01', endDate: '2025-01-13' },
        },
      ]}
      paySchedules={[{ uuid: '1234', version: '1', customName: 'pay day' }]}
      onRunPayroll={runPayrollAction}
      onSubmitPayroll={submitPayrollAction}
      onSkipPayroll={skipPayrollAction}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={dismissAlertAction}
      skippingPayrollId={null}
      wireInRequests={[]}
      blockers={[]}
    />
  )
}

export const EmptyPayrollListStory = () => {
  return (
    <PayrollListPresentation
      payrolls={[]}
      paySchedules={[]}
      onRunPayroll={runPayrollAction}
      onSubmitPayroll={submitPayrollAction}
      onSkipPayroll={skipPayrollAction}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={dismissAlertAction}
      skippingPayrollId={null}
      wireInRequests={[]}
      blockers={[]}
    />
  )
}

export const PayrollListWithSkipAlertStory = () => {
  return (
    <PayrollListPresentation
      payrolls={[
        {
          checkDate: '2025-12-12',
          payrollDeadline: new Date(),
          payrollUuid: 'abcd',
          payPeriod: { payScheduleUuid: '1234', startDate: '2025-01-01', endDate: '2025-01-13' },
        },
      ]}
      paySchedules={[{ uuid: '1234', version: '1', customName: 'pay day' }]}
      onRunPayroll={runPayrollAction}
      onSubmitPayroll={submitPayrollAction}
      onSkipPayroll={skipPayrollAction}
      showSkipSuccessAlert={true}
      onDismissSkipSuccessAlert={dismissAlertAction}
      skippingPayrollId={null}
      wireInRequests={[]}
      blockers={[]}
    />
  )
}

export const PayrollListSkippingStory = () => {
  return (
    <PayrollListPresentation
      payrolls={[
        {
          checkDate: '2025-12-12',
          payrollDeadline: new Date(),
          payrollUuid: 'abcd',
          payPeriod: { payScheduleUuid: '1234', startDate: '2025-01-01', endDate: '2025-01-13' },
        },
      ]}
      paySchedules={[{ uuid: '1234', version: '1', customName: 'pay day' }]}
      onRunPayroll={runPayrollAction}
      onSubmitPayroll={submitPayrollAction}
      onSkipPayroll={skipPayrollAction}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={dismissAlertAction}
      skippingPayrollId="abcd"
      wireInRequests={[]}
      blockers={[]}
    />
  )
}

export const PayrollListWithWireInStatusesStory = () => {
  const futureDeadline = new Date(Date.now() + 12 * 60 * 60 * 1000)
  const nearDeadline = new Date(Date.now() + 2 * 60 * 60 * 1000)
  const farDeadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

  return (
    <PayrollListPresentation
      payrolls={[
        {
          checkDate: '2025-12-20',
          payrollDeadline: futureDeadline,
          payrollUuid: 'wire-1',
          processed: true,
          payPeriod: { payScheduleUuid: '1234', startDate: '2025-01-01', endDate: '2025-01-13' },
        },
        {
          checkDate: '2025-12-22',
          payrollDeadline: futureDeadline,
          payrollUuid: 'wire-2',
          processed: true,
          payPeriod: { payScheduleUuid: '1234', startDate: '2025-01-14', endDate: '2025-01-27' },
        },
        {
          checkDate: '2025-12-25',
          payrollDeadline: nearDeadline,
          payrollUuid: 'deadline-1',
          processed: false,
          payPeriod: { payScheduleUuid: '1234', startDate: '2025-01-28', endDate: '2025-02-10' },
        },
        {
          checkDate: '2025-12-30',
          payrollDeadline: farDeadline,
          payrollUuid: 'deadline-2',
          processed: false,
          payPeriod: { payScheduleUuid: '1234', startDate: '2025-02-11', endDate: '2025-02-24' },
        },
      ]}
      paySchedules={[{ uuid: '1234', version: '1', customName: 'Bi-weekly' }]}
      onRunPayroll={runPayrollAction}
      onSubmitPayroll={submitPayrollAction}
      onSkipPayroll={skipPayrollAction}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={dismissAlertAction}
      skippingPayrollId={null}
      wireInRequests={[
        {
          uuid: 'wire-req-1',
          status: 'awaiting_funds',
          paymentUuid: 'wire-1',
          wireInDeadline: futureDeadline.toISOString(),
        },
        {
          uuid: 'wire-req-2',
          status: 'pending_review',
          paymentUuid: 'wire-2',
          wireInDeadline: futureDeadline.toISOString(),
        },
      ]}
      blockers={[]}
    />
  )
}
