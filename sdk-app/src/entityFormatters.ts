export interface RawEmployee {
  uuid?: string
  first_name?: string | null
  last_name?: string | null
}

export interface RawContractor {
  uuid?: string
  type?: string
  first_name?: string | null
  last_name?: string | null
  business_name?: string | null
}

export interface RawPayroll {
  uuid?: string
  payroll_uuid?: string
  check_date?: string
  pay_period?: { start_date?: string; end_date?: string }
  processed?: boolean
}

export interface RawForm {
  uuid?: string
  name?: string | null
  title?: string | null
}

export interface RawInformationRequest {
  uuid?: string
  type?: string | null
  status?: string
  blocking_payroll?: boolean
}

export interface RawContractorPaymentGroup {
  uuid?: string
  check_date?: string
  status?: string
  totals?: { amount?: string }
}

export interface EntityOption {
  value: string
  primary: string
  secondary: string
  badge?: { label: string; tone: 'processed' | 'unprocessed' }
}

export function formatPayPeriod(payroll: RawPayroll): string {
  const start = payroll.pay_period?.start_date
  const end = payroll.pay_period?.end_date
  if (start && end) return `${start} – ${end}`
  if (payroll.check_date) return `Check date ${payroll.check_date}`
  return 'Payroll'
}

export function formatContractor(contractor: RawContractor): string {
  if (contractor.type === 'Business') {
    return contractor.business_name || 'Business contractor'
  }
  const name = [contractor.first_name, contractor.last_name].filter(Boolean).join(' ').trim()
  return name || 'Contractor'
}

export function formatEmployee(employee: RawEmployee): string {
  const name = [employee.first_name, employee.last_name].filter(Boolean).join(' ').trim()
  return name || 'Employee'
}

export function formatForm(form: RawForm): string {
  return form.title || form.name || 'Form'
}

export function formatPaymentGroup(group: RawContractorPaymentGroup): string {
  const date = group.check_date ? `Check date ${group.check_date}` : 'Payment'
  return group.totals?.amount ? `${date} · $${group.totals.amount}` : date
}

export function formatInformationRequestType(type: string | null | undefined): string {
  if (!type) return 'Information request'
  return type
    .split(/[_\s]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
