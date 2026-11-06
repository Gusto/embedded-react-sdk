import { fn } from 'storybook/test'
import { FederalTaxesCard } from './FederalTaxesCard'
import { BaseComponent } from '@/components/Base'
import { UnstableFeaturesProvider } from '@/contexts/UnstableFeaturesProvider/UnstableFeaturesProvider'

export default {
  title: 'Domain/CompanyManagement/FederalTaxes/FederalTaxesCard',
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

export const Default = () => <FederalTaxesCard companyId="company-123" onEvent={onEvent} />
