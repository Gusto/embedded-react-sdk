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
import { GapPin, PrototypeModal } from './parts'
import { nowIso, type Preview } from './preview'
import { Flex, Grid } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function EditShiftModal({
  shift,
  person,
  onClose,
  onSave,
  onDelete,
}: {
  shift: ApiShift
  person: Person | undefined
  onClose: () => void
  onSave: (next: ApiShift, preview: Preview) => void
  onDelete: (shift: ApiShift, preview: Preview) => void
}) {
  const Components = useComponentContext()
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

  const problems: string[] = []
  if (nextStart && nextEnd && nextEnd <= nextStart) problems.push('End must be after start.')
  if (
    (nextStart && Date.parse(nextStart) > Date.now()) ||
    (nextEnd && Date.parse(nextEnd) > Date.now())
  )
    problems.push('Times can’t be in the future.')
  if (
    nextStart &&
    nextEnd &&
    !shift.breaks.every(b => b.start_time >= nextStart && (!b.end_time || b.end_time <= nextEnd))
  )
    problems.push(
      'A break would fall outside the shift. The API can miss this on edits (known bug).',
    )

  const body: Record<string, unknown> = { version: shift.version }
  if (nextStart && nextStart !== shift.shift_started_at) body.shift_started_at = nextStart
  if (nextEnd && nextEnd !== shift.shift_ended_at) body.shift_ended_at = nextEnd
  const changed = Object.keys(body).length > 1
  if (changed && nextHours !== null && shift.entries[0]) {
    body.entries = [{ uuid: shift.entries[0].uuid, hours_worked: Number(nextHours.toFixed(3)) }]
  }

  const save = () => {
    const next: ApiShift = {
      ...shift,
      shift_started_at: nextStart ?? shift.shift_started_at,
      shift_ended_at: nextEnd ?? shift.shift_ended_at,
      entries:
        nextHours !== null && shift.entries[0]
          ? [{ ...shift.entries[0], hours_worked: nextHours.toFixed(3) }]
          : shift.entries,
      updated_at: nowIso(),
    }
    onSave(next, {
      title: 'Edit shift',
      requests: [{ method: 'PATCH', path: `/v1/time_tracking/time_sheets/${shift.uuid}`, body }],
      gapIds: shift.synced_to_payroll_at ? ['which-timesheets', 'break-timing'] : ['break-timing'],
    })
  }

  const deleteShift = () => {
    onDelete(shift, {
      title: 'Delete shift',
      requests: [
        {
          method: 'DELETE',
          path: `/v1/time_tracking/time_sheets/${shift.uuid}?version=${shift.version}`,
        },
      ],
      gapIds: [],
    })
  }

  return (
    <PrototypeModal
      title={`Edit shift: ${person?.name ?? 'Unknown'}, ${formatDay(localStartDate(shift))}`}
      onClose={onClose}
      footer={
        confirmDelete ? (
          <Flex justifyContent="flex-end" gap={12}>
            <Components.Button
              variant="secondary"
              onClick={() => {
                setConfirmDelete(false)
              }}
            >
              Keep shift
            </Components.Button>
            <Components.Button variant="error" onClick={deleteShift}>
              Delete shift
            </Components.Button>
          </Flex>
        ) : (
          <Flex justifyContent="space-between" gap={12}>
            <Components.Button
              variant="tertiary"
              onClick={() => {
                setConfirmDelete(true)
              }}
            >
              Delete
            </Components.Button>
            <Flex gap={12} justifyContent="flex-end">
              <Components.Button variant="secondary" onClick={onClose}>
                Cancel
              </Components.Button>
              <Components.Button isDisabled={!changed || problems.length > 0} onClick={save}>
                Save
              </Components.Button>
            </Flex>
          </Flex>
        )
      }
    >
      <Grid gridTemplateColumns={{ base: '1fr', small: '1fr 1fr' }} gap={12}>
        <Components.TextInput
          type="date"
          label="Start date"
          value={startDate}
          onChange={setStartDate}
        />
        <Components.TextInput
          type="time"
          label="Start time"
          value={startTime}
          onChange={setStartTime}
        />
        <Components.TextInput type="date" label="End date" value={endDate} onChange={setEndDate} />
        <Components.TextInput type="time" label="End time" value={endTime} onChange={setEndTime} />
      </Grid>
      <Components.Text size="sm" variant="supporting">
        Times are in {tz}. Worked {workedHours(shift).toFixed(2)} hours
        {nextHours !== null && changed && `, ${nextHours.toFixed(2)} after this edit`}. Breaks:{' '}
        {shift.breaks
          .map(b => {
            const rule = b.break_rule_uuid ? rules.get(b.break_rule_uuid) : undefined
            const kind = rule ? (rule.break_type === 'meal' ? 'meal' : 'rest') : 'unlinked'
            return `${kind} ${formatTime(b.start_time, tz)}`
          })
          .join(', ') || 'none'}
        . <GapPin id="break-timing" />
      </Components.Text>
      {problems.length > 0 && (
        <Components.Alert status="error" label="The API would reject this">
          {problems.join(' ')}
        </Components.Alert>
      )}
      <Components.Text size="sm" variant="supporting">
        Stays “{shift.status}” after the edit.
        {shift.synced_to_payroll_at &&
          ' Already sent: payroll keeps the old hours until the next send.'}
        {shift.synced_to_payroll_at && <GapPin id="which-timesheets" />}
      </Components.Text>
      {confirmDelete && (
        <Components.Alert status="warning" label="Delete this shift?">
          {shift.synced_to_payroll_at
            ? 'It was already sent. Its hours stay on payroll until you update this period.'
            : 'It won’t be sent to payroll.'}
        </Components.Alert>
      )}
    </PrototypeModal>
  )
}
