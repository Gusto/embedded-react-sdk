import type { Location } from '@gusto/embedded-api-v-2025-11-15/models/components/location'
import type { PrototypeConfiguration } from '../../../../prototypes/prototypeTypes'
import { RehireEmployeeFormDemo } from './RehireEmployeeFormStates'

const workLocations: Location[] = [
  {
    uuid: 'loc-1',
    country: 'US',
    street1: '123 Market St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94103',
    active: true,
  },
  {
    uuid: 'loc-2',
    country: 'US',
    street1: '500 5th Ave',
    city: 'New York',
    state: 'NY',
    zip: '10110',
    active: true,
  },
]

export const rehireEmployeeFormConfigurations: PrototypeConfiguration[] = [
  {
    slug: 'default',
    name: 'Default',
    description: 'Two work addresses to choose from.',
    render: () => (
      <RehireEmployeeFormDemo
        employee={{ uuid: 'd-1', firstName: 'Morgan', lastName: 'Diaz' }}
        workLocations={workLocations}
      />
    ),
  },
  {
    slug: 'single-location',
    name: 'Single work address',
    description: 'Only one work address available — preselected.',
    render: () => (
      <RehireEmployeeFormDemo
        employee={{ uuid: 'd-2', firstName: 'Taylor', lastName: 'Singh' }}
        workLocations={[workLocations[0]!]}
      />
    ),
  },
  {
    slug: 'submitting',
    name: 'Submitting',
    description: 'Form in its submitting state.',
    render: () => (
      <RehireEmployeeFormDemo
        employee={{ uuid: 'd-1', firstName: 'Morgan', lastName: 'Diaz' }}
        workLocations={workLocations}
        isPending
      />
    ),
  },
]
