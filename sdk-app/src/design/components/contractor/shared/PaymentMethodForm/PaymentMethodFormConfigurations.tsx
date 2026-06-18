import type { PrototypeConfiguration } from '../../../../prototypes/prototypeTypes'
import { PaymentMethodFormDemo } from './PaymentMethodFormStates'

export const paymentMethodFormManagementConfigurations: PrototypeConfiguration[] = [
  {
    slug: 'check',
    name: 'Check',
    description: 'Contractor receives a paper check — bank account fields hidden.',
    render: () => (
      <PaymentMethodFormDemo
        heading="Payment method"
        description="Edit how Avery Garcia gets paid."
        defaultValues={{
          type: 'Check',
          name: '',
          routingNumber: '',
          accountNumber: '',
          accountType: 'Checking',
        }}
      />
    ),
  },
  {
    slug: 'direct-deposit-existing',
    name: 'Direct deposit (existing bank account)',
    description:
      'Direct deposit with a bank account already on file. Account number renders as the masked default.',
    render: () => (
      <PaymentMethodFormDemo
        heading="Payment method"
        description="Edit how Avery Garcia gets paid."
        defaultValues={{
          type: 'Direct Deposit',
          name: 'Primary checking',
          routingNumber: '110000000',
          accountNumber: 'XXXXXX1234',
          accountType: 'Checking',
        }}
      />
    ),
  },
]

export const paymentMethodFormSelfOnboardingConfigurations: PrototypeConfiguration[] = [
  {
    slug: 'check-default',
    name: 'Check',
    description: 'Default state — Check selected, bank account fields hidden.',
    render: () => (
      <PaymentMethodFormDemo
        heading="Set up your payment method"
        description="Choose how you’d like to get paid."
        defaultValues={{
          type: 'Check',
          name: '',
          routingNumber: '',
          accountNumber: '',
          accountType: 'Checking',
        }}
      />
    ),
  },
  {
    slug: 'direct-deposit-empty',
    name: 'Direct deposit, empty fields',
    description: 'Direct deposit selected with no bank account on file — all fields empty.',
    render: () => (
      <PaymentMethodFormDemo
        heading="Set up your payment method"
        description="Choose how you’d like to get paid."
        defaultValues={{
          type: 'Direct Deposit',
          name: '',
          routingNumber: '',
          accountNumber: '',
          accountType: 'Checking',
        }}
      />
    ),
  },
  {
    slug: 'direct-deposit-existing',
    name: 'Direct deposit, existing bank account',
    description:
      'Returning contractor with a bank account already on file — account number renders as masked default.',
    render: () => (
      <PaymentMethodFormDemo
        heading="Set up your payment method"
        description="Choose how you’d like to get paid."
        defaultValues={{
          type: 'Direct Deposit',
          name: 'Primary checking',
          routingNumber: '110000000',
          accountNumber: 'XXXXXX1234',
          accountType: 'Checking',
        }}
      />
    ),
  },
]
