import type { StoryDefault, Story } from '@ladle/react'
import { action } from '@ladle/react'
import { DetailPresentation } from './DetailPresentation'

export default {
  title: 'Domain/Contractor/Payments',
} satisfies StoryDefault

export const PaymentDetailDefault: Story = () => {
  const mockPayments = [
    {
      id: '1',
      name: 'Fitzgerald, Ella',
      hours: 10.0,
      wage: 0,
      bonus: 0,
      reimbursement: 0,
      paymentMethod: 'Direct Deposit',
      total: 180,
    },
    {
      id: '2',
      name: 'Armstrong, Louis',
      hours: 0,
      wage: 1000,
      bonus: 0,
      reimbursement: 0,
      paymentMethod: 'Direct Deposit',
      total: 1000,
    },
  ]

  return (
    <DetailPresentation
      date="Wed, Sep 17, 2025"
      payments={mockPayments}
      onBack={action('onBack')}
      onViewPayment={action('onViewPayment')}
      onCancelPayment={action('onCancelPayment')}
    />
  )
}

PaymentDetailDefault.meta = {
  description:
    'Payment Statement Detail showing detailed payment breakdown for a specific date with all contractors and payment components',
}

export const PaymentDetailEmpty: Story = () => {
  return (
    <DetailPresentation
      date="Wed, Sep 20, 2025"
      payments={[]}
      onBack={action('onBack')}
      onViewPayment={action('onViewPayment')}
      onCancelPayment={action('onCancelPayment')}
    />
  )
}

PaymentDetailEmpty.meta = {
  description:
    'Payment Statement Detail with no payments on the selected date - displays empty state',
}
