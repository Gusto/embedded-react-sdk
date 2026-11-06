import { fn } from 'storybook/test'
import { IndustryCard } from './IndustryCard'
import { BaseComponent } from '@/components/Base'
import { UnstableFeaturesProvider } from '@/contexts/UnstableFeaturesProvider/UnstableFeaturesProvider'

export default {
  title: 'Domain/CompanyManagement/Industry/IndustryCard',
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

export const Default = () => <IndustryCard companyId="company-123" onEvent={onEvent} />
