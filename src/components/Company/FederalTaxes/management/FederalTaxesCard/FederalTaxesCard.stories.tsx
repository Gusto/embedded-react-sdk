import { fn } from 'storybook/test'
import { FederalTaxesCard } from './FederalTaxesCard'
import { BaseComponent } from '@/components/Base'

export default {
  title: 'Domain/CompanyManagement/FederalTaxes/FederalTaxesCard',
  decorators: [
    (Story: React.ComponentType) => (
      <BaseComponent onEvent={fn().mockName('onEvent')}>
        <Story />
      </BaseComponent>
    ),
  ],
}

const onEvent = fn().mockName('onEvent')

export const Default = () => <FederalTaxesCard companyId="company-123" onEvent={onEvent} />
