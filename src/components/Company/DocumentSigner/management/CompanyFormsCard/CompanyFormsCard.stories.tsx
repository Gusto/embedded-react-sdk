import { fn } from 'storybook/test'
import { CompanyFormsCard } from './CompanyFormsCard'
import { BaseComponent } from '@/components/Base'

export default {
  title: 'Domain/CompanyManagement/CompanyForms/CompanyFormsCard',
  decorators: [
    (Story: React.ComponentType) => (
      <BaseComponent onEvent={fn().mockName('onEvent')}>
        <Story />
      </BaseComponent>
    ),
  ],
}

const onEvent = fn().mockName('onEvent')

export const Default = () => <CompanyFormsCard companyId="company-123" onEvent={onEvent} />
