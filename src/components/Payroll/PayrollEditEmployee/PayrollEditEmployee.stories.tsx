import { action } from '@ladle/react'
import { PayrollEditEmployeePresentation } from './PayrollEditEmployeePresentation'

export default {
  title: 'Domain/Payroll/PayrollEditEmployee',
}

export const PayrollEditEmployeeStory = () => {
  return <PayrollEditEmployeePresentation onDone={action('done')} />
}
