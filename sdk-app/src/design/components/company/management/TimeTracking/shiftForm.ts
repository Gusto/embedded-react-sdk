import { z } from 'zod'
import type { BreakRule, Shift } from './types'
import { durationMinutes } from './formatters'
import { toZonedParts } from './timeZones'

export const NO_RULE = 'none'
const MINUTES_PER_DAY = 24 * 60

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours ?? 0) * 60 + (minutes ?? 0)
}

/** Minutes since the shift started, rolling times before the start onto the next day. */
function minutesFromStart(time: string, startTime: string): number {
  const offset = toMinutes(time) - toMinutes(startTime)
  return offset < 0 ? offset + MINUTES_PER_DAY : offset
}

export function addMinutesToTime(time: string, minutes: number): string {
  const total =
    (((toMinutes(time) + minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY
  const hours = Math.floor(total / 60)
  const remainder = total % 60
  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

const optionalNumber = z.preprocess(
  value => (typeof value === 'number' && !Number.isNaN(value) ? value : undefined),
  z.number().optional(),
)

/** Validation copy matches Gusto's shift drawer. */
export function createShiftFormSchema({ requiresBreakType }: { requiresBreakType: boolean }) {
  return z
    .object({
      startTime: z.string(),
      endTime: z.string(),
      isOngoing: z.boolean(),
      jobId: z.string(),
      breaks: z.array(
        z.object({
          id: z.string().optional(),
          ruleId: z.string(),
          start: z.string(),
          lengthMinutes: optionalNumber,
        }),
      ),
    })
    .superRefine((data, ctx) => {
      if (!data.startTime || (!data.isOngoing && !data.endTime)) {
        ctx.addIssue({
          code: 'custom',
          path: [data.startTime ? 'endTime' : 'startTime'],
          message: 'Enter both a start time and end time.',
        })
        return
      }
      const shiftLength = data.isOngoing ? null : minutesFromStart(data.endTime, data.startTime)
      if (shiftLength === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['endTime'],
          message: 'Hours must be entered in the order they occurred.',
        })
        return
      }

      const ranges: Array<{ start: number; end: number; index: number }> = []
      data.breaks.forEach((shiftBreak, index) => {
        const issue = (field: 'ruleId' | 'start' | 'lengthMinutes', message: string) => {
          ctx.addIssue({ code: 'custom', path: ['breaks', index, field], message })
        }
        if (requiresBreakType && shiftBreak.ruleId === NO_RULE) {
          issue('ruleId', 'Break type is required.')
        }
        if (!shiftBreak.start) {
          issue('start', 'Start time is required.')
          return
        }
        const length = shiftBreak.lengthMinutes
        if (length === undefined) {
          issue('lengthMinutes', 'Length is required.')
          return
        }
        if (!Number.isInteger(length)) {
          issue('lengthMinutes', 'Must be a whole number.')
          return
        }
        if (length < 1) {
          issue('lengthMinutes', 'Must be at least 1 minute.')
          return
        }
        if (shiftLength !== null && length > shiftLength) {
          issue('lengthMinutes', 'Cannot be longer than the shift.')
          return
        }
        const start = minutesFromStart(shiftBreak.start, data.startTime)
        if (shiftLength !== null && start + length > shiftLength) {
          issue('start', 'Must occur within the shift.')
          return
        }
        ranges.push({ start, end: start + length, index })
      })

      const sorted = [...ranges].sort((a, b) => a.start - b.start)
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i]!.start < sorted[i - 1]!.end) {
          ctx.addIssue({
            code: 'custom',
            path: ['breaks', sorted[i]!.index, 'start'],
            message: 'Overlaps with another break.',
          })
        }
      }
    })
}

export type ShiftFormInput = z.input<ReturnType<typeof createShiftFormSchema>>
export type ShiftFormValues = z.output<ReturnType<typeof createShiftFormSchema>>

/** Hours are derived from the shift times and unpaid breaks, as in Gusto's shift drawer. */
export type ShiftSubmitValues = ShiftFormValues & { hoursWorked: number | null }

export function toShiftFormValues(shift: Shift): ShiftFormInput {
  return {
    startTime: toZonedParts(shift.startTime, shift.timeZone).time,
    endTime: shift.endTime ? toZonedParts(shift.endTime, shift.timeZone).time : '',
    isOngoing: shift.endTime === null,
    jobId: shift.jobId ?? '',
    breaks: shift.breaks.map(shiftBreak => ({
      id: shiftBreak.id,
      ruleId: shiftBreak.ruleId ?? NO_RULE,
      start: toZonedParts(shiftBreak.startTime, shift.timeZone).time,
      lengthMinutes: shiftBreak.endTime
        ? durationMinutes(shiftBreak.startTime, shiftBreak.endTime)
        : undefined,
    })),
  }
}

export function newShiftFormValues({ jobId }: { jobId: string | null }): ShiftFormInput {
  return {
    startTime: '09:00',
    endTime: '17:00',
    isOngoing: false,
    jobId: jobId ?? '',
    breaks: [],
  }
}

export function ruleIdFromFormValue(value: string): string | null {
  return value === NO_RULE ? null : value
}

export function calculateWorkedHours(
  values: ShiftFormInput | ShiftFormValues,
  rules: BreakRule[],
): number | null {
  if (values.isOngoing || !values.startTime || !values.endTime) return null
  const shiftMinutes = minutesFromStart(values.endTime, values.startTime)
  const unpaidBreakMinutes = values.breaks.reduce((sum, shiftBreak) => {
    const rule = rules.find(r => r.id === shiftBreak.ruleId)
    if (rule?.isPaid) return sum
    const length = typeof shiftBreak.lengthMinutes === 'number' ? shiftBreak.lengthMinutes : 0
    return sum + Math.max(0, length)
  }, 0)
  return Math.max(0, (shiftMinutes - unpaidBreakMinutes) / 60)
}

export function calculateShiftHours(values: ShiftFormInput): number | null {
  if (values.isOngoing || !values.startTime || !values.endTime) return null
  return minutesFromStart(values.endTime, values.startTime) / 60
}
