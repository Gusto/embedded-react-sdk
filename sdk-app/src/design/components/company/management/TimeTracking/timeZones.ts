// Time sheets carry their own IANA time zone, which may differ from the viewer's.

interface ZonedParts {
  date: string
  time: string
}

export function toZonedParts(iso: string, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso))
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(part => part.type === type)?.value ?? '00'
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour')}:${get('minute')}`,
  }
}

function zoneOffsetMs(utcMs: number, timeZone: string): number {
  const { date, time } = toZonedParts(new Date(utcMs).toISOString(), timeZone)
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  const wallClockAsUtc = Date.UTC(year!, month! - 1, day!, hour!, minute!)
  return wallClockAsUtc - Math.floor(utcMs / 60000) * 60000
}

export function zonedToUtcIso(date: string, time: string, timeZone: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  const wallClockAsUtc = Date.UTC(year!, month! - 1, day!, hour!, minute!)
  const firstGuess = wallClockAsUtc - zoneOffsetMs(wallClockAsUtc, timeZone)
  const corrected = wallClockAsUtc - zoneOffsetMs(firstGuess, timeZone)
  return new Date(corrected).toISOString().replace(/\.\d{3}Z$/, 'Z')
}

export function addDaysToDateString(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number)
  const shifted = new Date(Date.UTC(year!, month! - 1, day! + days))
  return shifted.toISOString().slice(0, 10)
}

/** Times earlier than the shift's start roll to the next day so overnight shifts stay in order. */
export function resolveShiftTime(
  shiftDate: string,
  shiftStartTime: string,
  time: string,
  timeZone: string,
): string {
  const date = time < shiftStartTime ? addDaysToDateString(shiftDate, 1) : shiftDate
  return zonedToUtcIso(date, time, timeZone)
}
