import { fn } from 'storybook/test'
import { SignatoryCard } from './SignatoryCard'
import { BaseComponent } from '@/components/Base'

export default {
  title: 'Domain/CompanyManagement/Signatory/SignatoryCard',
  decorators: [
    (Story: React.ComponentType) => (
      <BaseComponent onEvent={fn().mockName('onEvent')}>
        <Story />
      </BaseComponent>
    ),
  ],
}

const onEvent = fn().mockName('onEvent')

export const Default = () => <SignatoryCard companyId="company-123" onEvent={onEvent} />
