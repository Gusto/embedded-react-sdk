import type { GustoEmbeddedCore } from '@gusto/embedded-api/core'
import { timeTrackingGetCompaniesCompanyUuidTimeTrackingTimeSheets } from '@gusto/embedded-api/funcs/timeTrackingGetCompaniesCompanyUuidTimeTrackingTimeSheets'
import { unwrapAsync } from '@gusto/embedded-api/types/fp'
import type { EmbeddedTimeSheet } from '@gusto/embedded-api/models/components/embeddedtimesheet'
import {
  resolvePayScheduleEmployees,
  type PayScheduleEmployeeResolution,
} from './resolvePayScheduleEmployees'

export interface PayPeriodShiftsParams {
  companyId: string
  payScheduleUuid: string
  /** Pay period start date, `YYYY-MM-DD`. */
  periodStartDate: string
  /** Pay period end date, `YYYY-MM-DD`. */
  periodEndDate: string
}

export interface PayPeriodShiftsResult extends PayScheduleEmployeeResolution {
  shifts: EmbeddedTimeSheet[]
}

// Pure calendar-date arithmetic done entirely in UTC -- never mixed with a local-time read,
// so this doesn't fall into the new Date(dateOnlyString) footgun documented in the main SDK's
// dateFormatting.ts. It's just "what's the date N days from this YYYY-MM-DD string".
function addDays(dateString: string, days: number): string {
  const [yearPart, monthPart, dayPart] = dateString.split('-')
  const year = Number(yearPart)
  const month = Number(monthPart)
  const day = Number(dayPart)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}

function localStartDate(shiftStartedAt: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(shiftStartedAt)
}

async function fetchAllShiftsForEmployees(
  client: GustoEmbeddedCore,
  params: {
    companyId: string
    employeeUuids: string[]
    shiftStartedAfter: string
    shiftStartedBefore: string
  },
): Promise<EmbeddedTimeSheet[]> {
  const perPage = 100
  const all: EmbeddedTimeSheet[] = []
  let page = 1
  let totalPages = 1
  do {
    const result = await unwrapAsync(
      timeTrackingGetCompaniesCompanyUuidTimeTrackingTimeSheets(client, {
        companyUuid: params.companyId,
        entityType: 'Employee',
        entityUuids: params.employeeUuids,
        shiftStartedAfter: params.shiftStartedAfter,
        shiftStartedBefore: params.shiftStartedBefore,
        page,
        per: perPage,
      }),
    )
    all.push(...(result.embeddedTimeSheets ?? []))
    totalPages = Number(result.httpMeta.response.headers.get('x-total-pages') ?? 1)
    page += 1
  } while (page <= totalPages)
  return all
}

/**
 * `time_tracking/time_sheets` has no pay-schedule or pay-period filter, only person/date/status
 * filters. Resolve who's on the schedule, fetch with timestamp bounds padded a day on each side
 * (wide enough for any IANA offset), then keep only shifts whose *local* start date -- using
 * each shift's own `timeZone` -- falls within the requested period. This matches how payroll
 * sync attributes overnight shifts, instead of naively UTC-bounding the query (which is wrong
 * for roughly half of IANA zones).
 */
export async function fetchPayPeriodShifts(
  client: GustoEmbeddedCore,
  { companyId, payScheduleUuid, periodStartDate, periodEndDate }: PayPeriodShiftsParams,
): Promise<PayPeriodShiftsResult> {
  const { resolvedEmployees, unresolvedEmployees } = await resolvePayScheduleEmployees(
    client,
    companyId,
  )

  const employeeUuids = resolvedEmployees
    .filter(e => e.payScheduleUuid === payScheduleUuid)
    .map(e => e.uuid)

  if (employeeUuids.length === 0) {
    return { resolvedEmployees, unresolvedEmployees, shifts: [] }
  }

  const allShifts = await fetchAllShiftsForEmployees(client, {
    companyId,
    employeeUuids,
    shiftStartedAfter: `${addDays(periodStartDate, -1)}T00:00:00Z`,
    shiftStartedBefore: `${addDays(periodEndDate, 1)}T23:59:59Z`,
  })

  const shifts = allShifts.filter(shift => {
    if (!shift.shiftStartedAt) return false
    const localDate = localStartDate(shift.shiftStartedAt, shift.timeZone ?? 'UTC')
    return localDate >= periodStartDate && localDate <= periodEndDate
  })

  return { resolvedEmployees, unresolvedEmployees, shifts }
}
