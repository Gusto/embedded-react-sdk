import type { PrototypeComponent } from '../prototypeTypes'
import { payrollConfigurationRropConfigurations } from '../../components/payroll/PayrollConfigurationRrop/PayrollConfigurationRropConfigurations'
import { payrollEditEmployeeConfigurations } from '../../components/payroll/PayrollEditEmployee/PayrollEditEmployeeConfigurations'

export const components: PrototypeComponent[] = [
  {
    slug: 'payroll-configuration-rrop',
    name: 'Payroll Configuration',
    description: 'Regular rate of pay scenarios for the payroll configuration screen.',
    configurations: payrollConfigurationRropConfigurations,
  },
  {
    slug: 'regular-rate-of-pay',
    name: 'Edit employee',
    description: 'Regular rate of pay scenarios for the payroll edit-employee form.',
    configurations: payrollEditEmployeeConfigurations,
  },
]
