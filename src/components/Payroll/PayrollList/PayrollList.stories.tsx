import { useState, useCallback } from 'react'
import { fn } from 'storybook/test'
import { PayrollListPresentation } from './PayrollListPresentation'
import type { UseDateRangeFilterResult } from '@/hooks/useDateRangeFilter/useDateRangeFilter'

export default {
  title: 'Domain/Payroll/PayrollList',
}

const runPayrollAction = fn().mockName('run_payroll')
const submitPayrollAction = fn().mockName('submit_payroll')
const skipPayrollAction = fn().mockName('skip_payroll')
const deletePayrollAction = fn().mockName('delete_payroll')
const runOffCyclePayrollAction = fn().mockName('run_off_cycle_payroll')
const dismissAlertAction = fn().mockName('dismiss_alert')

const mockDateRangeFilter: UseDateRangeFilterResult = {
  filterStartDate: null,
  filterEndDate: null,
  isFilterActive: false,
  handleStartDateChange: fn().mockName('handleStartDateChange'),
  handleEndDateChange: fn().mockName('handleEndDateChange'),
  handleClearFilter: fn().mockName('handleClearFilter'),
  getApiDateParams: () => ({}),
  getMaxEndDate: () => undefined,
  getMinStartDate: () => undefined,
}

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
      onDeletePayroll={deletePayrollAction}
      onRunOffCyclePayroll={runOffCyclePayrollAction}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={dismissAlertAction}
      showDeleteSuccessAlert={false}
      onDismissDeleteSuccessAlert={dismissAlertAction}
      blockers={[]}
      skippingPayrollId={null}
      deletingPayrollId={null}
      wireInRequests={[]}
      dateRangeFilter={mockDateRangeFilter}
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
      onDeletePayroll={deletePayrollAction}
      onRunOffCyclePayroll={runOffCyclePayrollAction}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={dismissAlertAction}
      showDeleteSuccessAlert={false}
      onDismissDeleteSuccessAlert={dismissAlertAction}
      blockers={[]}
      skippingPayrollId={null}
      deletingPayrollId={null}
      wireInRequests={[]}
      dateRangeFilter={mockDateRangeFilter}
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
      onDeletePayroll={deletePayrollAction}
      onRunOffCyclePayroll={runOffCyclePayrollAction}
      showSkipSuccessAlert={true}
      onDismissSkipSuccessAlert={dismissAlertAction}
      showDeleteSuccessAlert={false}
      onDismissDeleteSuccessAlert={dismissAlertAction}
      blockers={[]}
      skippingPayrollId={null}
      deletingPayrollId={null}
      wireInRequests={[]}
      dateRangeFilter={mockDateRangeFilter}
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
      onDeletePayroll={deletePayrollAction}
      onRunOffCyclePayroll={runOffCyclePayrollAction}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={dismissAlertAction}
      showDeleteSuccessAlert={false}
      onDismissDeleteSuccessAlert={dismissAlertAction}
      blockers={[]}
      skippingPayrollId="abcd"
      deletingPayrollId={null}
      wireInRequests={[]}
      dateRangeFilter={mockDateRangeFilter}
    />
  )
}

export const PayrollListWithBlockersStory = () => {
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
      paySchedules={[]}
      onRunPayroll={runPayrollAction}
      onSubmitPayroll={submitPayrollAction}
      onSkipPayroll={skipPayrollAction}
      onDeletePayroll={deletePayrollAction}
      onRunOffCyclePayroll={runOffCyclePayrollAction}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={dismissAlertAction}
      showDeleteSuccessAlert={false}
      onDismissDeleteSuccessAlert={dismissAlertAction}
      blockers={[{ key: 'signatory_required', message: 'Signatory required' }]}
      skippingPayrollId={null}
      deletingPayrollId={null}
      wireInRequests={[]}
      dateRangeFilter={mockDateRangeFilter}
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
      onDeletePayroll={deletePayrollAction}
      onRunOffCyclePayroll={runOffCyclePayrollAction}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={dismissAlertAction}
      showDeleteSuccessAlert={false}
      onDismissDeleteSuccessAlert={dismissAlertAction}
      blockers={[]}
      skippingPayrollId={null}
      deletingPayrollId={null}
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
      dateRangeFilter={mockDateRangeFilter}
    />
  )
}

export const PayrollListWithMixedTypesStory = () => {
  return (
    <PayrollListPresentation
      payrolls={[
        {
          checkDate: '2025-08-24',
          payrollDeadline: new Date(Date.now() + 16 * 60 * 60 * 1000),
          payrollUuid: 'regular-1',
          payPeriod: {
            payScheduleUuid: '1234',
            startDate: '2025-08-13',
            endDate: '2025-08-27',
          },
        },
        {
          checkDate: '2025-09-08',
          payrollDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          payrollUuid: 'regular-2',
          payPeriod: {
            payScheduleUuid: '1234',
            startDate: '2025-08-27',
            endDate: '2025-09-10',
          },
        },
        {
          checkDate: '2025-08-20',
          payrollDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          payrollUuid: 'offcycle-1',
          offCycle: true,
          payPeriod: {
            payScheduleUuid: '1234',
            startDate: '2025-08-15',
            endDate: '2025-08-20',
          },
        },
      ]}
      paySchedules={[{ uuid: '1234', version: '1', customName: 'Engineering staff' }]}
      onRunPayroll={runPayrollAction}
      onSubmitPayroll={submitPayrollAction}
      onSkipPayroll={skipPayrollAction}
      onDeletePayroll={deletePayrollAction}
      onRunOffCyclePayroll={runOffCyclePayrollAction}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={dismissAlertAction}
      showDeleteSuccessAlert={false}
      onDismissDeleteSuccessAlert={dismissAlertAction}
      blockers={[]}
      skippingPayrollId={null}
      deletingPayrollId={null}
      wireInRequests={[]}
      dateRangeFilter={mockDateRangeFilter}
    />
  )
}

export const WithDateFilter = () => {
  const [startDate, setStartDate] = useState<Date | null>(new Date('2025-01-01'))
  const [endDate, setEndDate] = useState<Date | null>(new Date('2025-06-30'))

  const handleClear = useCallback(() => {
    setStartDate(null)
    setEndDate(null)
  }, [])

  const activeDateRangeFilter: UseDateRangeFilterResult = {
    filterStartDate: startDate,
    filterEndDate: endDate,
    isFilterActive: startDate !== null || endDate !== null,
    handleStartDateChange: setStartDate,
    handleEndDateChange: setEndDate,
    handleClearFilter: handleClear,
    getApiDateParams: () => ({
      startDate: startDate?.toISOString().split('T')[0],
      endDate: endDate?.toISOString().split('T')[0],
    }),
    getMaxEndDate: () =>
      startDate ? new Date(new Date(startDate).setMonth(startDate.getMonth() + 12)) : undefined,
    getMinStartDate: () =>
      endDate ? new Date(new Date(endDate).setMonth(endDate.getMonth() - 12)) : undefined,
  }

  return (
    <PayrollListPresentation
      payrolls={[
        {
          checkDate: '2025-03-15',
          payrollDeadline: new Date(),
          payrollUuid: 'filtered-1',
          payPeriod: { payScheduleUuid: '1234', startDate: '2025-03-01', endDate: '2025-03-14' },
        },
      ]}
      paySchedules={[{ uuid: '1234', version: '1', customName: 'Bi-weekly' }]}
      onRunPayroll={runPayrollAction}
      onSubmitPayroll={submitPayrollAction}
      onSkipPayroll={skipPayrollAction}
      onDeletePayroll={deletePayrollAction}
      onRunOffCyclePayroll={runOffCyclePayrollAction}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={dismissAlertAction}
      showDeleteSuccessAlert={false}
      onDismissDeleteSuccessAlert={dismissAlertAction}
      blockers={[]}
      skippingPayrollId={null}
      deletingPayrollId={null}
      wireInRequests={[]}
      dateRangeFilter={activeDateRangeFilter}
    />
  )
}
