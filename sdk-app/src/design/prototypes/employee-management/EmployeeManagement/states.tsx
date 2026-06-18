import type { PrototypeComponent } from '../../prototypeTypes'
import { employeeListConfigurations } from '../../../components/employee/management/EmployeeList/EmployeeListConfigurations'
import { rehireEmployeeFormConfigurations } from '../../../components/employee/management/RehireEmployeeForm/RehireEmployeeFormConfigurations'

export const components: PrototypeComponent[] = [
  {
    slug: 'employee-list',
    name: 'Employee List',
    description: 'Tabbed list of a company\u2019s employees with per-row actions.',
    configurations: employeeListConfigurations,
  },
  {
    slug: 'rehire-form',
    name: 'Rehire Employee Form',
    description: 'Form to schedule a rehire for a dismissed employee.',
    configurations: rehireEmployeeFormConfigurations,
  },
]
