import type { Employee } from '@gusto/embedded-api-v-2025-11-15/models/components/employee'
import type { Location } from '@gusto/embedded-api-v-2025-11-15/models/components/location'
import type { PrototypeComponent } from '../../prototypeTypes'
import { EmployeeListDemo } from '../../../components/employee/management/EmployeeList/EmployeeListStates'
import { RehireEmployeeForm } from '../../../components/employee/management/RehireEmployeeForm/RehireEmployeeForm'

function buildEmployee(overrides: Partial<Employee>): Employee {
  return {
    uuid: 'employee-uuid',
    firstName: 'Avery',
    lastName: 'Lin',
    onboarded: true,
    onboardingStatus: 'onboarding_completed',
    jobs: [
      {
        uuid: 'job-uuid',
        version: 'job-version',
        employeeUuid: 'employee-uuid',
        currentCompensationUuid: 'comp-uuid',
        paymentUnit: 'Year',
        primary: true,
        twoPercentShareholder: false,
        title: 'Software Engineer',
        rate: '95000',
        hireDate: '2023-04-10',
      },
    ],
    ...overrides,
  } as Employee
}

const activeEmployees: Employee[] = [
  buildEmployee({ uuid: 'e-1', firstName: 'Avery', lastName: 'Lin' }),
  buildEmployee({
    uuid: 'e-2',
    firstName: 'Jordan',
    lastName: 'Park',
    jobs: [
      {
        uuid: 'job-2',
        version: 'job-version',
        employeeUuid: 'e-2',
        currentCompensationUuid: 'comp-2',
        paymentUnit: 'Hour',
        primary: true,
        twoPercentShareholder: false,
        title: 'Barista',
        rate: '22',
        hireDate: '2024-02-01',
      },
    ],
  }),
  buildEmployee({
    uuid: 'e-3',
    firstName: 'Sam',
    lastName: 'Rivera',
    jobs: [
      {
        uuid: 'job-3',
        version: 'job-version',
        employeeUuid: 'e-3',
        currentCompensationUuid: 'comp-3',
        paymentUnit: 'Year',
        primary: true,
        twoPercentShareholder: false,
        title: 'Design Lead',
        rate: '140000',
        hireDate: '2022-08-15',
      },
    ],
  }),
]

const onboardingEmployees: Employee[] = [
  buildEmployee({
    uuid: 'o-1',
    firstName: 'Riley',
    lastName: 'Nguyen',
    onboarded: false,
    onboardingStatus: 'admin_onboarding_incomplete',
    jobs: [
      {
        uuid: 'o-job-1',
        version: 'job-version',
        employeeUuid: 'o-1',
        currentCompensationUuid: 'o-comp-1',
        paymentUnit: 'Year',
        primary: true,
        twoPercentShareholder: false,
        title: 'Account Manager',
        rate: '72000',
        hireDate: '2026-07-01',
      },
    ],
  }),
  buildEmployee({
    uuid: 'o-2',
    firstName: 'Casey',
    lastName: 'Brooks',
    onboarded: false,
    onboardingStatus: 'self_onboarding_pending_invite',
    jobs: [
      {
        uuid: 'o-job-2',
        version: 'job-version',
        employeeUuid: 'o-2',
        currentCompensationUuid: 'o-comp-2',
        paymentUnit: 'Hour',
        primary: true,
        twoPercentShareholder: false,
        title: 'Line Cook',
        rate: '24',
        hireDate: '2026-06-22',
      },
    ],
  }),
]

const dismissedEmployees: Employee[] = [
  buildEmployee({
    uuid: 'd-1',
    firstName: 'Morgan',
    lastName: 'Diaz',
    terminations: [{ uuid: 'term-1', effectiveDate: '2026-02-14' }],
  }),
  buildEmployee({
    uuid: 'd-2',
    firstName: 'Taylor',
    lastName: 'Singh',
    jobs: [
      {
        uuid: 'd-job-2',
        version: 'job-version',
        employeeUuid: 'd-2',
        currentCompensationUuid: 'd-comp-2',
        paymentUnit: 'Hour',
        primary: true,
        twoPercentShareholder: false,
        title: 'Server',
        rate: '18',
        hireDate: '2023-11-01',
      },
    ],
    terminations: [{ uuid: 'term-2', effectiveDate: '2025-12-30' }],
  }),
] as Employee[]

const workLocations: Location[] = [
  {
    uuid: 'loc-1',
    country: 'US',
    street1: '123 Market St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94103',
    active: true,
  },
  {
    uuid: 'loc-2',
    country: 'US',
    street1: '500 5th Ave',
    city: 'New York',
    state: 'NY',
    zip: '10110',
    active: true,
  },
]

export const components: PrototypeComponent[] = [
  {
    slug: 'employee-list',
    name: 'Employee List',
    description: 'Tabbed list of a company\u2019s employees with per-row actions.',
    configurations: [
      {
        slug: 'active-populated',
        name: 'Active — populated',
        description: 'Three active employees with primary jobs.',
        render: () => <EmployeeListDemo employees={activeEmployees} initialTab="active" />,
      },
      {
        slug: 'onboarding',
        name: 'Onboarding',
        description: 'Two employees mid-onboarding with status badges.',
        render: () => <EmployeeListDemo employees={onboardingEmployees} initialTab="onboarding" />,
      },
      {
        slug: 'dismissed',
        name: 'Dismissed',
        description: 'Dismissed employees with rehire action available.',
        render: () => <EmployeeListDemo employees={dismissedEmployees} initialTab="dismissed" />,
      },
      {
        slug: 'empty',
        name: 'Empty',
        description: 'No employees on the active tab.',
        render: () => <EmployeeListDemo employees={[]} initialTab="active" />,
      },
    ],
  },
  {
    slug: 'rehire-form',
    name: 'Rehire Employee Form',
    description: 'Form to schedule a rehire for a dismissed employee.',
    configurations: [
      {
        slug: 'default',
        name: 'Default',
        description: 'Two work addresses to choose from.',
        render: () => (
          <RehireEmployeeForm
            employee={{ uuid: 'd-1', firstName: 'Morgan', lastName: 'Diaz' }}
            workLocations={workLocations}
            onCancel={() => {}}
            onSubmit={() => {}}
          />
        ),
      },
      {
        slug: 'single-location',
        name: 'Single work address',
        description: 'Only one work address available — preselected.',
        render: () => (
          <RehireEmployeeForm
            employee={{ uuid: 'd-2', firstName: 'Taylor', lastName: 'Singh' }}
            workLocations={[workLocations[0]!]}
            onCancel={() => {}}
            onSubmit={() => {}}
          />
        ),
      },
      {
        slug: 'submitting',
        name: 'Submitting',
        description: 'Form in its submitting state.',
        render: () => (
          <RehireEmployeeForm
            employee={{ uuid: 'd-1', firstName: 'Morgan', lastName: 'Diaz' }}
            workLocations={workLocations}
            isPending
            onCancel={() => {}}
            onSubmit={() => {}}
          />
        ),
      },
    ],
  },
]
