import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '@/test/constants'

interface FieldMeta {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required: boolean
  enumValues?: string[]
}

function getVariant(): string {
  if (typeof window !== 'undefined' && window.__TEST_VARIANT) {
    return window.__TEST_VARIANT
  }
  return 'all-present'
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

const HOLIDAY_PAY_POLICY_FIELDS: FieldMeta[] = [
  { name: 'version', type: 'string', required: true },
  { name: 'company_uuid', type: 'string', required: true },
  { name: 'federal_holidays', type: 'object', required: true },
  { name: 'employees', type: 'array', required: true },
]

const HOLIDAY_NAMES = [
  'new_years_day',
  'mlk_day',
  'presidents_day',
  'memorial_day',
  'juneteenth',
  'independence_day',
  'labor_day',
  'columbus_day',
  'veterans_day',
  'thanksgiving',
  'christmas_day',
]

const fullFederalHolidays: Record<string, unknown> = {
  new_years_day: { selected: true, name: "New Year's Day", date: '2026-01-01' },
  mlk_day: { selected: true, name: 'Martin Luther King Jr. Day', date: '2026-01-19' },
  presidents_day: { selected: false, name: "Presidents' Day", date: '2026-02-16' },
  memorial_day: { selected: true, name: 'Memorial Day', date: '2026-05-25' },
  juneteenth: { selected: true, name: 'Juneteenth', date: '2026-06-19' },
  independence_day: { selected: true, name: 'Independence Day', date: '2026-07-04' },
  labor_day: { selected: true, name: 'Labor Day', date: '2026-09-07' },
  columbus_day: { selected: false, name: 'Columbus Day', date: '2026-10-12' },
  veterans_day: { selected: true, name: 'Veterans Day', date: '2026-11-11' },
  thanksgiving: { selected: true, name: 'Thanksgiving Day', date: '2026-11-26' },
  christmas_day: { selected: true, name: 'Christmas Day', date: '2026-12-25' },
}

const fullHolidayPayPolicy: Record<string, unknown> = {
  version: 'holiday-v1',
  company_uuid: 'test-company-uuid',
  federal_holidays: fullFederalHolidays,
  employees: [{ uuid: 'emp-uuid-001' }, { uuid: 'emp-uuid-002' }],
}

function buildHolidayVariant(variant: string): Record<string, unknown> {
  const topLevelResult = applyVariant(fullHolidayPayPolicy, HOLIDAY_PAY_POLICY_FIELDS, variant)

  if (variant.startsWith('holiday-null:')) {
    const holidayName = variant.replace('holiday-null:', '')
    const holidays = { ...fullFederalHolidays }
    if (holidayName in holidays) {
      ;(holidays as Record<string, unknown>)[holidayName] = null
    }
    return { ...fullHolidayPayPolicy, federal_holidays: holidays }
  }

  if (variant.startsWith('holiday-absent:')) {
    const holidayName = variant.replace('holiday-absent:', '')
    const { [holidayName]: _removed, ...holidays } = fullFederalHolidays
    return { ...fullHolidayPayPolicy, federal_holidays: holidays }
  }

  if (variant === 'holiday-selected-null') {
    const holidays: Record<string, unknown> = {}
    for (const name of HOLIDAY_NAMES) {
      holidays[name] = {
        selected: null,
        name: (fullFederalHolidays[name] as Record<string, unknown>).name,
        date: (fullFederalHolidays[name] as Record<string, unknown>).date,
      }
    }
    return { ...fullHolidayPayPolicy, federal_holidays: holidays }
  }

  if (variant === 'holiday-selected-string') {
    const holidays: Record<string, unknown> = {}
    for (const name of HOLIDAY_NAMES) {
      const entry = fullFederalHolidays[name] as Record<string, unknown>
      holidays[name] = { selected: String(entry.selected), name: entry.name, date: entry.date }
    }
    return { ...fullHolidayPayPolicy, federal_holidays: holidays }
  }

  if (variant === 'empty:federal_holidays') {
    return { ...fullHolidayPayPolicy, federal_holidays: [] }
  }

  if (variant === 'empty:employees') {
    return { ...fullHolidayPayPolicy, employees: [] }
  }

  return topLevelResult
}

export function getHolidayPayPolicyVariants(): string[] {
  const variants = ['all-present', 'all-absent', 'all-null']
  variants.push('empty:federal_holidays')
  variants.push('empty:employees')
  for (const name of HOLIDAY_NAMES) {
    variants.push(`holiday-null:${name}`)
    variants.push(`holiday-absent:${name}`)
  }
  variants.push('holiday-selected-null')
  variants.push('holiday-selected-string')
  return variants
}

const getHolidayPayPolicy = http.get(
  `${API_BASE_URL}/v1/companies/:company_id/holiday_pay_policy`,
  () => HttpResponse.json(buildHolidayVariant(getVariant())),
)

const createHolidayPayPolicy = http.post(
  `${API_BASE_URL}/v1/companies/:company_id/holiday_pay_policy`,
  () => HttpResponse.json(buildHolidayVariant(getVariant())),
)

const updateHolidayPayPolicy = http.put(
  `${API_BASE_URL}/v1/companies/:company_id/holiday_pay_policy`,
  () => HttpResponse.json(buildHolidayVariant(getVariant())),
)

const deleteHolidayPayPolicy = http.delete(
  `${API_BASE_URL}/v1/companies/:company_id/holiday_pay_policy`,
  () => new HttpResponse(null, { status: 204 }),
)

const addEmployeesToHolidayPayPolicy = http.put(
  `${API_BASE_URL}/v1/companies/:company_id/holiday_pay_policy/add`,
  () => HttpResponse.json(buildHolidayVariant(getVariant())),
)

const removeEmployeesFromHolidayPayPolicy = http.put(
  `${API_BASE_URL}/v1/companies/:company_id/holiday_pay_policy/remove`,
  () => HttpResponse.json(buildHolidayVariant(getVariant())),
)

const HolidayPayPolicyHandlers = [
  getHolidayPayPolicy,
  createHolidayPayPolicy,
  updateHolidayPayPolicy,
  deleteHolidayPayPolicy,
  addEmployeesToHolidayPayPolicy,
  removeEmployeesFromHolidayPayPolicy,
]

export default HolidayPayPolicyHandlers
