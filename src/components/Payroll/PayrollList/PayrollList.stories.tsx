import { action } from '@ladle/react'
import { PayrollList } from './PayrollList'

export default {
  title: 'Domain/Payroll/PayrollList',
}

export const PayrollListStory = () => {
  return <PayrollList payrolls={[{ payrollId: 'abcd' }]} onRunPayroll={action('run_payroll')} />
}
