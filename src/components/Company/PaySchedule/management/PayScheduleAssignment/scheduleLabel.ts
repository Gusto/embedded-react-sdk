import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'

/** @internal */
export function scheduleLabel(schedule: PayScheduleShow): string {
  return [schedule.customName, schedule.frequency].filter(Boolean).join(' — ')
}
