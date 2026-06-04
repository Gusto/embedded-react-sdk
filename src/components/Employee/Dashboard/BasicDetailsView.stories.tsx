import { fn } from 'storybook/test'
import { BasicDetailsView } from './BasicDetailsView'
import { BaseComponent } from '@/components/Base'

export default {
  title: 'Domain/Employee/Dashboard/BasicDetailsView',
  decorators: [
    (Story: React.ComponentType) => (
      <BaseComponent onEvent={fn().mockName('onEvent')}>
        <Story />
      </BaseComponent>
    ),
  ],
}

const onEvent = fn().mockName('onEvent')

const EMPLOYEE_ID = 'employee-123'

export const Default = () => <BasicDetailsView employeeId={EMPLOYEE_ID} onEvent={onEvent} />
