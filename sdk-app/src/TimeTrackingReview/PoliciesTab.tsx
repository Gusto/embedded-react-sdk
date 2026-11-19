import { useEffect, useMemo, useState } from 'react'
import { getAllPages, withQuery } from './api'
import {
  addDays,
  breakRuleLabel,
  currentWorkweekStart,
  eligibility,
  formatDay,
  formatPeriod,
  hoursLabel,
  localStartDate,
  overlaps,
  scheduleLabel,
  type ApiBreakPolicy,
  type ApiBreakRule,
  type ApiOvertimePolicy,
  type ApiPayPeriod,
  type ApiPaySchedule,
  type ApiShift,
  type Person,
} from './model'
import { GapPin, Modal, ReadOnlyNote, RequestBlock } from './parts'
import type { Preview } from './preview'
import styles from './TimeTrackingReview.module.scss'

type PolicyKind = 'overtime' | 'break'

interface Props {
  companyId: string
  people: Person[]
  schedules: ApiPaySchedule[]
  periods: ApiPayPeriod[]
  overtimePolicies: ApiOvertimePolicy[]
  breakPolicies: ApiBreakPolicy[]
  onPreview: (preview: Preview) => void
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function PoliciesTab({
  companyId,
  people,
  schedules,
  periods,
  overtimePolicies,
  breakPolicies,
  onPreview,
}: Props) {
  const [todayShifts, setTodayShifts] = useState<ApiShift[] | null>(null)
  const [overtimeForm, setOvertimeForm] = useState<ApiOvertimePolicy | 'new' | null>(null)
  const [breakForm, setBreakForm] = useState<ApiBreakPolicy | 'new' | null>(null)
  const [assigning, setAssigning] = useState<{
    kind: PolicyKind
    policy: ApiOvertimePolicy | ApiBreakPolicy
  } | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const today = todayIso()
    const path = withQuery(`/v1/companies/${companyId}/time_tracking/time_sheets`, {
      entity_type: 'Employee',
      shift_started_after: `${addDays(today, -1)}T00:00:00Z`,
    })
    getAllPages<ApiShift>(path, 500, controller.signal)
      .then(all => {
        setTodayShifts(all.filter(s => localStartDate(s) === today))
      })
      .catch(() => {
        if (!controller.signal.aborted) setTodayShifts([])
      })
    return () => {
      controller.abort()
    }
  }, [companyId])

  const breakToday = useMemo(
    () => new Set((todayShifts ?? []).filter(s => s.breaks.length > 0).map(s => s.entity_uuid)),
    [todayShifts],
  )

  const eligiblePeople = people.filter(p => eligibility(p.employee).eligible)
  const ineligiblePeople = people.filter(p => !eligibility(p.employee).eligible)
  const noOvertime = eligiblePeople.filter(p => !p.overtimePolicy)
  const noBreak = eligiblePeople.filter(p => !p.breakPolicy)
  const nameOf = (uuid: string) => people.find(p => p.employee.uuid === uuid)?.name ?? 'Unknown'

  const today = todayIso()
  const workweeks = schedules.map(schedule => {
    const start = schedule.workweek_start_day
      ? currentWorkweekStart(schedule.workweek_start_day, today)
      : null
    const week = start ? { start_date: start, end_date: addDays(start, 6) } : null
    const touched = week
      ? periods.filter(
          p =>
            p.pay_schedule_uuid === schedule.uuid &&
            overlaps(p as ApiPayPeriod, { ...week, pay_schedule_uuid: '', payroll: null }),
        )
      : []
    return { schedule, start, touched }
  })

  const deletePolicy = (kind: PolicyKind, policy: ApiOvertimePolicy | ApiBreakPolicy) => {
    const blocked =
      kind === 'break' ? policy.assigned_employees.filter(a => breakToday.has(a.uuid)) : []
    onPreview({
      title: `Delete ${policy.name}`,
      requests: [
        {
          method: 'DELETE',
          path: `/v1/time_tracking/${kind === 'overtime' ? 'overtime_policies' : 'break_policies'}/${policy.uuid}?version=${policy.version}`,
        },
      ],
      notes: [
        `${policy.assigned_employees.length} people are on this policy.`,
        kind === 'overtime'
          ? 'Eligible people need an overtime policy before their hours can be submitted. Move them first.'
          : blocked.length
            ? `This will fail: ${blocked.map(b => nameOf(b.uuid)).join(', ')} took a break today.`
            : 'Nobody on it has taken a break today, so this would be allowed.',
      ],
      gapIds: kind === 'break' ? ['break-today'] : ['ot-required'],
    })
  }

  return (
    <div className={styles.tabBody}>
      <section className={styles.coverage}>
        <div>
          <strong>Coverage</strong> <GapPin id="missing-policy" />
          <p className={styles.muted}>
            {eligiblePeople.length} of {people.length} people are eligible for time tracking
            policies.{' '}
            {noOvertime.length === 0 && noBreak.length === 0
              ? 'All of them have an overtime and a break policy.'
              : `${noOvertime.length} have no overtime policy, ${noBreak.length} have no break policy.`}
          </p>
          {noOvertime.length > 0 && (
            <p className={styles.muted}>
              No overtime policy: {noOvertime.map(p => p.name).join(', ')}
            </p>
          )}
          {noBreak.length > 0 && (
            <p className={styles.muted}>No break policy: {noBreak.map(p => p.name).join(', ')}</p>
          )}
        </div>
        <div>
          <strong>Not eligible</strong> <GapPin id="eligibility" />
          <p className={styles.muted}>
            {ineligiblePeople.length === 0
              ? 'Everyone is eligible.'
              : ineligiblePeople
                  .map(p => `${p.name} (${eligibility(p.employee).reason})`)
                  .join(', ')}
          </p>
        </div>
        <div>
          <strong>Break taken today</strong> <GapPin id="break-today" />
          <p className={styles.muted}>
            {todayShifts === null
              ? 'Checking today’s shifts…'
              : breakToday.size === 0
                ? `Nobody yet (${todayShifts.length} shifts today). Break policy changes are allowed for everyone.`
                : `${[...breakToday].map(nameOf).join(', ')}. Their break policy can’t change until tomorrow.`}
          </p>
        </div>
      </section>

      <section className={styles.policySection}>
        <div className={styles.sectionHeader}>
          <h2>Overtime policies</h2>
          <GapPin id="state" />
          <span className={styles.spacer} />
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              setOvertimeForm('new')
            }}
          >
            New overtime policy
          </button>
        </div>
        <div className={styles.policyGrid}>
          {overtimePolicies.map(policy => (
            <article key={policy.uuid} className={styles.policyCard}>
              <h3>{policy.name}</h3>
              <dl className={styles.policyRules}>
                <dt>Weekly</dt>
                <dd>Over {policy.weekly_overtime_hours_threshold ?? '—'}h · 1.5x</dd>
                <dt>Daily</dt>
                <dd>
                  {policy.daily_overtime_hours_threshold
                    ? `Over ${policy.daily_overtime_hours_threshold}h · 1.5x`
                    : 'Off'}
                </dd>
                <dt>Double</dt>
                <dd>
                  {policy.double_overtime_hours_threshold
                    ? `Over ${policy.double_overtime_hours_threshold}h in a day · 2x`
                    : 'Off'}
                </dd>
                <dt>7th day</dt>
                <dd>
                  {policy.work_week_consecutive_days_threshold
                    ? `Consecutive-day rule on (${policy.work_week_consecutive_days_threshold} days)`
                    : 'Off'}
                </dd>
              </dl>
              <p className={styles.muted}>
                {policy.assigned_employees.length} people:{' '}
                {policy.assigned_employees
                  .slice(0, 4)
                  .map(a => nameOf(a.uuid))
                  .join(', ')}
                {policy.assigned_employees.length > 4 &&
                  ` and ${policy.assigned_employees.length - 4} more`}
              </p>
              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => {
                    setOvertimeForm(policy)
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => {
                    setAssigning({ kind: 'overtime', policy })
                  }}
                >
                  Assign people
                </button>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => {
                    deletePolicy('overtime', policy)
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.policySection}>
        <div className={styles.sectionHeader}>
          <h2>Break policies</h2>
          <span className={styles.spacer} />
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              setBreakForm('new')
            }}
          >
            New break policy
          </button>
        </div>
        <div className={styles.policyGrid}>
          {breakPolicies.map(policy => (
            <article key={policy.uuid} className={styles.policyCard}>
              <h3>
                {policy.name}{' '}
                {policy.jurisdiction && (
                  <span className={styles.status}>{policy.jurisdiction}</span>
                )}
              </h3>
              <ul className={styles.plainList}>
                {policy.rules.map(rule => (
                  <li key={rule.uuid}>
                    {breakRuleLabel(rule)}, for every {hoursLabel(rule.for_hours_worked_in_minutes)}{' '}
                    worked
                    {rule.minimum_time_required_in_minutes !== null && (
                      <span className={styles.muted}>
                        {' '}
                        · min. shift {hoursLabel(rule.minimum_time_required_in_minutes)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p className={styles.muted}>
                Pay premium for missed breaks: {policy.pay_premium ? 'on' : 'off'}{' '}
                <GapPin id="min-time" />
              </p>
              <p className={styles.muted}>
                {policy.assigned_employees.length} people:{' '}
                {policy.assigned_employees
                  .slice(0, 4)
                  .map(a => nameOf(a.uuid))
                  .join(', ')}
                {policy.assigned_employees.length > 4 &&
                  ` and ${policy.assigned_employees.length - 4} more`}
              </p>
              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => {
                    setBreakForm(policy)
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => {
                    setAssigning({ kind: 'break', policy })
                  }}
                >
                  Assign people
                </button>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => {
                    deletePolicy('break', policy)
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.receipt}>
        <div>
          <strong>When an overtime change takes effect</strong> <GapPin id="ot-effective" />
          <ul className={styles.plainList}>
            {workweeks.map(({ schedule, start, touched }) => (
              <li key={schedule.uuid}>
                {scheduleLabel(schedule)}: workweek starts{' '}
                {schedule.workweek_start_day ?? 'unknown'}
                {start && `, so a change today counts from ${formatDay(start)}`}
                {touched.length > 0 && ` (overlaps ${touched.map(formatPeriod).join(', ')})`}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {overtimeForm && (
        <OvertimeFormModal
          companyId={companyId}
          policy={overtimeForm === 'new' ? null : overtimeForm}
          existingNames={overtimePolicies
            .filter(p => p !== overtimeForm)
            .map(p => p.name.toLowerCase())}
          workweeks={workweeks}
          onClose={() => {
            setOvertimeForm(null)
          }}
        />
      )}
      {breakForm && (
        <BreakFormModal
          companyId={companyId}
          policy={breakForm === 'new' ? null : breakForm}
          existingNames={breakPolicies.filter(p => p !== breakForm).map(p => p.name.toLowerCase())}
          onClose={() => {
            setBreakForm(null)
          }}
        />
      )}
      {assigning && (
        <AssignModal
          kind={assigning.kind}
          policy={assigning.policy}
          people={people}
          breakToday={breakToday}
          onClose={() => {
            setAssigning(null)
          }}
        />
      )}
    </div>
  )
}

function OvertimeFormModal({
  companyId,
  policy,
  existingNames,
  workweeks,
  onClose,
}: {
  companyId: string
  policy: ApiOvertimePolicy | null
  existingNames: string[]
  workweeks: Array<{ schedule: ApiPaySchedule; start: string | null }>
  onClose: () => void
}) {
  const [name, setName] = useState(policy?.name ?? '')
  const [weekly, setWeekly] = useState(String(policy?.weekly_overtime_hours_threshold ?? 40))
  const [hasDaily, setHasDaily] = useState(
    Boolean(policy?.daily_overtime_hours_threshold ?? !policy),
  )
  const [daily, setDaily] = useState(String(policy?.daily_overtime_hours_threshold ?? 8))
  const [hasDouble, setHasDouble] = useState(Boolean(policy?.double_overtime_hours_threshold))
  const [double, setDouble] = useState(String(policy?.double_overtime_hours_threshold ?? 12))
  const [consecutive, setConsecutive] = useState(
    Boolean(policy?.work_week_consecutive_days_threshold),
  )

  const errors: string[] = []
  const weeklyN = Number(weekly)
  const dailyN = Number(daily)
  const doubleN = Number(double)
  if (!name.trim()) errors.push('Policy name is required.')
  if (existingNames.includes(name.trim().toLowerCase()))
    errors.push('There is already another policy with this name.')
  if (!Number.isInteger(weeklyN) || weeklyN < 10 || weeklyN > 168)
    errors.push('Weekly overtime must be a whole number between 10 and 168 hours.')
  if (hasDaily && (!Number.isFinite(dailyN) || dailyN < 1 || dailyN > 24))
    errors.push('Daily overtime must be between 1 and 24 hours.')
  if (hasDouble && (!Number.isFinite(doubleN) || doubleN < 1 || doubleN > 24))
    errors.push('Double overtime must be between 1 and 24 hours.')
  if (hasDouble && !hasDaily)
    errors.push('Double daily overtime can’t exist without daily overtime.')
  if (hasDaily && hasDouble && dailyN >= doubleN)
    errors.push('Daily overtime must be less than double daily overtime.')

  const body = {
    name: name.trim(),
    weekly_overtime_hours_threshold: weeklyN,
    daily_overtime_hours_threshold: hasDaily ? dailyN : null,
    double_overtime_hours_threshold: hasDouble ? doubleN : null,
    work_week_consecutive_days_threshold: consecutive ? 7 : null,
    ...(policy ? { version: policy.version } : {}),
  }

  return (
    <Modal
      wide
      title={policy ? `Edit ${policy.name}` : 'New overtime policy'}
      onClose={onClose}
      footer={
        <button type="button" className={styles.secondaryButton} onClick={onClose}>
          Close
        </button>
      }
    >
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Name</span>
          <input
            value={name}
            onChange={e => {
              setName(e.target.value)
            }}
          />
        </label>
        <label className={styles.field}>
          <span>Weekly overtime after (hours)</span>
          <input
            type="number"
            inputMode="numeric"
            value={weekly}
            onChange={e => {
              setWeekly(e.target.value)
            }}
          />
        </label>
        <label className={styles.checkField}>
          <input
            type="checkbox"
            checked={hasDaily}
            onChange={e => {
              setHasDaily(e.target.checked)
            }}
          />{' '}
          Daily overtime after
          <input
            type="number"
            inputMode="numeric"
            value={daily}
            onChange={e => {
              setDaily(e.target.value)
            }}
            disabled={!hasDaily}
          />{' '}
          hours
        </label>
        <label className={styles.checkField}>
          <input
            type="checkbox"
            checked={hasDouble}
            onChange={e => {
              setHasDouble(e.target.checked)
            }}
          />{' '}
          Double time after
          <input
            type="number"
            inputMode="numeric"
            value={double}
            onChange={e => {
              setDouble(e.target.value)
            }}
            disabled={!hasDouble}
          />{' '}
          hours in a day
        </label>
        <label className={styles.checkField}>
          <input
            type="checkbox"
            checked={consecutive}
            onChange={e => {
              setConsecutive(e.target.checked)
            }}
          />{' '}
          Seventh consecutive day rule
        </label>
      </div>
      <p className={styles.muted}>
        <GapPin id="state" /> There’s no field to say which state this policy is for, so the SDK
        can’t check it against that state’s law.
      </p>
      {errors.length > 0 && (
        <ul className={styles.checkList}>
          {errors.map(e => (
            <li key={e} className={styles.checkFail}>
              ✕ {e}
            </li>
          ))}
        </ul>
      )}
      {policy && (
        <div className={styles.bannerWarning}>
          <GapPin id="ot-effective" /> Changes take effect in the current workweek:{' '}
          {workweeks
            .map(w => `${scheduleLabel(w.schedule)} from ${w.start ? formatDay(w.start) : '?'}`)
            .join('; ')}
          . If a payroll already includes part of that week, it may need a correction payroll.
        </div>
      )}
      <RequestBlock
        method={policy ? 'PATCH' : 'POST'}
        path={
          policy
            ? `/v1/time_tracking/overtime_policies/${policy.uuid}`
            : `/v1/companies/${companyId}/time_tracking/overtime_policies`
        }
        body={body}
        caption={errors.length ? 'The API would reject this as it stands.' : undefined}
      />
      <ReadOnlyNote />
    </Modal>
  )
}

interface RuleDraft {
  key: string
  uuid?: string
  break_type: 'meal' | 'rest'
  duration: string
  everyHours: string
  is_paid: boolean
  minimum: number | null
}

function ruleDraft(rule: ApiBreakRule): RuleDraft {
  return {
    key: rule.uuid,
    uuid: rule.uuid,
    break_type: rule.break_type,
    duration: String(rule.break_duration_in_minutes),
    everyHours: String(rule.for_hours_worked_in_minutes / 60),
    is_paid: rule.is_paid,
    minimum: rule.minimum_time_required_in_minutes,
  }
}

const JURISDICTIONS = ['', 'CA', 'CO', 'IL', 'KY', 'MN', 'NV', 'NY', 'OR', 'WA']

function BreakFormModal({
  companyId,
  policy,
  existingNames,
  onClose,
}: {
  companyId: string
  policy: ApiBreakPolicy | null
  existingNames: string[]
  onClose: () => void
}) {
  const [name, setName] = useState(policy?.name ?? '')
  const [jurisdiction, setJurisdiction] = useState(policy?.jurisdiction ?? '')
  const [payPremium, setPayPremium] = useState(policy?.pay_premium ?? false)
  const [rules, setRules] = useState<RuleDraft[]>(
    policy?.rules.map(ruleDraft) ?? [
      {
        key: 'new-meal',
        break_type: 'meal',
        duration: '30',
        everyHours: '5',
        is_paid: false,
        minimum: null,
      },
    ],
  )

  const update = (key: string, patch: Partial<RuleDraft>) => {
    setRules(prev => prev.map(r => (r.key === key ? { ...r, ...patch } : r)))
  }

  const errors: string[] = []
  if (!name.trim()) errors.push('Policy name is required.')
  if (existingNames.includes(name.trim().toLowerCase()))
    errors.push('Break policy names must be unique for a company.')
  if (rules.length === 0) errors.push('Add a meal or rest break to create this policy.')
  for (const rule of rules) {
    const d = Number(rule.duration)
    if (!Number.isInteger(d) || d < 1)
      errors.push(
        `${rule.break_type === 'meal' ? 'Meal' : 'Rest'}: duration must be a whole number of at least 1 minute.`,
      )
    if (!(Number(rule.everyHours) > 0))
      errors.push(
        `${rule.break_type === 'meal' ? 'Meal' : 'Rest'}: enter how often this break is provided.`,
      )
  }

  const body = {
    name: name.trim(),
    pay_premium: payPremium,
    ...(policy ? { version: policy.version } : jurisdiction ? { jurisdiction } : {}),
    rules: rules.map(rule => ({
      ...(rule.uuid ? { uuid: rule.uuid } : {}),
      break_type: rule.break_type,
      is_paid: rule.is_paid,
      break_duration_in_minutes: Number(rule.duration),
      for_hours_worked_in_minutes: Math.round(Number(rule.everyHours) * 60),
    })),
  }

  return (
    <Modal
      wide
      title={policy ? `Edit ${policy.name}` : 'New break policy'}
      onClose={onClose}
      footer={
        <button type="button" className={styles.secondaryButton} onClick={onClose}>
          Close
        </button>
      }
    >
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Name</span>
          <input
            value={name}
            onChange={e => {
              setName(e.target.value)
            }}
          />
        </label>
        <label className={styles.field}>
          <span>State (jurisdiction) {policy && <GapPin id="break-replace" />}</span>
          <select
            value={jurisdiction}
            disabled={Boolean(policy)}
            onChange={e => {
              setJurisdiction(e.target.value)
            }}
          >
            {JURISDICTIONS.map(j => (
              <option key={j} value={j}>
                {j || 'None'}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.checkField}>
          <input
            type="checkbox"
            checked={payPremium}
            onChange={e => {
              setPayPremium(e.target.checked)
            }}
          />{' '}
          Pay a premium when a break is missed
        </label>
      </div>

      <h3 className={styles.subhead}>Rules</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Minutes</th>
            <th>Every (hours worked)</th>
            <th>Paid</th>
            <th>
              Min. shift <GapPin id="min-time" />
            </th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rules.map(rule => (
            <tr key={rule.key}>
              <td>
                <select
                  value={rule.break_type}
                  onChange={e => {
                    update(rule.key, { break_type: e.target.value as 'meal' | 'rest' })
                  }}
                >
                  <option value="meal">Meal</option>
                  <option value="rest">Rest</option>
                </select>
              </td>
              <td className={styles.field}>
                <input
                  type="number"
                  inputMode="numeric"
                  value={rule.duration}
                  onChange={e => {
                    update(rule.key, { duration: e.target.value })
                  }}
                />
              </td>
              <td className={styles.field}>
                <input
                  type="number"
                  inputMode="numeric"
                  value={rule.everyHours}
                  onChange={e => {
                    update(rule.key, { everyHours: e.target.value })
                  }}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={rule.is_paid}
                  onChange={e => {
                    update(rule.key, { is_paid: e.target.checked })
                  }}
                />
              </td>
              <td className={styles.muted}>
                {rule.minimum !== null ? hoursLabel(rule.minimum) : 'set by the API'}
              </td>
              <td>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => {
                    setRules(prev => prev.filter(r => r.key !== rule.key))
                  }}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.cardActions}>
        {(['meal', 'rest'] as const).map(type => (
          <button
            key={type}
            type="button"
            className={styles.linkButton}
            onClick={() => {
              setRules(prev => [
                ...prev,
                {
                  key: `new-${type}-${prev.length}`,
                  break_type: type,
                  duration: type === 'meal' ? '30' : '10',
                  everyHours: type === 'meal' ? '5' : '4',
                  is_paid: type === 'rest',
                  minimum: null,
                },
              ])
            }}
          >
            + Add {type} break
          </button>
        ))}
      </div>
      {errors.length > 0 && (
        <ul className={styles.checkList}>
          {errors.map(e => (
            <li key={e} className={styles.checkFail}>
              ✕ {e}
            </li>
          ))}
        </ul>
      )}
      {policy && (
        <p className={styles.muted}>
          <GapPin id="break-replace" /> This replaces the whole policy. Rules left out are deleted.
          The state can’t change after the policy is created.
        </p>
      )}
      <RequestBlock
        method={policy ? 'PUT' : 'POST'}
        path={
          policy
            ? `/v1/time_tracking/break_policies/${policy.uuid}`
            : `/v1/companies/${companyId}/time_tracking/break_policies`
        }
        body={body}
        caption={errors.length ? 'The API would reject this as it stands.' : undefined}
      />
      <ReadOnlyNote />
    </Modal>
  )
}

function AssignModal({
  kind,
  policy,
  people,
  breakToday,
  onClose,
}: {
  kind: PolicyKind
  policy: ApiOvertimePolicy | ApiBreakPolicy
  people: Person[]
  breakToday: Set<string>
  onClose: () => void
}) {
  const initial = useMemo(() => new Set(policy.assigned_employees.map(a => a.uuid)), [policy])
  const [selected, setSelected] = useState<Set<string>>(initial)

  const rows = [...people].sort((a, b) => a.name.localeCompare(b.name))
  const toAssign = [...selected].filter(uuid => !initial.has(uuid))
  const toRemove = [...initial].filter(uuid => !selected.has(uuid))
  const resource = kind === 'overtime' ? 'overtime_policies' : 'break_policies'

  const requests = []
  if (toAssign.length) {
    requests.push({
      method: 'PUT',
      path: `/v1/time_tracking/${resource}/${policy.uuid}/assign_employees`,
      body: { version: policy.version, employees: toAssign.map(uuid => ({ uuid })) },
    })
  }
  if (toRemove.length && kind === 'break') {
    requests.push({
      method: 'PUT',
      path: `/v1/time_tracking/break_policies/${policy.uuid}/remove_employees`,
      body: {
        version: toAssign.length ? '<version returned by the assign request>' : policy.version,
        employees: toRemove.map(uuid => ({ uuid })),
      },
    })
  }
  const blocked =
    kind === 'break' ? [...toAssign, ...toRemove].filter(uuid => breakToday.has(uuid)) : []

  const currentPolicyName = (person: Person) =>
    kind === 'overtime' ? person.overtimePolicy?.name : person.breakPolicy?.name

  return (
    <Modal
      wide
      title={`Assign people to ${policy.name}`}
      onClose={onClose}
      footer={
        <button type="button" className={styles.secondaryButton} onClick={onClose}>
          Close
        </button>
      }
    >
      <p className={styles.muted}>
        Each person can be on one {kind} policy. Picking someone here moves them from their current
        one. <GapPin id="eligibility" /> {kind === 'overtime' && <GapPin id="ot-required" />}{' '}
        {kind === 'break' && <GapPin id="break-today" />}
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th />
              <th>Person</th>
              <th>Pay type</th>
              <th>Current {kind} policy</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(person => {
              const elig = eligibility(person.employee)
              const uuid = person.employee.uuid
              const locked = kind === 'overtime' && initial.has(uuid)
              const disabled = !elig.eligible || locked
              const current = currentPolicyName(person)
              return (
                <tr key={uuid} className={!elig.eligible ? styles.dimmed : undefined}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(uuid)}
                      disabled={disabled}
                      aria-label={person.name}
                      onChange={e => {
                        setSelected(prev => {
                          const next = new Set(prev)
                          if (e.target.checked) next.add(uuid)
                          else next.delete(uuid)
                          return next
                        })
                      }}
                    />
                  </td>
                  <td>{person.name}</td>
                  <td className={styles.muted}>{elig.label}</td>
                  <td className={styles.muted}>{current ?? 'None'}</td>
                  <td className={styles.muted}>
                    {!elig.eligible && `Not eligible: ${elig.reason}`}
                    {locked && 'To take them off, assign them to another overtime policy'}
                    {elig.eligible &&
                      !locked &&
                      kind === 'break' &&
                      breakToday.has(uuid) &&
                      'Took a break today: can’t change until tomorrow'}
                    {elig.eligible &&
                      !locked &&
                      current &&
                      current !== policy.name &&
                      selected.has(uuid) &&
                      `Moves from ${current}`}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {blocked.length > 0 && (
        <div className={styles.bannerWarning}>
          This would fail because some people took a break today. The API’s error won’t say who.
        </div>
      )}
      {requests.length === 0 ? (
        <p className={styles.muted}>Change who’s selected to see the request.</p>
      ) : (
        requests.map((r, i) => (
          <RequestBlock
            key={r.path}
            method={r.method}
            path={r.path}
            body={r.body}
            caption={requests.length > 1 ? `Step ${i + 1} of ${requests.length}` : undefined}
          />
        ))
      )}
      <p className={styles.muted}>
        If anyone selected is ineligible, the whole request fails, without saying who.
      </p>
      <ReadOnlyNote />
    </Modal>
  )
}
