import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { PayrollUpdateEmployeeCompensations } from '@gusto/embedded-api/models/components/payrollupdate'

/**
 * Serializes a prepared employee compensation into the shape the payroll update
 * endpoint expects, dropping the non-editable `Historical` payment method.
 *
 * @internal
 */
export function transformEmployeeCompensation(
  compensation: PayrollEmployeeCompensationsType,
): PayrollUpdateEmployeeCompensations {
  const { paymentMethod } = compensation
  return {
    employeeUuid: compensation.employeeUuid,
    version: compensation.version,
    excluded: compensation.excluded,
    fixedCompensations: compensation.fixedCompensations,
    hourlyCompensations: compensation.hourlyCompensations,
    paidTimeOff: compensation.paidTimeOff,
    deductions: compensation.deductions,
    ...(paymentMethod && paymentMethod !== 'Historical' ? { paymentMethod } : {}),
    memo: compensation.memo || undefined,
  }
}
