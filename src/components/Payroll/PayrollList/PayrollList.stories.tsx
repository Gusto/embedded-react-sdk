import { action } from '@ladle/react'
import { PayrollListPresentation } from './PayrollListPresentation'

export default {
  title: 'Domain/Payroll/PayrollList',
}

export const PayrollListStory = () => {
  return (
    <PayrollListPresentation
      payrolls={[{ payrollId: 'abcd' }]}
      onRunPayroll={action('run_payroll')}
    />
  )
}
