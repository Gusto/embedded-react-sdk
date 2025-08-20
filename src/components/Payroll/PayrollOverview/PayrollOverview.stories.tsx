import { action } from '@ladle/react'
import { PayrollOverviewPresentation } from './PayrollOverviewPresentation'

export default {
  title: 'Domain/Payroll/PayrollOverview',
}

export const PayrollOverviewStory = () => {
  return <PayrollOverviewPresentation onEdit={action('edit')} onSubmit={action('submit')} />
}
