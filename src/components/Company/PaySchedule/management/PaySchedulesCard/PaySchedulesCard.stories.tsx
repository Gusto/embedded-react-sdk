import { fn } from 'storybook/test'
import { PaySchedulesCard } from './PaySchedulesCard'
import { BaseComponent } from '@/components/Base'

export default {
  title: 'Domain/CompanyManagement/PaySchedule/PaySchedulesCard',
  decorators: [
    (Story: React.ComponentType) => (
      <BaseComponent onEvent={fn().mockName('onEvent')}>
        <Story />
      </BaseComponent>
    ),
  ],
}

const onEvent = fn().mockName('onEvent')

export const Default = () => <PaySchedulesCard companyId="company-123" onEvent={onEvent} />
