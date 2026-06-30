import type { Employee } from '@gusto/embedded-api-v-2026-06-15/models/components/employee'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api-v-2026-06-15/models/components/payrollemployeecompensationstype'
import type { PayrollFixedCompensationTypesType } from '@gusto/embedded-api-v-2026-06-15/models/components/payrollfixedcompensationtypestype'
import type { PayScheduleShow } from '@gusto/embedded-api-v-2026-06-15/models/components/payscheduleshow'
import {
  PayrollEditEmployeePresentation,
  type WorkweekRange,
} from './PayrollEditEmployeePresentation'
import { PayrollCategory } from '@/components/Payroll/payrollTypes'

export interface PayrollEditEmployeeDemoProps {
  employee: Employee
  employeeCompensation: PayrollEmployeeCompensationsType
  fixedCompensationTypes: PayrollFixedCompensationTypesType[]
  paySchedule: PayScheduleShow
  payPeriodStartDate: string
  payrollCategory?: PayrollCategory
  hasDirectDepositSetup?: boolean
  withReimbursements?: boolean
  isRropEnabled?: boolean
  workweeks?: WorkweekRange[]
}

export function PayrollEditEmployeeDemo({
  employee,
  employeeCompensation,
  fixedCompensationTypes,
  paySchedule,
  payPeriodStartDate,
  payrollCategory = PayrollCategory.Regular,
  hasDirectDepositSetup = true,
  withReimbursements = true,
  isRropEnabled = false,
  workweeks,
}: PayrollEditEmployeeDemoProps) {
  return (
    <PayrollEditEmployeePresentation
      onSave={() => {}}
      onCancel={() => {}}
      employee={employee}
      employeeCompensation={employeeCompensation}
      fixedCompensationTypes={fixedCompensationTypes}
      payPeriodStartDate={payPeriodStartDate}
      paySchedule={paySchedule}
      payrollCategory={payrollCategory}
      hasDirectDepositSetup={hasDirectDepositSetup}
      withReimbursements={withReimbursements}
      isRropEnabled={isRropEnabled}
      workweeks={workweeks}
    />
  )
}
