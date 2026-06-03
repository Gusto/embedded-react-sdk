import { fn } from 'storybook/test'
import type { EmployeeWorkAddress } from '@gusto/embedded-api-v-2025-11-15/models/components/employeeworkaddress'
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
const onManageWorkAddress = fn().mockName('onManageWorkAddress')

const EMPLOYEE_ID = 'employee-123'

const workAddress: EmployeeWorkAddress = {
  uuid: 'work-address-1',
  version: '1',
  country: 'USA',
  street1: '2216 Icie Villages',
  city: 'Big Delta',
  state: 'AK',
  zip: '99737',
}

export const Loading = () => (
  <BasicDetailsView employeeId={EMPLOYEE_ID} onEvent={onEvent} isLoading />
)

export const WithAllDetails = () => (
  <BasicDetailsView
    employeeId={EMPLOYEE_ID}
    onEvent={onEvent}
    currentWorkAddress={workAddress}
    onManageWorkAddress={onManageWorkAddress}
  />
)

export const WithoutAddresses = () => (
  <BasicDetailsView
    employeeId={EMPLOYEE_ID}
    onEvent={onEvent}
    onManageWorkAddress={onManageWorkAddress}
  />
)
