import { Suspense } from 'react'
import { fn } from 'storybook/test'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import { BasicDetailsView } from './BasicDetailsView'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Employee.Dashboard')
  return <>{children}</>
}

export default {
  title: 'Domain/Employee/Dashboard/BasicDetailsView',
  decorators: [
    (Story: React.ComponentType) => (
      <Suspense fallback={<div>Loading translations...</div>}>
        <I18nLoader>
          <Story />
        </I18nLoader>
      </Suspense>
    ),
  ],
}

const onEditBasicDetails = fn().mockName('onEditBasicDetails')
const onManageHomeAddress = fn().mockName('onManageHomeAddress')
const onManageWorkAddress = fn().mockName('onManageWorkAddress')

const employee: Employee = {
  uuid: 'employee-123',
  firstName: 'Isom',
  lastName: 'Jaskolski',
  paymentMethod: 'Direct Deposit',
  email: 'isom.jaskolski@example.com',
  dateOfBirth: '1986-06-25',
  hasSsn: true,
  jobs: [{ uuid: 'job-1', title: 'Software Engineer', hireDate: '2020-01-20' }],
}

const homeAddress: EmployeeAddress = {
  uuid: 'home-address-1',
  version: '1',
  country: 'USA',
  street1: '100 5th Ave',
  city: 'New York',
  state: 'NY',
  zip: '10001',
}

const workAddress: EmployeeWorkAddress = {
  uuid: 'work-address-1',
  version: '1',
  country: 'USA',
  street1: '2216 Icie Villages',
  city: 'Big Delta',
  state: 'AK',
  zip: '99737',
}

export const Loading = () => <BasicDetailsView isLoading />

export const WithAllDetails = () => (
  <BasicDetailsView
    employee={employee}
    currentHomeAddress={homeAddress}
    currentWorkAddress={workAddress}
    onEditBasicDetails={onEditBasicDetails}
    onManageHomeAddress={onManageHomeAddress}
    onManageWorkAddress={onManageWorkAddress}
  />
)

export const WithoutAddresses = () => (
  <BasicDetailsView
    employee={employee}
    onEditBasicDetails={onEditBasicDetails}
    onManageHomeAddress={onManageHomeAddress}
    onManageWorkAddress={onManageWorkAddress}
  />
)
