import { action } from '@ladle/react'
import { PayrollOverview } from './PayrollOverview'

export default {
  title: 'Domain/Payroll/PayrollOverview',
}

export const PayrollOverviewStory = () => {
  return <PayrollOverview onEdit={action('edit')} onSubmit={action('submit')} />
}
