import { z } from 'zod'
import type { BreakRule, Shift } from './types'
import { formatHours } from './formatters'
import { toZonedParts } from './timeZones'

export const NO_RULE = 'none'
const MINUTES_PER_DAY = 24 * 60

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours ?? 0) * 60 + (minutes ?? 0)
}

/** Minutes since clock-in, rolling times before clock-in onto the next day. */
function minutesFromStart(time: string, startTime: string): number {
  const offset = toMinutes(time) - toMinutes(startTime)
  return offset < 0 ? offset + MINUTES_PER_DAY : offset
}

export const shiftFormSchema = z
  .object({
    clockIn: z.string().min(1, 'Clock-in time is required'),
    clockOut: z.string(),
    isOngoing: z.boolean(),
    breaks: z.array(
      z.object({
        id: z.string().optional(),
        ruleId: z.string(),
        start: z.string().min(1, 'Start time is required'),
        end: z.string(),
      }),
    ),
    entries: z.array(
      z.object({
        id: z.string().optional(),
        classification: z.enum(['Regular', 'Overtime', 'Double overtime', 'Unclassified']),
        hours: z.number({ error: 'Hours are required' }).min(0.001, 'Hours must be greater than 0'),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    if (!data.isOngoing && !data.clockOut) {
      ctx.addIssue({ code: 'custom', path: ['clockOut'], message: 'Clock-out time is required' })
      return
    }
    const shiftLength = data.isOngoing ? null : minutesFromStart(data.clockOut, data.clockIn)
    if (shiftLength === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['clockOut'],
        message: 'Clock-out must be after clock-in',
      })
      return
    }

    const ranges = data.breaks.map((shiftBreak, index) => {
      const start = minutesFromStart(shiftBreak.start, data.clockIn)
      const end = shiftBreak.end ? minutesFromStart(shiftBreak.end, data.clockIn) : null
      if (!shiftBreak.end && !data.isOngoing) {
        ctx.addIssue({
          code: 'custom',
          path: ['breaks', index, 'end'],
          message: 'End time is required once the shift has ended',
        })
      }
      if (shiftLength !== null && start >= shiftLength) {
        ctx.addIssue({
          code: 'custom',
          path: ['breaks', index, 'start'],
          message: 'You cannot start a break after your shift',
        })
      }
      if (end !== null && end <= start) {
        ctx.addIssue({
          code: 'custom',
          path: ['breaks', index, 'end'],
          message: 'You cannot end a break before it starts',
        })
      } else if (end !== null && shiftLength !== null && end > shiftLength) {
        ctx.addIssue({
          code: 'custom',
          path: ['breaks', index, 'end'],
          message: 'You cannot end a break after your shift',
        })
      }
      return { start, end: end ?? Number.POSITIVE_INFINITY, index }
    })

    const sorted = [...ranges].sort((a, b) => a.start - b.start)
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i]!.start < sorted[i - 1]!.end) {
        ctx.addIssue({
          code: 'custom',
          path: ['breaks', sorted[i]!.index, 'start'],
          message: 'Breaks cannot overlap',
        })
      }
    }

    if (shiftLength !== null) {
      const enteredMinutes = data.entries.reduce((sum, entry) => sum + entry.hours * 60, 0)
      if (enteredMinutes > shiftLength + 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['entries'],
          message: `Hours don’t fit in the time entered. The shift is ${formatHours(shiftLength / 60)} long.`,
        })
      }
    }
  })

export type ShiftFormValues = z.infer<typeof shiftFormSchema>

export function toShiftFormValues(shift: Shift): ShiftFormValues {
  return {
    clockIn: toZonedParts(shift.startTime, shift.timeZone).time,
    clockOut: shift.endTime ? toZonedParts(shift.endTime, shift.timeZone).time : '',
    isOngoing: shift.endTime === null,
    breaks: shift.breaks.map(shiftBreak => ({
      id: shiftBreak.id,
      ruleId: shiftBreak.ruleId ?? NO_RULE,
      start: toZonedParts(shiftBreak.startTime, shift.timeZone).time,
      end: shiftBreak.endTime ? toZonedParts(shiftBreak.endTime, shift.timeZone).time : '',
    })),
    entries: shift.entries.map(entry => ({
      id: entry.id,
      classification: entry.classification,
      hours: entry.hours,
    })),
  }
}

export function ruleIdFromFormValue(value: string): string | null {
  return value === NO_RULE ? null : value
}

/** Shift length minus unpaid breaks, in hours — what a single "hours worked" entry should be. */
export function calculateWorkedHours(values: ShiftFormValues, rules: BreakRule[]): number | null {
  if (values.isOngoing || !values.clockIn || !values.clockOut) return null
  const shiftMinutes = minutesFromStart(values.clockOut, values.clockIn)
  const unpaidBreakMinutes = values.breaks.reduce((sum, shiftBreak) => {
    if (!shiftBreak.start || !shiftBreak.end) return sum
    const rule = rules.find(r => r.id === shiftBreak.ruleId)
    if (rule?.isPaid) return sum
    const length =
      minutesFromStart(shiftBreak.end, values.clockIn) -
      minutesFromStart(shiftBreak.start, values.clockIn)
    return sum + Math.max(0, length)
  }, 0)
  return Math.max(0, (shiftMinutes - unpaidBreakMinutes) / 60)
}
