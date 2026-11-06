import { fn } from 'storybook/test'
import { IndustryCard } from './IndustryCard'
import { BaseComponent } from '@/components/Base'

export default {
  title: 'Domain/CompanyManagement/Industry/IndustryCard',
  decorators: [
    (Story: React.ComponentType) => (
      <BaseComponent onEvent={fn().mockName('onEvent')}>
        <Story />
      </BaseComponent>
    ),
  ],
}

const onEvent = fn().mockName('onEvent')

export const Default = () => <IndustryCard companyId="company-123" onEvent={onEvent} />
