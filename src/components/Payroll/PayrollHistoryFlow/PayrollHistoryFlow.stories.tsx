import { action } from '@ladle/react'
import { PayrollHistoryFlow } from './PayrollHistoryFlow'

export default {
  title: 'Domain/Payroll/Flow',
}

export const PayrollHistoryFlowStory = () => {
  return <PayrollHistoryFlow companyId="7757729640288608256" onEvent={action('event')} />
}
