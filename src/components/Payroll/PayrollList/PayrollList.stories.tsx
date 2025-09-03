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
          payrollUuid: 'abcd',
          payPeriod: { payScheduleUuid: '1234', startDate: '1/1/2025', endDate: '1/13/2025' },
        },
      ]}
      paySchedules={[{ uuid: '1234', version: '1', customName: 'pay day' }]}
      onRunPayroll={action('run_payroll')}
    />
  )
}
