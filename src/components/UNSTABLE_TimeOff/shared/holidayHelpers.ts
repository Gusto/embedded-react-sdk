import type { TFunction } from 'i18next'
import type { HolidayItem } from '../HolidaySelectionForm/HolidaySelectionFormTypes'

type HolidayDateRule =
  | { type: 'fixed'; month: number; day: number }
  | { type: 'nthWeekday'; month: number; weekday: number; nth: number }
  | { type: 'lastWeekday'; month: number; weekday: number }

interface FederalHolidayDef {
  key: string
  dateRule: HolidayDateRule
}

const MONDAY = 1
const THURSDAY = 4

export const FEDERAL_HOLIDAYS: FederalHolidayDef[] = [
  { key: 'newYearsDay', dateRule: { type: 'fixed', month: 0, day: 1 } },
  { key: 'mlkDay', dateRule: { type: 'nthWeekday', month: 0, weekday: MONDAY, nth: 3 } },
  { key: 'presidentsDay', dateRule: { type: 'nthWeekday', month: 1, weekday: MONDAY, nth: 3 } },
  { key: 'memorialDay', dateRule: { type: 'lastWeekday', month: 4, weekday: MONDAY } },
  { key: 'juneteenth', dateRule: { type: 'fixed', month: 5, day: 19 } },
  { key: 'independenceDay', dateRule: { type: 'fixed', month: 6, day: 4 } },
  { key: 'laborDay', dateRule: { type: 'nthWeekday', month: 8, weekday: MONDAY, nth: 1 } },
  { key: 'columbusDay', dateRule: { type: 'nthWeekday', month: 9, weekday: MONDAY, nth: 2 } },
  { key: 'veteransDay', dateRule: { type: 'fixed', month: 10, day: 11 } },
  { key: 'thanksgiving', dateRule: { type: 'nthWeekday', month: 10, weekday: THURSDAY, nth: 4 } },
  { key: 'christmasDay', dateRule: { type: 'fixed', month: 11, day: 25 } },
]

export const FEDERAL_HOLIDAY_KEYS = FEDERAL_HOLIDAYS.map(h => h.key)

function getNthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date {
  const first = new Date(year, month, 1)
  const firstWeekday = first.getDay()
  let day = 1 + ((weekday - firstWeekday + 7) % 7)
  day += (nth - 1) * 7
  return new Date(year, month, day)
}

function getLastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  const lastDay = new Date(year, month + 1, 0)
  const lastDayWeekday = lastDay.getDay()
  const diff = (lastDayWeekday - weekday + 7) % 7
  return new Date(year, month, lastDay.getDate() - diff)
}

function computeDate(rule: HolidayDateRule, year: number): Date {
  switch (rule.type) {
    case 'fixed':
      return new Date(year, rule.month, rule.day)
    case 'nthWeekday':
      return getNthWeekdayOfMonth(year, rule.month, rule.weekday, rule.nth)
    case 'lastWeekday':
      return getLastWeekdayOfMonth(year, rule.month, rule.weekday)
  }
}

export function getNextObservationDate(holidayKey: string, referenceDate: Date = new Date()): Date {
  const holiday = FEDERAL_HOLIDAYS.find(h => h.key === holidayKey)
  if (!holiday) {
    throw new Error(`Unknown holiday key: ${holidayKey}`)
  }

  const year = referenceDate.getFullYear()
  const thisYear = computeDate(holiday.dateRule, year)

  const refDateOnly = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  )

  if (thisYear >= refDateOnly) {
    return thisYear
  }
  return computeDate(holiday.dateRule, year + 1)
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const HOLIDAY_NAME_KEYS = {
  newYearsDay: 'holidays.newYearsDay.name',
  mlkDay: 'holidays.mlkDay.name',
  presidentsDay: 'holidays.presidentsDay.name',
  memorialDay: 'holidays.memorialDay.name',
  juneteenth: 'holidays.juneteenth.name',
  independenceDay: 'holidays.independenceDay.name',
  laborDay: 'holidays.laborDay.name',
  columbusDay: 'holidays.columbusDay.name',
  veteransDay: 'holidays.veteransDay.name',
  thanksgiving: 'holidays.thanksgiving.name',
  christmasDay: 'holidays.christmasDay.name',
} as const

const HOLIDAY_DATE_KEYS = {
  newYearsDay: 'holidays.newYearsDay.observedDate',
  mlkDay: 'holidays.mlkDay.observedDate',
  presidentsDay: 'holidays.presidentsDay.observedDate',
  memorialDay: 'holidays.memorialDay.observedDate',
  juneteenth: 'holidays.juneteenth.observedDate',
  independenceDay: 'holidays.independenceDay.observedDate',
  laborDay: 'holidays.laborDay.observedDate',
  columbusDay: 'holidays.columbusDay.observedDate',
  veteransDay: 'holidays.veteransDay.observedDate',
  thanksgiving: 'holidays.thanksgiving.observedDate',
  christmasDay: 'holidays.christmasDay.observedDate',
} as const

export function getDefaultHolidayItems(
  t: TFunction<'Company.TimeOff.HolidayPolicy'>,
  referenceDate?: Date,
): HolidayItem[] {
  return FEDERAL_HOLIDAYS.map(holiday => ({
    uuid: holiday.key,
    name: t(HOLIDAY_NAME_KEYS[holiday.key as keyof typeof HOLIDAY_NAME_KEYS]),
    observedDate: t(HOLIDAY_DATE_KEYS[holiday.key as keyof typeof HOLIDAY_DATE_KEYS]),
    nextObservation: formatDate(getNextObservationDate(holiday.key, referenceDate)),
  }))
}

interface FederalHolidaySelection {
  selected: boolean
}

type FederalHolidaysPayload = Record<string, FederalHolidaySelection>

export function buildFederalHolidaysPayload(selectedKeys: Set<string>): FederalHolidaysPayload {
  const payload: FederalHolidaysPayload = {}
  for (const holiday of FEDERAL_HOLIDAYS) {
    payload[holiday.key] = { selected: selectedKeys.has(holiday.key) }
  }
  return payload
}
