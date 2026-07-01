import type { EmployeeCompensations } from '@gusto/embedded-api-v-2026-02-01/models/components/payroll'
import type { Employee } from '@gusto/embedded-api-v-2026-02-01/models/components/employee'
import type { PayrollPayPeriodType } from '@gusto/embedded-api-v-2026-02-01/models/components/payrollpayperiodtype'
import type { PayScheduleShow } from '@gusto/embedded-api-v-2026-02-01/models/components/payscheduleshow'
import type { PayrollFixedCompensationTypesType } from '@gusto/embedded-api-v-2026-02-01/models/components/payrollfixedcompensationtypestype'
import { PayrollConfigurationRropPresentation } from './PayrollConfigurationRropPresentation'
import { PayrollCategory } from '@/components/Payroll/payrollTypes'

export interface PayrollConfigurationRropDemoProps {
  employeeCompensations: EmployeeCompensations[]
  employeeDetails: Employee[]
  fixedCompensationTypes?: PayrollFixedCompensationTypesType[]
  payPeriod?: PayrollPayPeriodType
  paySchedule?: PayScheduleShow
  payrollCategory?: PayrollCategory
  rrop?: boolean
}

export function PayrollConfigurationRropDemo({
  employeeCompensations,
  employeeDetails,
  fixedCompensationTypes = [],
  payPeriod,
  paySchedule,
  payrollCategory = PayrollCategory.Regular,
  rrop = false,
}: PayrollConfigurationRropDemoProps) {
  return (
    <PayrollConfigurationRropPresentation
      employeeCompensations={employeeCompensations}
      employeeDetails={employeeDetails}
      fixedCompensationTypes={fixedCompensationTypes}
      payPeriod={payPeriod}
      paySchedule={paySchedule}
      payrollCategory={payrollCategory}
      onCalculatePayroll={() => {}}
      onViewBlockers={() => {}}
      rrop={rrop}
    />
  )
}
