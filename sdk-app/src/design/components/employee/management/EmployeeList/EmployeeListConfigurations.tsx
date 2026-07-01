import type { Employee } from '@gusto/embedded-api-v-2026-02-01/models/components/employee'
import type { PrototypeConfiguration } from '../../../../prototypes/prototypeTypes'
import { EmployeeListDemo } from './EmployeeListStates'

function build(overrides: Partial<Employee>): Employee {
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
  build({ uuid: 'e-1', firstName: 'Avery', lastName: 'Lin' }),
  build({
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
  build({
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
  build({
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
  build({
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
  build({
    uuid: 'd-1',
    firstName: 'Morgan',
    lastName: 'Diaz',
    terminations: [{ uuid: 'term-1', effectiveDate: '2026-02-14' }],
  }),
  build({
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

export const employeeListConfigurations: PrototypeConfiguration[] = [
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
]
