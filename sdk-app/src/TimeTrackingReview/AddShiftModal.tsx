import { useMemo, useState } from 'react'
import { BreaksEditor } from './BreaksEditor'
import { breakProblems, unpaidMinutes, type BreakDraft } from './breaks'
import {
  addDays,
  formatPeriod,
  formatTime,
  minutesBetween,
  primaryJob,
  zonedToUtcIso,
  type ApiPayPeriod,
  type ApiShift,
  type Person,
  type ShiftStatus,
} from './model'
import { ChangePin, PrototypeModal } from './parts'
import { nowIso, simId, type Preview } from './preview'
import { Flex, Grid } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

function mostCommon(values: string[]) {
  const counts = new Map<string, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
}

export function AddShiftModal({
  companyId,
  people,
  period,
  shifts,
  initialPersonUuid,
  onClose,
  onSave,
}: {
  companyId: string
  people: Person[]
  period: ApiPayPeriod
  shifts: ApiShift[]
  initialPersonUuid: string | null
  onClose: () => void
  onSave: (shift: ApiShift, preview: Preview) => void
}) {
  const Components = useComponentContext()
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

  const unpaid = unpaidMinutes(breaks)
  const hours = start && end ? (minutesBetween(start, end) - unpaid) / 60 : 0
  const clash =
    start && end
      ? theirs.find(
          s => s.shift_started_at < end && (s.shift_ended_at ?? new Date().toISOString()) > start,
        )
      : undefined
  const outsidePeriod = date < period.start_date || date > period.end_date

  const problems: string[] = []
  if (end && Date.parse(end) > Date.now()) problems.push('Times can’t be in the future.')
  if (clash)
    problems.push(
      `It overlaps ${person?.name ?? 'their'} shift ${formatTime(clash.shift_started_at, clash.time_zone)} – ${clash.shift_ended_at ? formatTime(clash.shift_ended_at, clash.time_zone) : 'now'}.`,
    )
  if (start && end) problems.push(...breakProblems(breaks, start, end))

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
      end_time: b.end,
      break_rule_uuid: b.rule?.uuid ?? null,
    })),
  }

  const save = () => {
    if (!start || !end) return
    const uuid = simId()
    const now = nowIso()
    onSave(
      {
        uuid,
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
          { uuid: simId(), hours_worked: hours.toFixed(3), pay_classification: 'Unclassified' },
        ],
        breaks: body.breaks.map(b => ({ ...b, uuid: simId() })),
      },
      {
        title: 'Add shift',
        requests: [
          { method: 'POST', path: `/v1/companies/${companyId}/time_tracking/time_sheets`, body },
        ],
        gapIds: [],
      },
    )
  }

  return (
    <PrototypeModal
      title={
        <>
          Add shift <ChangePin id="shift-window" />
        </>
      }
      onClose={onClose}
      footer={
        <Flex justifyContent="flex-end" gap={12}>
          <Components.Button variant="secondary" onClick={onClose}>
            Cancel
          </Components.Button>
          <Components.Button isDisabled={!start || !end || problems.length > 0} onClick={save}>
            Add shift
          </Components.Button>
        </Flex>
      }
    >
      <Grid gridTemplateColumns={{ base: '2fr 1.4fr 1fr 1fr' }} gap={12}>
        <Components.Select
          label="Person"
          placeholder="Choose a person"
          value={personUuid}
          options={sorted.map(p => ({ value: p.employee.uuid, label: p.name }))}
          onChange={value => {
            setPersonUuid(value)
            setBreaks([])
          }}
        />
        <Components.TextInput type="date" label="Date" value={date} onChange={setDate} />
        <Components.TextInput type="time" label="Start" value={startTime} onChange={setStartTime} />
        <Components.TextInput
          type="time"
          label="End"
          description={endsNextDay ? 'Ends the next day' : undefined}
          value={endTime}
          onChange={setEndTime}
        />
      </Grid>
      <Components.Text size="sm" variant="supporting">
        {hours.toFixed(2)} hours worked, in {timeZone}.
        {outsidePeriod && ` This date is outside ${formatPeriod(period)}.`}
      </Components.Text>

      <BreaksEditor
        breaks={breaks}
        onChange={setBreaks}
        rules={rules}
        shiftStart={start}
        shiftEnd={end}
        timeZone={timeZone}
      />

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
          setStatus(value as ShiftStatus)
        }}
      />

      {problems.length > 0 && (
        <Components.Alert status="error" label="The API would reject this">
          {problems.join(' ')}
        </Components.Alert>
      )}
    </PrototypeModal>
  )
}
