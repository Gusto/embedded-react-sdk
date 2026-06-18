import type { PrototypeConfiguration } from '../../../../prototypes/prototypeTypes'
import { AddressFormDemo } from './AddressFormStates'

export const addressFormManagementConfigurations: PrototypeConfiguration[] = [
  {
    slug: 'existing',
    name: 'Existing address',
    description: 'Edit the contractor’s home address — fields prefilled from the record.',
    render: () => (
      <AddressFormDemo
        heading="Edit address"
        description="Update Avery Garcia’s home address."
        defaultValues={{
          street1: '123 Mission St',
          street2: 'Apt 4B',
          city: 'San Francisco',
          state: 'CA',
          zip: '94103',
        }}
      />
    ),
  },
  {
    slug: 'empty',
    name: 'No address on file',
    description: 'No address on the contractor record — fields render empty.',
    render: () => (
      <AddressFormDemo heading="Edit address" description="Update Avery Garcia’s home address." />
    ),
  },
]

export const addressFormSelfOnboardingConfigurations: PrototypeConfiguration[] = [
  {
    slug: 'empty',
    name: 'Empty',
    description: 'No address on file yet — contractor fills it in from scratch.',
    render: () => (
      <AddressFormDemo
        cancelable={false}
        heading="Your home address"
        description="Please provide your current mailing address."
      />
    ),
  },
  {
    slug: 'prefilled',
    name: 'Pre-filled',
    description: 'Contractor returns to the step — address pre-populates from the prior visit.',
    render: () => (
      <AddressFormDemo
        cancelable={false}
        heading="Your home address"
        description="Please provide your current mailing address."
        defaultValues={{
          street1: '123 Mission St',
          street2: 'Apt 4B',
          city: 'San Francisco',
          state: 'CA',
          zip: '94103',
        }}
      />
    ),
  },
]
