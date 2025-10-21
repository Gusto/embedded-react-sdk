import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { ContractorPaymentCreatePayment } from './CreatePayment'

export default {
  title: 'Domain/ContractorPayment/Hours and Earnings',
} satisfies StoryDefault

export const CreatePaymentDefault: Story = () => {
  return <ContractorPaymentCreatePayment companyId="test-company-123" onEvent={action('onEvent')} />
}

CreatePaymentDefault.meta = {
  description:
    'Hours and Earnings page - initial state with payment date picker and contractor table ready for input',
}
