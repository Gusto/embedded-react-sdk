import { fn } from 'storybook/test'
import { TaxPaymentsCard } from './TaxPaymentsCard'
import { BaseComponent } from '@/components/Base'

export default {
  title: 'Domain/CompanyManagement/TaxPayments/TaxPaymentsCard',
  decorators: [
    (Story: React.ComponentType) => (
      <BaseComponent onEvent={fn().mockName('onEvent')}>
        <Story />
      </BaseComponent>
    ),
  ],
}

const onEvent = fn().mockName('onEvent')

export const Default = () => <TaxPaymentsCard companyId="company-123" onEvent={onEvent} />
