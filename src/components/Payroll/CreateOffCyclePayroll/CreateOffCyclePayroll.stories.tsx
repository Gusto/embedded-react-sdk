import { fn } from 'storybook/test'
import { CreateOffCyclePayroll } from './CreateOffCyclePayroll'

export default {
  title: 'Domain/Payroll/OffCycle/CreateOffCyclePayroll',
}

export const Default = () => (
  <CreateOffCyclePayroll companyId="test-company-uuid" onEvent={fn().mockName('onEvent')} />
)
