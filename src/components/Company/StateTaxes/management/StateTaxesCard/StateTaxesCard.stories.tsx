import { fn } from 'storybook/test'
import { StateTaxesCard } from './StateTaxesCard'
import { BaseComponent } from '@/components/Base'

export default {
  title: 'Domain/CompanyManagement/StateTaxes/StateTaxesCard',
  decorators: [
    (Story: React.ComponentType) => (
      <BaseComponent onEvent={fn().mockName('onEvent')}>
        <Story />
      </BaseComponent>
    ),
  ],
}

const onEvent = fn().mockName('onEvent')

export const Default = () => <StateTaxesCard companyId="company-123" onEvent={onEvent} />
