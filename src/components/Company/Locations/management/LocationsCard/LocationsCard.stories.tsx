import { fn } from 'storybook/test'
import { LocationsCard } from './LocationsCard'
import { BaseComponent } from '@/components/Base'
import { UnstableFeaturesProvider } from '@/contexts/UnstableFeaturesProvider/UnstableFeaturesProvider'

export default {
  title: 'Domain/CompanyManagement/Locations/LocationsCard',
  decorators: [
    (Story: React.ComponentType) => (
      <UnstableFeaturesProvider value={{ companySettingsDashboard: true }}>
        <BaseComponent onEvent={fn().mockName('onEvent')}>
          <Story />
        </BaseComponent>
      </UnstableFeaturesProvider>
    ),
  ],
}

const onEvent = fn().mockName('onEvent')

export const Default = () => <LocationsCard companyId="company-123" onEvent={onEvent} />
