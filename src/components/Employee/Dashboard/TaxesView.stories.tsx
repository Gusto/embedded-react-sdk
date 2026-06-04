import { fn } from 'storybook/test'
import { TaxesView } from './TaxesView'
import { BaseComponent } from '@/components/Base'

export default {
  title: 'Domain/Employee/Dashboard/TaxesView',
  decorators: [
    (Story: React.ComponentType) => (
      <BaseComponent onEvent={fn().mockName('onEvent')}>
        <Story />
      </BaseComponent>
    ),
  ],
}

const onEvent = fn().mockName('onEvent')

export const Default = () => <TaxesView employeeId="employee-1" onEvent={onEvent} />
