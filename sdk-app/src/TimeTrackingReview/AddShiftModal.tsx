import { useMemo, useState } from 'react'
import {
  addDays,
  breakRuleLabel,
  formatPeriod,
  formatTime,
  minutesBetween,
  primaryJob,
  zonedToUtcIso,
  type ApiBreakRule,
  type ApiPayPeriod,
  type ApiShift,
  type Person,
  type ShiftStatus,
} from './model'
import { GapPin, Modal, ReadOnlyNote, RequestBlock } from './parts'
import styles from './TimeTrackingReview.module.scss'

interface BreakDraft {
  key: string
  rule: ApiBreakRule | null
  start: string
  minutes: number
}

function mostCommon(values: string[]) {
  const counts = new Map<string, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
}

function addMinutes(iso: string, minutes: number) {
  return new Date(Date.parse(iso) + minutes * 60000).toISOString().replace('.000Z', 'Z')
}

export function AddShiftModal({
  companyId,
  people,
  period,
  shifts,
  initialPersonUuid,
  onClose,
}: {
  companyId: string
  people: Person[]
  period: ApiPayPeriod
  shifts: ApiShift[]
  initialPersonUuid: string | null
  onClose: () => void
}) {
  const sorted = useMemo(() => [...people].sort((a, b) => a.name.localeCompare(b.name)), [people])
  const [personUuid, setPersonUuid] = useState(initialPersonUuid ?? sorted[0]?.employee.uuid ?? '')
  const [date, setDate] = useState(
    period.end_date < new Date().toISOString().slice(0, 10) ? period.end_date : period.start_date,
  )
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:30')
  const [status, setStatus] = useState<ShiftStatus>('approved')
  const [breaks, setBreaks] = useState<BreakDraft[]>([])

  const person = people.find(p => p.employee.uuid === personUuid)
  const theirs = shifts.filter(s => s.entity_uuid === personUuid)
  const timeZone =
    mostCommon(theirs.map(s => s.time_zone)) ??
    mostCommon(shifts.map(s => s.time_zone)) ??
    'America/Los_Angeles'

  const start = date && startTime ? zonedToUtcIso(date, startTime, timeZone) : null
  const endsNextDay = endTime <= startTime
  const end =
    date && endTime ? zonedToUtcIso(endsNextDay ? addDays(date, 1) : date, endTime, timeZone) : null

  const rules = person?.breakPolicy?.rules ?? []

  const placeBreak = (rule: ApiBreakRule | null) => {
    if (!start || !end) return
    const minutes = rule?.break_duration_in_minutes ?? 30
    const target = rule
      ? Math.min(rule.for_hours_worked_in_minutes - minutes, minutesBetween(start, end) / 2)
      : minutesBetween(start, end) / 2
    let offset = Math.max(0, Math.round(target / 5) * 5)
    const taken = breaks.map(
      b => [minutesBetween(start, b.start), minutesBetween(start, b.start) + b.minutes] as const,
    )
    while (taken.some(([a, b]) => offset < b && offset + minutes > a)) offset += 5
    setBreaks(prev => [
      ...prev,
      { key: `${Date.now()}`, rule, start: addMinutes(start, offset), minutes },
    ])
  }

  const unpaid = breaks.reduce((sum, b) => (b.rule?.is_paid ? sum : sum + b.minutes), 0)
  const hours = start && end ? (minutesBetween(start, end) - unpaid) / 60 : 0

  const clash =
    start && end
      ? theirs.find(
          s => s.shift_started_at < end && (s.shift_ended_at ?? new Date().toISOString()) > start,
        )
      : undefined
  const localDate = start ? date : ''
  const outsidePeriod = localDate && (localDate < period.start_date || localDate > period.end_date)

  const checks = [
    { label: 'End is after start', ok: Boolean(start && end && end > start), api: true },
    {
      label: 'No times in the future',
      ok: Boolean(end && Date.parse(end) <= Date.now()),
      api: true,
    },
    {
      label: clash
        ? `Overlaps ${person?.name ?? 'their'} shift ${formatTime(clash.shift_started_at, clash.time_zone)} – ${clash.shift_ended_at ? formatTime(clash.shift_ended_at, clash.time_zone) : 'now'}`
        : 'Doesn’t overlap their other shifts',
      ok: !clash,
      api: true,
    },
    {
      label: 'Breaks stay inside the shift',
      ok: breaks.every(
        b => start && end && b.start >= start && addMinutes(b.start, b.minutes) <= end,
      ),
      api: true,
    },
  ]

  const job = person ? primaryJob(person.employee) : undefined
  const body = {
    entity_uuid: personUuid,
    entity_type: 'Employee',
    status,
    job_uuid: job?.uuid ?? null,
    time_zone: timeZone,
    shift_started_at: start,
    shift_ended_at: end,
    entries: [{ hours_worked: Number(hours.toFixed(3)), pay_classification: 'Unclassified' }],
    breaks: breaks.map(b => ({
      start_time: b.start,
      end_time: addMinutes(b.start, b.minutes),
      break_rule_uuid: b.rule?.uuid ?? null,
    })),
  }

  return (
    <Modal
      wide
      title="Add shift"
      onClose={onClose}
      footer={
        <button type="button" className={styles.secondaryButton} onClick={onClose}>
          Close
        </button>
      }
    >
      <div className={styles.editGrid}>
        <label className={styles.field}>
          <span>Person</span>
          <select
            value={personUuid}
            onChange={e => {
              setPersonUuid(e.target.value)
              setBreaks([])
            }}
          >
            {sorted.map(p => (
              <option key={p.employee.uuid} value={p.employee.uuid}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Date</span>
          <input
            type="date"
            value={date}
            onChange={e => {
              setDate(e.target.value)
            }}
          />
        </label>
        <label className={styles.field}>
          <span>Start</span>
          <input
            type="time"
            value={startTime}
            onChange={e => {
              setStartTime(e.target.value)
            }}
          />
        </label>
        <label className={styles.field}>
          <span>End {endsNextDay && <span className={styles.plusDay}>+1 day</span>}</span>
          <input
            type="time"
            value={endTime}
            onChange={e => {
              setEndTime(e.target.value)
            }}
          />
        </label>
      </div>
      <p className={styles.muted}>
        Time zone: {timeZone} <GapPin id="timezone" /> · Worked: {hours.toFixed(2)} hours
        {outsidePeriod && ` · Outside ${formatPeriod(period)}, so it belongs to another pay period`}
      </p>

      <h3 className={styles.subhead}>Breaks</h3>
      <ul className={styles.plainList}>
        {breaks.length === 0 && <li className={styles.muted}>No breaks yet</li>}
        {breaks.map(b => (
          <li key={b.key}>
            {b.rule ? breakRuleLabel(b.rule) : 'Unlinked break · counts as unpaid'} ·{' '}
            {formatTime(b.start, timeZone)} – {formatTime(addMinutes(b.start, b.minutes), timeZone)}{' '}
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => {
                setBreaks(prev => prev.filter(x => x.key !== b.key))
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className={styles.cardActions}>
        {rules.map(rule => (
          <button
            key={rule.uuid}
            type="button"
            className={styles.linkButton}
            onClick={() => {
              placeBreak(rule)
            }}
          >
            + {breakRuleLabel(rule)}
          </button>
        ))}
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => {
            placeBreak(null)
          }}
        >
          + Unlinked break
        </button>
      </div>
      <p className={styles.muted}>
        Breaks come from {person?.breakPolicy?.name ?? 'no break policy'}, and are placed before the
        rule’s hours-worked mark.
      </p>

      <div className={styles.field}>
        <span>Add as</span>
        <div className={styles.segmented} role="group" aria-label="Add as">
          <button
            type="button"
            aria-pressed={status === 'approved'}
            onClick={() => {
              setStatus('approved')
            }}
          >
            Approved
          </button>
          <button
            type="button"
            aria-pressed={status === 'pending'}
            onClick={() => {
              setStatus('pending')
            }}
          >
            Pending
          </button>
        </div>
      </div>
      <p className={styles.muted}>
        <GapPin id="approval" /> The API lets an admin create a shift already approved. It will go
        in the next send.
      </p>

      <h3 className={styles.subhead}>Checks</h3>
      <ul className={styles.checkList}>
        {checks.map(c => (
          <li key={c.label} className={c.ok ? styles.checkOk : styles.checkFail}>
            {c.ok ? '✓' : '✕'} {c.label}
            <span className={styles.muted}> · the API rejects this on create</span>
          </li>
        ))}
        <li className={styles.muted}>
          <GapPin id="overlap-create" /> Overlap is checked here against {theirs.length} loaded
          shifts. The API checks it too, but only on create.
        </li>
      </ul>

      <RequestBlock
        method="POST"
        path={`/v1/companies/${companyId}/time_tracking/time_sheets`}
        body={body}
      />
      <p className={styles.muted}>
        Shifts created after the period was sent only reach payroll with the next send.
      </p>
      <ReadOnlyNote />
    </Modal>
  )
}
