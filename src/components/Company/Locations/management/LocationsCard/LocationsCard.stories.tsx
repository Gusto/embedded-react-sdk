import { fn } from 'storybook/test'
import { LocationsCard } from './LocationsCard'
import { BaseComponent } from '@/components/Base'

export default {
  title: 'Domain/CompanyManagement/Locations/LocationsCard',
  decorators: [
    (Story: React.ComponentType) => (
      <BaseComponent onEvent={fn().mockName('onEvent')}>
        <Story />
      </BaseComponent>
    ),
  ],
}

const onEvent = fn().mockName('onEvent')

export const Default = () => <LocationsCard companyId="company-123" onEvent={onEvent} />
