import { useMemo, useState } from 'react'
import { BreaksEditor } from './BreaksEditor'
import {
  breakProblems,
  breaksBody,
  draftsFromShift,
  draftsToBreaks,
  unpaidMinutes,
  type BreakDraft,
} from './breaks'
import {
  breakIssueLabel,
  breakIssues,
  formatDay,
  formatPeriod,
  formatTime,
  localStartDate,
  minutesBetween,
  primaryJob,
  workedHours,
  zonedParts,
  zonedToUtcIso,
  type ApiPayPeriod,
  type ApiShift,
  type Person,
  type ShiftStatus,
} from './model'
import { ChangePin, GapPin, SubPage } from './parts'
import { nowIso, simId, type Preview } from './preview'
import { Flex, Grid } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type ShiftPageMode =
  { kind: 'add'; personUuid: string | null } | { kind: 'edit'; shift: ApiShift; clockOut: boolean }

function mostCommon(values: string[]) {
  const counts = new Map<string, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
}

function personTimeZone(personUuid: string, shifts: ApiShift[]) {
  return (
    mostCommon(shifts.filter(s => s.entity_uuid === personUuid).map(s => s.time_zone)) ??
    mostCommon(shifts.map(s => s.time_zone)) ??
    'America/Los_Angeles'
  )
}

function initialTimes(mode: ShiftPageMode, period: ApiPayPeriod, timeZone: string) {
  if (mode.kind === 'edit') {
    const { shift, clockOut } = mode
    const start = zonedParts(shift.shift_started_at, shift.time_zone)
    const end = shift.shift_ended_at
      ? zonedParts(shift.shift_ended_at, shift.time_zone)
      : clockOut
        ? zonedParts(nowIso(), shift.time_zone)
        : null
    return {
      startDate: start.date,
      startTime: start.time,
      endDate: end?.date ?? start.date,
      endTime: end?.time ?? '',
    }
  }
  const today = zonedParts(nowIso(), timeZone).date
  const date = period.end_date < today ? period.end_date : period.start_date
  return { startDate: date, startTime: '09:00', endDate: date, endTime: '17:30' }
}

export function ShiftPage({
  mode,
  companyId,
  people,
  period,
  shifts,
  backLabel,
  onBack,
  onSave,
  onDelete,
}: {
  mode: ShiftPageMode
  companyId: string
  people: Person[]
  period: ApiPayPeriod
  shifts: ApiShift[]
  backLabel: string
  onBack: () => void
  onSave: (shift: ApiShift, preview: Preview) => void
  onDelete: (shift: ApiShift, preview: Preview) => void
}) {
  const Components = useComponentContext()
  const existing = mode.kind === 'edit' ? mode.shift : null
  const sorted = useMemo(() => [...people].sort((a, b) => a.name.localeCompare(b.name)), [people])

  const [personUuid, setPersonUuid] = useState(
    existing?.entity_uuid ??
      (mode.kind === 'add' ? mode.personUuid : null) ??
      sorted[0]?.employee.uuid ??
      '',
  )
  const timeZone = existing?.time_zone ?? personTimeZone(personUuid, shifts)
  const [times, setTimes] = useState(() => initialTimes(mode, period, timeZone))
  const [status, setStatus] = useState<ShiftStatus>('approved')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const person = people.find(p => p.employee.uuid === personUuid)
  const rulesByUuid = useMemo(
    () => new Map(person?.breakPolicy?.rules.map(rule => [rule.uuid, rule])),
    [person],
  )
  const [breaks, setBreaks] = useState<BreakDraft[]>(() =>
    existing ? draftsFromShift(existing, rulesByUuid) : [],
  )

  const setStartDate = (startDate: string) => {
    setTimes(w => ({
      ...w,
      startDate,
      endDate: w.endDate === w.startDate ? startDate : w.endDate,
    }))
  }

  const start =
    times.startDate && times.startTime
      ? zonedToUtcIso(times.startDate, times.startTime, timeZone)
      : null
  const end =
    times.endDate && times.endTime ? zonedToUtcIso(times.endDate, times.endTime, timeZone) : null
  const hours =
    start && end ? Math.max(0, (minutesBetween(start, end) - unpaidMinutes(breaks)) / 60) : null

  const problems: string[] = []
  if (start && end && end <= start) problems.push('End must be after start.')
  if ((start && Date.parse(start) > Date.now()) || (end && Date.parse(end) > Date.now()))
    problems.push('Times can’t be in the future.')
  const clash =
    !existing && start && end
      ? shifts.find(
          s =>
            s.entity_uuid === personUuid &&
            s.shift_started_at < end &&
            (s.shift_ended_at ?? nowIso()) > start,
        )
      : undefined
  if (clash)
    problems.push(
      `It overlaps ${person?.name ?? 'their'} shift ${formatTime(clash.shift_started_at, clash.time_zone)} – ${clash.shift_ended_at ? formatTime(clash.shift_ended_at, clash.time_zone) : 'now'}.`,
    )
  if (start && end) problems.push(...breakProblems(breaks, start, end))

  const nextBreaks = draftsToBreaks(breaks, () => '')
  const issues = existing
    ? breakIssues(
        start && end
          ? { ...existing, shift_started_at: start, shift_ended_at: end, breaks: nextBreaks }
          : { ...existing, breaks: nextBreaks },
        person?.breakPolicy,
      )
    : []

  const editBody: Record<string, unknown> = existing ? { version: existing.version } : {}
  if (existing) {
    if (start && start !== existing.shift_started_at) editBody.shift_started_at = start
    if (end && end !== existing.shift_ended_at) editBody.shift_ended_at = end
    const breakChanges = breaksBody(existing, breaks)
    if (breakChanges) editBody.breaks = breakChanges
  }
  const changed = !existing || Object.keys(editBody).length > 1
  if (existing && changed && hours !== null && existing.entries[0]) {
    editBody.entries = [{ uuid: existing.entries[0].uuid, hours_worked: Number(hours.toFixed(3)) }]
  }

  const job = person ? primaryJob(person.employee) : undefined
  const addBody = {
    entity_uuid: personUuid,
    entity_type: 'Employee',
    status,
    job_uuid: job?.uuid ?? null,
    time_zone: timeZone,
    shift_started_at: start,
    shift_ended_at: end,
    entries: [
      { hours_worked: Number((hours ?? 0).toFixed(3)), pay_classification: 'Unclassified' },
    ],
    breaks: breaks.map(b => ({
      start_time: b.start,
      end_time: b.end,
      break_rule_uuid: b.rule?.uuid ?? null,
    })),
  }

  const save = () => {
    if (existing) {
      onSave(
        {
          ...existing,
          shift_started_at: start ?? existing.shift_started_at,
          shift_ended_at: end ?? existing.shift_ended_at,
          entries:
            hours !== null && existing.entries[0]
              ? [{ ...existing.entries[0], hours_worked: hours.toFixed(3) }]
              : existing.entries,
          breaks: draftsToBreaks(breaks, simId),
          updated_at: nowIso(),
        },
        {
          title: 'Edit shift',
          requests: [
            {
              method: 'PATCH',
              path: `/v1/time_tracking/time_sheets/${existing.uuid}`,
              body: editBody,
            },
          ],
          gapIds: existing.synced_to_payroll_at
            ? ['which-timesheets', 'break-timing']
            : ['break-timing'],
        },
      )
      return
    }
    if (!start || !end) return
    const now = nowIso()
    onSave(
      {
        uuid: simId(),
        version: 'simulated',
        status,
        time_zone: timeZone,
        entity_type: 'Employee',
        entity_uuid: personUuid,
        job_uuid: job?.uuid ?? null,
        shift_started_at: start,
        shift_ended_at: end,
        synced_to_payroll_at: null,
        created_at: now,
        updated_at: now,
        entries: [
          {
            uuid: simId(),
            hours_worked: (hours ?? 0).toFixed(3),
            pay_classification: 'Unclassified',
          },
        ],
        breaks: addBody.breaks.map(b => ({ ...b, uuid: simId() })),
      },
      {
        title: 'Add shift',
        requests: [
          {
            method: 'POST',
            path: `/v1/companies/${companyId}/time_tracking/time_sheets`,
            body: addBody,
          },
        ],
        gapIds: [],
      },
    )
  }

  const deleteShift = () => {
    if (!existing) return
    onDelete(existing, {
      title: 'Delete shift',
      requests: [
        {
          method: 'DELETE',
          path: `/v1/time_tracking/time_sheets/${existing.uuid}?version=${existing.version}`,
        },
      ],
      gapIds: [],
    })
  }

  const title = existing
    ? `${mode.kind === 'edit' && mode.clockOut ? 'Clock out' : 'Edit shift'}: ${formatDay(localStartDate(existing))}`
    : 'Add shift'
  const saveLabel = existing ? 'Save' : 'Add shift'
  const outsidePeriod = times.startDate < period.start_date || times.startDate > period.end_date

  const actions = (
    <Flex gap={12} justifyContent="flex-end">
      <Components.Button variant="secondary" onClick={onBack}>
        Cancel
      </Components.Button>
      <Components.Button
        isDisabled={!start || !end || !changed || problems.length > 0}
        onClick={save}
      >
        {saveLabel}
      </Components.Button>
    </Flex>
  )

  const footer = confirmDelete ? (
    <Flex flexDirection="column" gap={12}>
      <Components.Alert status="warning" label="Delete this shift?">
        {existing?.synced_to_payroll_at
          ? 'It was already sent. Its hours stay on payroll until you update this period.'
          : 'It won’t be sent to payroll.'}
      </Components.Alert>
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
    </Flex>
  ) : existing ? (
    <Flex justifyContent="space-between" gap={12}>
      <Components.Button
        variant="tertiary"
        onClick={() => {
          setConfirmDelete(true)
        }}
      >
        Delete
      </Components.Button>
      {actions}
    </Flex>
  ) : (
    actions
  )

  return (
    <SubPage
      narrow
      backLabel={backLabel}
      onBack={onBack}
      title={
        <>
          {title} <ChangePin id="shift-window" />
          {mode.kind === 'edit' && mode.clockOut && <ChangePin id="clock-out" />}
        </>
      }
      description={`${formatPeriod(period)} · times in ${timeZone}`}
      footer={footer}
    >
      <Components.Select
        label="Person"
        description={existing ? 'A shift can’t move to another person.' : undefined}
        placeholder="Choose a person"
        isDisabled={Boolean(existing)}
        value={personUuid}
        options={sorted.map(p => ({ value: p.employee.uuid, label: p.name }))}
        onChange={value => {
          setPersonUuid(value)
          setBreaks([])
        }}
      />
      <Grid gridTemplateColumns={{ base: '1fr 1fr' }} gap={12}>
        <Components.TextInput
          type="date"
          label="Start date"
          value={times.startDate}
          onChange={setStartDate}
        />
        <Components.TextInput
          type="time"
          label="Start time"
          value={times.startTime}
          onChange={startTime => {
            setTimes(w => ({ ...w, startTime }))
          }}
        />
        <Components.TextInput
          type="date"
          label="End date"
          value={times.endDate}
          onChange={endDate => {
            setTimes(w => ({ ...w, endDate }))
          }}
        />
        <Components.TextInput
          type="time"
          label="End time"
          value={times.endTime}
          onChange={endTime => {
            setTimes(w => ({ ...w, endTime }))
          }}
        />
      </Grid>
      <Components.Text size="sm" variant="supporting">
        {existing
          ? `Worked ${workedHours(existing).toFixed(2)} hours${hours !== null && changed ? `, ${hours.toFixed(2)} after this edit` : ''}.`
          : `${(hours ?? 0).toFixed(2)} hours worked.`}
        {outsidePeriod && ` This date is outside ${formatPeriod(period)}.`}
      </Components.Text>

      <BreaksEditor
        breaks={breaks}
        onChange={setBreaks}
        rules={person?.breakPolicy?.rules ?? []}
        shiftStart={start}
        shiftEnd={end}
        timeZone={timeZone}
      />

      {!existing && (
        <Components.Select
          label="Add as"
          description="Admins can add shifts already approved. They go with the next send."
          placeholder="Choose a status"
          value={status}
          options={[
            { value: 'approved', label: 'Approved' },
            { value: 'pending', label: 'Pending' },
          ]}
          onChange={value => {
            if (value === 'approved' || value === 'pending') setStatus(value)
          }}
        />
      )}

      {issues.length > 0 && person?.breakPolicy && (
        <Components.Alert status="warning" label={breakIssueLabel(issues)}>
          {person.breakPolicy.pay_premium
            ? `${person.breakPolicy.name} pays a premium for this, so the shift earns extra pay.`
            : `${person.breakPolicy.name} doesn’t pay a premium for this.`}{' '}
          <ChangePin id="missed-breaks" />
        </Components.Alert>
      )}
      {problems.length > 0 && (
        <Components.Alert status="error" label="The API would reject this">
          {problems.join(' ')}
        </Components.Alert>
      )}
      {existing && (
        <Components.Text size="sm" variant="supporting">
          Stays “{existing.status}” after the edit.
          {existing.synced_to_payroll_at &&
            ' Already sent: payroll keeps the old hours until the next send.'}
          {existing.synced_to_payroll_at && <GapPin id="which-timesheets" />} The page checks breaks
          against the new times, since the API can skip that when only the start or end moves.{' '}
          <GapPin id="break-timing" />
        </Components.Text>
      )}
    </SubPage>
  )
}
