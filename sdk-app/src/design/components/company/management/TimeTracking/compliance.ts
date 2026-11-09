import type { BreakRule, Shift, ShiftBreak } from './types'
import { durationMinutes } from './formatters'

// The API exposes no exception flags, so missed and shortened breaks are derived client-side.

export interface ShortenedBreak {
  shiftBreak: ShiftBreak
  rule: BreakRule
}

export interface ShiftCompliance {
  missingBreaks: BreakRule[]
  shortenedBreaks: ShortenedBreak[]
}

function requiredRules(rules: BreakRule[], shiftMinutes: number): BreakRule[] {
  return rules.flatMap(rule => {
    if (rule.breakType === 'rest') {
      const count = Math.floor(shiftMinutes / rule.afterHoursWorkedMinutes)
      return Array.from({ length: count }, () => rule)
    }
    return shiftMinutes >= rule.afterHoursWorkedMinutes ? [rule] : []
  })
}

export function shiftCompliance(shift: Shift): ShiftCompliance {
  const rules = shift.breakPolicy?.rules ?? []
  if (rules.length === 0 || !shift.endTime) return { missingBreaks: [], shortenedBreaks: [] }

  const shiftMinutes = durationMinutes(shift.startTime, shift.endTime)
  const missingBreaks: BreakRule[] = []
  const shortenedBreaks: ShortenedBreak[] = []

  for (const breakType of ['meal', 'rest'] as const) {
    const required = requiredRules(
      rules.filter(rule => rule.breakType === breakType),
      shiftMinutes,
    )
    const taken = shift.breaks.filter(shiftBreak => shiftBreak.breakType === breakType)
    required.forEach((rule, index) => {
      const shiftBreak = taken[index]
      if (!shiftBreak) {
        missingBreaks.push(rule)
      } else if (durationMinutes(shiftBreak.startTime, shiftBreak.endTime) < rule.durationMinutes) {
        shortenedBreaks.push({ shiftBreak, rule })
      }
    })
  }

  return { missingBreaks, shortenedBreaks }
}
