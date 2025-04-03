import type { PayPeriod } from './PayPeriod'
import type { PayrollTotals } from './PayrollTotals'

interface PayrollConstructor {
  uuid: string
  payPeriod: PayPeriod | null
  totals: PayrollTotals | null
  processed: boolean
  checkDate: Date
  payrollDeadline: Date
  payrollStatusMeta: PayrollStatusMeta | null
}

class Payroll {
  uuid: string
  payPeriod: PayPeriod | null
  totals: PayrollTotals | null
  processed: boolean
  checkDate: Date
  payrollDeadline: Date
  payrollStatusMeta: PayrollStatusMeta | null

  constructor({
    uuid,
    payPeriod,
    totals,
    processed,
    checkDate,
    payrollDeadline,
    payrollStatusMeta,
  }: PayrollConstructor) {
    this.uuid = uuid
    this.payPeriod = payPeriod
    this.totals = totals
    this.processed = processed
    this.checkDate = checkDate
    this.payrollDeadline = payrollDeadline
    this.payrollStatusMeta = payrollStatusMeta
  }

  get expectedDebitDate(): Date {
    return this.payrollStatusMeta?.expectedDebitTime ?? this.payrollDeadline
  }
}

interface PayrollStatusMetaConstructor {
  cancellable: boolean
  payrollLate: boolean
  expectedCheckDate: Date
  initialCheckDate: Date
  expectedDebitTime: Date
  initialDebitCutoffTime: Date
}

class PayrollStatusMeta {
  cancellable: boolean
  payrollLate: boolean
  expectedCheckDate: Date
  initialCheckDate: Date
  expectedDebitTime: Date
  initialDebitCutoffTime: Date

  constructor({
    cancellable,
    payrollLate,
    expectedCheckDate,
    initialCheckDate,
    expectedDebitTime,
    initialDebitCutoffTime,
  }: PayrollStatusMetaConstructor) {
    this.cancellable = cancellable
    this.payrollLate = payrollLate
    this.expectedCheckDate = expectedCheckDate
    this.initialCheckDate = initialCheckDate
    this.expectedDebitTime = expectedDebitTime
    this.initialDebitCutoffTime = initialDebitCutoffTime
  }
}

export { Payroll, PayrollStatusMeta }
