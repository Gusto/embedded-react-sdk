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
import { GapPin, PrototypeModal } from './parts'
import { nowIso, simId, type Preview } from './preview'
import { Flex, Grid } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

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

  const placeBreak = (rule: ApiBreakRule | null) => {
    if (!start || !end) return
    const minutes = rule?.break_duration_in_minutes ?? 30
    const half = minutesBetween(start, end) / 2
    const target = rule ? Math.min(rule.for_hours_worked_in_minutes - minutes, half) : half
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
  const outsidePeriod = date < period.start_date || date > period.end_date

  const problems: string[] = []
  if (end && Date.parse(end) > Date.now()) problems.push('Times can’t be in the future.')
  if (clash)
    problems.push(
      `It overlaps ${person?.name ?? 'their'} shift ${formatTime(clash.shift_started_at, clash.time_zone)} – ${clash.shift_ended_at ? formatTime(clash.shift_ended_at, clash.time_zone) : 'now'}.`,
    )
  if (!breaks.every(b => start && end && b.start >= start && addMinutes(b.start, b.minutes) <= end))
    problems.push('A break falls outside the shift.')

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
        gapIds: ['overlap-create', 'timezone', 'approval'],
      },
    )
  }

  return (
    <PrototypeModal
      title="Add shift"
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
      <Grid gridTemplateColumns={{ base: '1fr', small: '1fr 1fr' }} gap={12}>
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
        {hours.toFixed(2)} hours worked, in {timeZone}. <GapPin id="timezone" />
        {outsidePeriod && ` This date is outside ${formatPeriod(period)}.`}
      </Components.Text>

      <Flex flexDirection="column" gap={8}>
        <Components.Text weight="medium">Breaks</Components.Text>
        {breaks.map(b => (
          <Flex key={b.key} alignItems="center" gap={8}>
            <Components.Text size="sm">
              {b.rule ? breakRuleLabel(b.rule) : 'Unlinked break · unpaid'} ·{' '}
              {formatTime(b.start, timeZone)} –{' '}
              {formatTime(addMinutes(b.start, b.minutes), timeZone)}
            </Components.Text>
            <Components.Button
              variant="tertiary"
              onClick={() => {
                setBreaks(prev => prev.filter(x => x.key !== b.key))
              }}
            >
              Remove
            </Components.Button>
          </Flex>
        ))}
        <Flex gap={8} flexWrap="wrap">
          {rules.map(rule => (
            <Components.Button
              key={rule.uuid}
              variant="secondary"
              onClick={() => {
                placeBreak(rule)
              }}
            >
              Add {rule.break_type} break
            </Components.Button>
          ))}
        </Flex>
      </Flex>

      <Components.Select
        label="Add as"
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
          {problems.join(' ')} <GapPin id="overlap-create" />
        </Components.Alert>
      )}
      <Components.Text size="sm" variant="supporting">
        Admins can add shifts already approved. They go with the next send. <GapPin id="approval" />
      </Components.Text>
    </PrototypeModal>
  )
}
