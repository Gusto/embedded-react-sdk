export type FundRecoveryStatus = 'eligible' | 'window_closed'

export interface PayrollOption {
  uuid: string
  payPeriodStart: string
  payPeriodEnd: string
  checkDate: string
  type: 'Regular' | 'Off-cycle'
  employeeCount: number
  totalAmount: string
  fundRecoveryStatus: FundRecoveryStatus
  fundRecoveryDeadline?: string
}

export interface EmployeeOption {
  uuid: string
  firstName: string
  lastName: string
  department: string
  netPay: string
}

export interface ReversalRecord {
  reversed_payroll_uuid: string
  reversal_payroll_uuid: string | null
  reason: string
  approved_at: string | null
  category: string | null
  reversed_employee_uuids: string[]
  // Display hint — pay period label for payrolls not in the reversible list
  _payPeriodLabel?: string
}

export const REVERSAL_CATEGORY_LABELS: Record<string, string> = {
  convert_check_ee_requested: 'Employee requested',
  incorrect_payroll: 'Incorrect payroll',
  duplicate_payment: 'Duplicate payment',
  wrong_pay_period: 'Wrong pay period',
  system_error: 'System error',
  other: 'Other',
}
