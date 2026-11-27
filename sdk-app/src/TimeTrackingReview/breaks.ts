import {
  addDays,
  minutesBetween,
  zonedParts,
  zonedToUtcIso,
  type ApiBreak,
  type ApiBreakRule,
  type ApiShift,
} from './model'

export interface BreakDraft {
  key: string
  uuid?: string
  rule: ApiBreakRule | null
  start: string
  end: string | null
}

export function addMinutes(iso: string, minutes: number) {
  return new Date(Date.parse(iso) + minutes * 60000).toISOString().replace('.000Z', 'Z')
}

export function draftsFromShift(shift: ApiShift, rules: Map<string, ApiBreakRule>): BreakDraft[] {
  return shift.breaks.map(b => ({
    key: b.uuid,
    uuid: b.uuid,
    rule: b.break_rule_uuid ? (rules.get(b.break_rule_uuid) ?? null) : null,
    start: b.start_time,
    end: b.end_time,
  }))
}

export function draftsToBreaks(drafts: BreakDraft[], newUuid: () => string): ApiBreak[] {
  return drafts.map(d => ({
    uuid: d.uuid ?? newUuid(),
    break_rule_uuid: d.rule?.uuid ?? null,
    start_time: d.start,
    end_time: d.end,
  }))
}

/** Places a time of day on the shift, rolling past midnight for overnight shifts. */
export function timeOnShift(time: string, shiftStart: string, timeZone: string) {
  const day = zonedParts(shiftStart, timeZone).date
  const sameDay = zonedToUtcIso(day, time, timeZone)
  return sameDay < shiftStart ? zonedToUtcIso(addDays(day, 1), time, timeZone) : sameDay
}

export function placeBreak(
  drafts: BreakDraft[],
  rule: ApiBreakRule | null,
  shiftStart: string,
  shiftEnd: string,
): BreakDraft {
  const minutes = rule?.break_duration_in_minutes ?? 30
  const half = minutesBetween(shiftStart, shiftEnd) / 2
  const target = rule ? Math.min(rule.for_hours_worked_in_minutes - minutes, half) : half
  let offset = Math.max(0, Math.round(target / 5) * 5)
  const taken = drafts.map(d => {
    const from = minutesBetween(shiftStart, d.start)
    return [from, d.end ? minutesBetween(shiftStart, d.end) : from] as const
  })
  while (taken.some(([a, b]) => offset < b && offset + minutes > a)) offset += 5
  const start = addMinutes(shiftStart, offset)
  return { key: `new-${Date.now()}`, rule, start, end: addMinutes(start, minutes) }
}

export function unpaidMinutes(drafts: BreakDraft[]) {
  return drafts.reduce(
    (sum, d) => (d.rule?.is_paid || !d.end ? sum : sum + minutesBetween(d.start, d.end)),
    0,
  )
}

export function breakProblems(drafts: BreakDraft[], shiftStart: string, shiftEnd: string) {
  const problems: string[] = []
  if (drafts.some(d => d.end && d.end <= d.start)) problems.push('A break ends before it starts.')
  if (drafts.some(d => d.start < shiftStart || (d.end ?? d.start) > shiftEnd))
    problems.push('A break falls outside the shift.')
  const sorted = [...drafts].sort((a, b) => a.start.localeCompare(b.start))
  if (sorted.some((d, i) => i > 0 && d.start < (sorted[i - 1]?.end ?? sorted[i - 1]?.start ?? '')))
    problems.push('Two breaks overlap.')
  return problems
}

interface BreakChange {
  uuid?: string
  start_time?: string
  end_time?: string | null
  break_rule_uuid?: string | null
  _destroy?: boolean
}

export function breaksBody(original: ApiShift, drafts: BreakDraft[]) {
  const kept = new Set(drafts.flatMap(d => (d.uuid ? [d.uuid] : [])))
  const edits = drafts.flatMap((d): BreakChange[] => {
    if (!d.uuid) {
      return [{ start_time: d.start, end_time: d.end, break_rule_uuid: d.rule?.uuid ?? null }]
    }
    const before = original.breaks.find(b => b.uuid === d.uuid)
    if (before && before.start_time === d.start && before.end_time === d.end) return []
    return [{ uuid: d.uuid, start_time: d.start, end_time: d.end }]
  })
  const removed = original.breaks
    .filter(b => !kept.has(b.uuid))
    .map((b): BreakChange => ({ uuid: b.uuid, _destroy: true }))
  const changes = [...edits, ...removed]
  return changes.length ? changes : null
}
