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
