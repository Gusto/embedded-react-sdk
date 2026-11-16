import { fn } from 'storybook/test'
import { BankAccountCard } from './BankAccountCard'
import { BaseComponent } from '@/components/Base'

export default {
  title: 'Domain/CompanyManagement/BankAccount/BankAccountCard',
  decorators: [
    (Story: React.ComponentType) => (
      <BaseComponent onEvent={fn().mockName('onEvent')}>
        <Story />
      </BaseComponent>
    ),
  ],
}

const onEvent = fn().mockName('onEvent')

export const Default = () => <BankAccountCard companyId="company-123" onEvent={onEvent} />
