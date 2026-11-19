import { useMemo, useState } from 'react'
import {
  formatDay,
  formatTime,
  localStartDate,
  minutesBetween,
  workedHours,
  zonedParts,
  zonedToUtcIso,
  type ApiShift,
  type Person,
} from './model'
import { GapPin, Modal, ReadOnlyNote, RequestBlock } from './parts'
import styles from './TimeTrackingReview.module.scss'

interface Check {
  label: string
  ok: boolean
  enforcedByApi: boolean
}

export function EditShiftModal({
  shift,
  person,
  onClose,
}: {
  shift: ApiShift
  person: Person | undefined
  onClose: () => void
}) {
  const tz = shift.time_zone
  const start = zonedParts(shift.shift_started_at, tz)
  const end = shift.shift_ended_at ? zonedParts(shift.shift_ended_at, tz) : null

  const [startDate, setStartDate] = useState(start.date)
  const [startTime, setStartTime] = useState(start.time)
  const [endDate, setEndDate] = useState(end?.date ?? start.date)
  const [endTime, setEndTime] = useState(end?.time ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const rules = useMemo(
    () => new Map(person?.breakPolicy?.rules.map(rule => [rule.uuid, rule])),
    [person],
  )

  const nextStart = startDate && startTime ? zonedToUtcIso(startDate, startTime, tz) : null
  const nextEnd = endDate && endTime ? zonedToUtcIso(endDate, endTime, tz) : null

  const unpaidBreakMinutes = shift.breaks.reduce((sum, b) => {
    if (!b.end_time) return sum
    const rule = b.break_rule_uuid ? rules.get(b.break_rule_uuid) : undefined
    return rule?.is_paid ? sum : sum + minutesBetween(b.start_time, b.end_time)
  }, 0)

  const nextHours =
    nextStart && nextEnd
      ? Math.max(0, (minutesBetween(nextStart, nextEnd) - unpaidBreakMinutes) / 60)
      : null

  const now = Date.now()
  const checks: Check[] = [
    {
      label: 'End is after start',
      ok: !nextStart || !nextEnd || nextEnd > nextStart,
      enforcedByApi: true,
    },
    {
      label: 'No times in the future',
      ok: (!nextStart || Date.parse(nextStart) <= now) && (!nextEnd || Date.parse(nextEnd) <= now),
      enforcedByApi: true,
    },
    {
      label: 'Breaks stay inside the shift',
      ok: shift.breaks.every(
        b =>
          !nextStart ||
          !nextEnd ||
          (b.start_time >= nextStart && (!b.end_time || b.end_time <= nextEnd)),
      ),
      enforcedByApi: false,
    },
  ]

  const body: Record<string, unknown> = { version: shift.version }
  if (nextStart && nextStart !== shift.shift_started_at) body.shift_started_at = nextStart
  if (nextEnd && nextEnd !== shift.shift_ended_at) body.shift_ended_at = nextEnd
  const changed = Object.keys(body).length > 1
  if (changed && nextHours !== null && shift.entries[0]) {
    body.entries = [{ uuid: shift.entries[0].uuid, hours_worked: Number(nextHours.toFixed(3)) }]
  }

  return (
    <Modal
      title={`Edit shift: ${person?.name ?? 'Unknown'}, ${formatDay(localStartDate(shift))}`}
      onClose={onClose}
      wide
      footer={
        <>
          <button
            type="button"
            className={styles.dangerButton}
            onClick={() => {
              setConfirmDelete(true)
            }}
          >
            Delete shift
          </button>
          <span className={styles.spacer} />
          <button type="button" className={styles.secondaryButton} onClick={onClose}>
            Close
          </button>
        </>
      }
    >
      <div className={styles.editGrid}>
        <label className={styles.field}>
          <span>Start date</span>
          <input
            type="date"
            value={startDate}
            onChange={e => {
              setStartDate(e.target.value)
            }}
          />
        </label>
        <label className={styles.field}>
          <span>Start time</span>
          <input
            type="time"
            value={startTime}
            onChange={e => {
              setStartTime(e.target.value)
            }}
          />
        </label>
        <label className={styles.field}>
          <span>End date</span>
          <input
            type="date"
            value={endDate}
            onChange={e => {
              setEndDate(e.target.value)
            }}
          />
        </label>
        <label className={styles.field}>
          <span>End time</span>
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
        Times are in the shift’s own time zone ({tz}). Worked hours: {workedHours(shift).toFixed(2)}{' '}
        now
        {nextHours !== null && `, ${nextHours.toFixed(2)} after this edit`} (duration minus unpaid
        breaks).
      </p>

      <h3 className={styles.subhead}>Breaks</h3>
      <ul className={styles.plainList}>
        {shift.breaks.length === 0 && <li className={styles.muted}>No breaks</li>}
        {shift.breaks.map(b => {
          const rule = b.break_rule_uuid ? rules.get(b.break_rule_uuid) : undefined
          return (
            <li key={b.uuid}>
              {rule
                ? `${rule.break_type === 'meal' ? 'Meal' : 'Rest'} (${rule.is_paid ? 'paid' : 'unpaid'})`
                : 'Unlinked break (unpaid)'}{' '}
              · {formatTime(b.start_time, tz)} –{' '}
              {b.end_time ? formatTime(b.end_time, tz) : 'ongoing'}
            </li>
          )
        })}
      </ul>

      <h3 className={styles.subhead}>Checks</h3>
      <ul className={styles.checkList}>
        {checks.map(check => (
          <li key={check.label} className={check.ok ? styles.checkOk : styles.checkFail}>
            {check.ok ? '✓' : '✕'} {check.label}
            <span className={styles.muted}>
              {check.enforcedByApi
                ? ' · the API rejects this'
                : ' · the API can miss this on boundary-only edits (known bug)'}
            </span>
          </li>
        ))}
        <li className={styles.muted}>
          Overlap with another shift isn’t checked here, and the API only checks it when a shift is
          created.
        </li>
      </ul>

      <h3 className={styles.subhead}>Request</h3>
      {changed ? (
        <RequestBlock
          method="PATCH"
          path={`/v1/time_tracking/time_sheets/${shift.uuid}`}
          body={body}
        />
      ) : (
        <p className={styles.muted}>Change a time to see the request.</p>
      )}
      <ul className={styles.plainList}>
        <li>
          The status stays “{shift.status}”. Edits don’t reset approval. <GapPin id="approval" />
        </li>
        {shift.synced_to_payroll_at && (
          <li>
            Already sent. Payroll keeps the old hours until the next send, and nobody knows yet
            whether this edit clears synced_to_payroll_at. <GapPin id="changed" />
          </li>
        )}
      </ul>
      {confirmDelete && (
        <>
          <h3 className={styles.subhead}>
            Delete <GapPin id="delete" />
          </h3>
          <RequestBlock
            method="DELETE"
            path={`/v1/time_tracking/time_sheets/${shift.uuid}?version=${shift.version}`}
          />
          {shift.synced_to_payroll_at && (
            <p className={styles.muted}>
              It was already sent. Payroll keeps its hours until the next send.
            </p>
          )}
        </>
      )}
      <ReadOnlyNote />
    </Modal>
  )
}
