import type { EmbeddedTimeSheet } from '@gusto/embedded-api/models/components/embeddedtimesheet'

export interface EmployeeHoursTotal {
  entityUuid: string
  /** Sum of `entries[].hoursWorked` across every shift passed in. */
  totalHours: number
  entryCount: number
}

/**
 * There's no period-aggregate endpoint, so totals come from summing `entries[].hoursWorked`
 * across the shifts {@link fetchPayPeriodShifts} already resolved for the period.
 *
 * This is a straight sum of recorded hours, not Gusto's classified regular/OT/double-OT split
 * -- that calculation only happens at payroll sync and isn't something this workaround attempts
 * to reproduce client-side.
 */
export function aggregatePayPeriodHours(shifts: EmbeddedTimeSheet[]): EmployeeHoursTotal[] {
  const totals = new Map<string, number>()
  const counts = new Map<string, number>()

  for (const shift of shifts) {
    if (!shift.entityUuid) continue
    for (const entry of shift.entries ?? []) {
      const hours = Number(entry.hoursWorked ?? 0)
      totals.set(shift.entityUuid, (totals.get(shift.entityUuid) ?? 0) + hours)
      counts.set(shift.entityUuid, (counts.get(shift.entityUuid) ?? 0) + 1)
    }
  }

  return [...totals.entries()].map(([entityUuid, totalHours]) => ({
    entityUuid,
    totalHours,
    entryCount: counts.get(entityUuid) ?? 0,
  }))
}
