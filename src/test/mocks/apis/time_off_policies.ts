import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/test/constants'

declare global {
  interface Window {
    __TEST_VARIANT?: string
  }
}

interface FieldMeta {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required: boolean
  enumValues?: string[]
}

function applyVariant(
  base: Record<string, unknown>,
  fields: FieldMeta[],
  variant: string,
): Record<string, unknown> {
  const result = { ...base }

  if (variant === 'all-present') return result

  if (variant === 'all-absent') {
    const requiredKeys = new Set(fields.filter(f => f.required).map(f => f.name))
    return Object.fromEntries(Object.entries(result).filter(([key]) => requiredKeys.has(key)))
  }

  if (variant === 'all-null') {
    for (const f of fields) {
      if (!f.required) result[f.name] = null
    }
    return result
  }

  const nullMatch = variant.match(/^null:(.+)$/)
  if (nullMatch) {
    result[nullMatch[1]!] = null
    return result
  }

  const typeMatch = variant.match(/^type:(.+)=(.+)$/)
  if (typeMatch) {
    const [, field, coercion] = typeMatch
    const current = result[field!]
    if (coercion === 'number' && typeof current === 'string') result[field!] = parseFloat(current)
    if (coercion === 'string' && typeof current === 'number') result[field!] = String(current)
    if (coercion === 'string' && typeof current === 'boolean') result[field!] = String(current)
    if (coercion === 'number' && typeof current === 'boolean') result[field!] = current ? 1 : 0
    return result
  }

  const emptyMatch = variant.match(/^empty:(.+)$/)
  if (emptyMatch) {
    result[emptyMatch[1]!] = []
    return result
  }

  const enumMatch = variant.match(/^enum:(.+)=(.+)$/)
  if (enumMatch) {
    result[enumMatch[1]!] = enumMatch[2]
    return result
  }

  return result
}

function getVariant(): string {
  if (typeof window !== 'undefined' && window.__TEST_VARIANT) {
    return window.__TEST_VARIANT
  }
  return 'all-present'
}

const TIME_OFF_POLICY_FIELDS: FieldMeta[] = [
  { name: 'uuid', type: 'string', required: true },
  { name: 'company_uuid', type: 'string', required: true },
  { name: 'name', type: 'string', required: true },
  { name: 'policy_type', type: 'string', required: true, enumValues: ['vacation', 'sick'] },
  { name: 'accrual_method', type: 'string', required: true },
  { name: 'is_active', type: 'boolean', required: true },
  { name: 'employees', type: 'array', required: true },
  { name: 'accrual_rate', type: 'string', required: false },
  { name: 'accrual_rate_unit', type: 'string', required: false },
  { name: 'paid_out_on_termination', type: 'boolean', required: false },
  { name: 'accrual_waiting_period_days', type: 'number', required: false },
  { name: 'carryover_limit_hours', type: 'string', required: false },
  { name: 'max_accrual_hours_per_year', type: 'string', required: false },
  { name: 'max_hours', type: 'string', required: false },
  { name: 'complete', type: 'boolean', required: false },
  { name: 'version', type: 'string', required: false },
]

const TIME_OFF_ACTIVITY_FIELDS: FieldMeta[] = [
  { name: 'policy_uuid', type: 'string', required: false },
  { name: 'time_off_type', type: 'string', required: false, enumValues: ['vacation', 'sick'] },
  { name: 'policy_name', type: 'string', required: false },
  { name: 'event_type', type: 'string', required: false },
  { name: 'event_description', type: 'string', required: false },
  { name: 'effective_time', type: 'string', required: false },
  { name: 'balance', type: 'string', required: false },
  { name: 'balance_change', type: 'string', required: false },
]

const ACCRUING_HOUR_FIELDS: FieldMeta[] = [
  { name: 'time_off_policy_uuid', type: 'string', required: false },
  { name: 'hours', type: 'string', required: false },
]

const fullTimeOffPolicy: Record<string, unknown> = {
  uuid: 'policy-uuid-001',
  company_uuid: 'test-company-uuid',
  name: 'Vacation Policy',
  policy_type: 'vacation',
  accrual_method: 'per_pay_period',
  accrual_rate: '3.08',
  accrual_rate_unit: '1.0',
  paid_out_on_termination: true,
  accrual_waiting_period_days: 90,
  carryover_limit_hours: '40.0',
  max_accrual_hours_per_year: '80.0',
  max_hours: '120.0',
  complete: true,
  version: 'abc123version',
  is_active: true,
  employees: [{ uuid: 'emp-uuid-001' }, { uuid: 'emp-uuid-002' }, { uuid: 'emp-uuid-003' }],
}

const fullTimeOffActivity: Record<string, unknown> = {
  policy_uuid: 'policy-uuid-001',
  time_off_type: 'vacation',
  policy_name: 'Vacation Policy',
  event_type: 'used',
  event_description: 'Used 8.0 hours of vacation',
  effective_time: '2025-12-15T00:00:00Z',
  balance: '72.0',
  balance_change: '-8.0',
}

const fullAccruingHour: Record<string, unknown> = {
  time_off_policy_uuid: 'policy-uuid-001',
  hours: '3.08',
}

export function getTimeOffPolicyVariants(): string[] {
  const variants = ['all-present', 'all-absent', 'all-null']
  for (const f of TIME_OFF_POLICY_FIELDS) {
    if (!f.required) variants.push(`null:${f.name}`)
  }
  variants.push('type:accrual_rate=number')
  variants.push('type:accrual_waiting_period_days=string')
  variants.push('type:paid_out_on_termination=string')
  variants.push('type:complete=string')
  variants.push('empty:employees')
  variants.push('enum:policy_type=custom')
  variants.push('enum:policy_type=pto')
  return variants
}

export function getTimeOffActivityVariants(): string[] {
  const variants = ['all-present', 'all-absent', 'all-null']
  for (const f of TIME_OFF_ACTIVITY_FIELDS) {
    if (!f.required) variants.push(`null:${f.name}`)
  }
  variants.push('type:balance=number')
  variants.push('type:balance_change=number')
  variants.push('enum:time_off_type=custom')
  return variants
}

export function getAccruingHourVariants(): string[] {
  const variants = ['all-present', 'all-absent', 'all-null']
  for (const f of ACCRUING_HOUR_FIELDS) {
    if (!f.required) variants.push(`null:${f.name}`)
  }
  variants.push('type:hours=number')
  return variants
}

const getTimeOffPoliciesAll = http.get(
  `${API_BASE_URL}/v1/companies/:company_id/time_off_policies`,
  () => {
    const variant = getVariant()
    const policy = applyVariant(fullTimeOffPolicy, TIME_OFF_POLICY_FIELDS, variant)
    return HttpResponse.json([policy])
  },
)

const getTimeOffPolicy = http.get(`${API_BASE_URL}/v1/time_off_policies/:policy_id`, () => {
  const variant = getVariant()
  const policy = applyVariant(fullTimeOffPolicy, TIME_OFF_POLICY_FIELDS, variant)
  return HttpResponse.json(policy)
})

const createTimeOffPolicy = http.post(
  `${API_BASE_URL}/v1/companies/:company_id/time_off_policies`,
  () => {
    const variant = getVariant()
    const policy = applyVariant(
      { ...fullTimeOffPolicy, uuid: 'newly-created-policy-uuid', employees: [] },
      TIME_OFF_POLICY_FIELDS,
      variant,
    )
    return HttpResponse.json(policy)
  },
)

const updateTimeOffPolicy = http.put(`${API_BASE_URL}/v1/time_off_policies/:policy_id`, () => {
  const variant = getVariant()
  const policy = applyVariant(fullTimeOffPolicy, TIME_OFF_POLICY_FIELDS, variant)
  return HttpResponse.json(policy)
})

const deactivateTimeOffPolicy = http.put(
  `${API_BASE_URL}/v1/time_off_policies/:policy_id/deactivate`,
  () => {
    const variant = getVariant()
    const policy = applyVariant(
      { ...fullTimeOffPolicy, is_active: false },
      TIME_OFF_POLICY_FIELDS,
      variant,
    )
    return HttpResponse.json(policy)
  },
)

const addEmployeesToTimeOffPolicy = http.put(
  `${API_BASE_URL}/v1/time_off_policies/:policy_id/add_employees`,
  () => {
    const variant = getVariant()
    const policy = applyVariant(fullTimeOffPolicy, TIME_OFF_POLICY_FIELDS, variant)
    return HttpResponse.json(policy)
  },
)

const removeEmployeesFromTimeOffPolicy = http.put(
  `${API_BASE_URL}/v1/time_off_policies/:policy_id/remove_employees`,
  () => {
    const variant = getVariant()
    const policy = applyVariant(fullTimeOffPolicy, TIME_OFF_POLICY_FIELDS, variant)
    return HttpResponse.json(policy)
  },
)

const updateTimeOffPolicyBalance = http.put(
  `${API_BASE_URL}/v1/time_off_policies/:policy_id/balance`,
  () => {
    const variant = getVariant()
    const policy = applyVariant(fullTimeOffPolicy, TIME_OFF_POLICY_FIELDS, variant)
    return HttpResponse.json(policy)
  },
)

const getEmployeeTimeOffActivities = http.get(
  `${API_BASE_URL}/v1/employees/:employee_id/time_off_activities`,
  () => {
    const variant = getVariant()
    const activity = applyVariant(fullTimeOffActivity, TIME_OFF_ACTIVITY_FIELDS, variant)
    return HttpResponse.json(activity)
  },
)

const calculateAccruingTimeOffHours = http.post(
  `${API_BASE_URL}/v1/payrolls/:payroll_id/employees/:employee_id/calculate_accruing_time_off_hours`,
  () => {
    const variant = getVariant()
    const hour = applyVariant(fullAccruingHour, ACCRUING_HOUR_FIELDS, variant)
    return HttpResponse.json({ hours_earned: [hour] })
  },
)

const TimeOffPolicyHandlers = [
  getTimeOffPoliciesAll,
  getTimeOffPolicy,
  createTimeOffPolicy,
  updateTimeOffPolicy,
  deactivateTimeOffPolicy,
  addEmployeesToTimeOffPolicy,
  removeEmployeesFromTimeOffPolicy,
  updateTimeOffPolicyBalance,
  getEmployeeTimeOffActivities,
  calculateAccruingTimeOffHours,
]

export default TimeOffPolicyHandlers
