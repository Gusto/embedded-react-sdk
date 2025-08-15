import { action } from '@ladle/react'
import { PayrollEditEmployee } from './PayrollEditEmployee'

export default {
  title: 'Domain/Payroll/PayrollEditEmployee',
}

export const PayrollEditEmployeeStory = () => {
  return <PayrollEditEmployee onDone={action('done')} />
}
