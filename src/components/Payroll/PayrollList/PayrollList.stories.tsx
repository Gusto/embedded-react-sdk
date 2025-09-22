import { action } from '@ladle/react'
import { PayrollListPresentation } from './PayrollListPresentation'

export default {
  title: 'Domain/Payroll/PayrollList',
}

export const PayrollListStory = () => {
  return (
    <PayrollListPresentation
      payrolls={[
        {
          checkDate: '2025-12-12',
          payrollDeadline: new Date(),
          payrollType: 'Regular',
          payrollUuid: 'abcd',
          payPeriod: { payScheduleUuid: '1234', startDate: '2025-01-01', endDate: '2025-01-13' },
        },
      ]}
      paySchedules={[{ uuid: '1234', version: '1', customName: 'pay day' }]}
      onRunPayroll={action('run_payroll')}
    />
  )
}

export const EmptyPayrollListStory = () => {
  return (
    <PayrollListPresentation payrolls={[]} paySchedules={[]} onRunPayroll={action('run_payroll')} />
  )
}
