import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import type { EntityIds } from '../useEntities'
import { getAllPages, getJson, useRequestLog, withQuery } from './api'
import { GAPS, GAP_KIND_LABEL, GAP_NUMBER, type Tab } from './gaps'
import {
  EFFECT_LABEL,
  REVIEW_STATE_LABEL,
  addDays,
  crossesMidnight,
  employeeName,
  flsaStatus,
  formatDateTime,
  formatDay,
  formatHours,
  formatPeriod,
  formatShortDate,
  formatTime,
  localStartDate,
  overlaps,
  periodKey,
  primaryJob,
  resolvePaySchedule,
  reviewState,
  scheduleLabel,
  syncEffect,
  workedHours,
  type ApiAssignments,
  type ApiBreakPolicy,
  type ApiOvertimePolicy,
  type ApiEmployee,
  type ApiPayPeriod,
  type ApiPaySchedule,
  type ApiShift,
  type Person,
  type ReviewState,
  type ShiftStatus,
} from './model'
import { AddShiftModal } from './AddShiftModal'
import { EditShiftModal } from './EditShiftModal'
import { PayrollTab } from './PayrollTab'
import { PoliciesTab } from './PoliciesTab'
import type { Preview } from './preview'
import { SendModal } from './SendModal'
import { GapContext } from './gapContext'
import { GapPin, Modal, ReadOnlyNote, RequestBlock } from './parts'
import styles from './TimeTrackingReview.module.scss'

interface BaseData {
  schedules: ApiPaySchedule[]
  periods: ApiPayPeriod[]
  assignments: ApiAssignments
  employees: ApiEmployee[]
  breakPolicies: ApiBreakPolicy[]
  overtimePolicies: ApiOvertimePolicy[]
  latestShiftAt: string | null
}

interface ShiftLoad {
  fetched: number
  kept: ApiShift[]
}

type Load<T> = { kind: 'loading' } | { kind: 'error'; message: string } | { kind: 'done'; data: T }

const TABS: Array<{ value: Tab; label: string }> = [
  { value: 'review', label: 'Timesheets' },
  { value: 'policies', label: 'Policies' },
  { value: 'payroll', label: 'Run payroll (another flow)' },
]

type StatusFilter = 'all' | 'needs-review' | 'unsent' | 'sent' | 'changed'

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string; states: ReviewState[] }> = [
  {
    value: 'all',
    label: 'All shifts',
    states: ['open', 'pending', 'rejected', 'unsent', 'sent', 'changed'],
  },
  { value: 'needs-review', label: 'Needs review', states: ['open', 'pending', 'rejected'] },
  { value: 'unsent', label: 'Approved · not sent', states: ['unsent'] },
  { value: 'changed', label: 'Changed since send?', states: ['changed'] },
  { value: 'sent', label: 'Approved · sent', states: ['sent'] },
]

const BATCH_LIMIT = 500

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function TimeTrackingReview() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const companyId = entities.companyId
  const requestLog = useRequestLog()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: Tab = TABS.some(t => t.value === searchParams.get('tab'))
    ? (searchParams.get('tab') as Tab)
    : 'review'
  const setTab = (next: Tab) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev)
      params.set('tab', next)
      return params
    })
  }

  const [base, setBase] = useState<Load<BaseData>>({ kind: 'loading' })
  const [scheduleUuid, setScheduleUuid] = useState('')
  const [selectedPeriodKey, setSelectedPeriodKey] = useState('')
  const [shifts, setShifts] = useState<Load<ShiftLoad>>({ kind: 'loading' })
  const [reloadToken, setReloadToken] = useState(0)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [grouped, setGrouped] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [focusPerson, setFocusPerson] = useState<string | null>(null)

  const [gapsOn, setGapsOn] = useState(true)
  const [activeGap, setActiveGap] = useState<string | null>(null)
  const [logOpen, setLogOpen] = useState(false)

  const [preview, setPreview] = useState<Preview | null>(null)
  const [editing, setEditing] = useState<ApiShift | null>(null)
  const [adding, setAdding] = useState<{ personUuid: string | null } | null>(null)
  const [sendOpen, setSendOpen] = useState(false)
  const [sendWhenLoaded, setSendWhenLoaded] = useState(false)

  useEffect(() => {
    if (!companyId) return
    const controller = new AbortController()
    const { signal } = controller
    const company = `/v1/companies/${companyId}`
    const today = todayIso()
    setBase({ kind: 'loading' })
    void (async () => {
      try {
        const [
          schedules,
          periods,
          assignments,
          employees,
          breakPolicies,
          overtimePolicies,
          latest,
        ] = await Promise.all([
          getJson(`${company}/pay_schedules`, signal),
          getJson(
            withQuery(`${company}/pay_periods`, {
              start_date: addDays(today, -180),
              end_date: addDays(today, 60),
            }),
            signal,
          ),
          getJson(`${company}/pay_schedules/assignments`, signal),
          getAllPages<ApiEmployee>(`${company}/employees`, 100, signal),
          getJson(`${company}/time_tracking/break_policies`, signal),
          getJson(`${company}/time_tracking/overtime_policies`, signal),
          getJson(
            withQuery(`${company}/time_tracking/time_sheets`, {
              entity_type: 'Employee',
              sort_by: 'shift_started_at',
              sort_order: 'desc',
              per: '1',
            }),
            signal,
          ),
        ])
        setBase({
          kind: 'done',
          data: {
            schedules: (schedules.body as ApiPaySchedule[]).filter(s => s.active),
            periods: (periods.body as ApiPayPeriod[]).filter(
              p => p.payroll?.payroll_type !== 'transition',
            ),
            assignments: assignments.body as ApiAssignments,
            employees: employees.filter(e => !e.terminated),
            breakPolicies: breakPolicies.body as ApiBreakPolicy[],
            overtimePolicies: overtimePolicies.body as ApiOvertimePolicy[],
            latestShiftAt: (latest.body as ApiShift[])[0]?.shift_started_at ?? null,
          },
        })
      } catch (error) {
        if (!signal.aborted) setBase({ kind: 'error', message: errorMessage(error) })
      }
    })()
    return () => {
      controller.abort()
    }
  }, [companyId, reloadToken])

  const data = base.kind === 'done' ? base.data : null

  const people = useMemo<Person[]>(() => {
    if (!data) return []
    return data.employees.map(employee => {
      const flsa = flsaStatus(employee)
      return {
        employee,
        name: employeeName(employee),
        title: primaryJob(employee)?.title ?? '',
        flsa,
        effect: syncEffect(flsa),
        scheduleUuid: resolvePaySchedule(employee, data.assignments),
        breakPolicy: data.breakPolicies.find(p =>
          p.assigned_employees.some(a => a.uuid === employee.uuid),
        ),
        overtimePolicy: data.overtimePolicies.find(p =>
          p.assigned_employees.some(a => a.uuid === employee.uuid),
        ),
      }
    })
  }, [data])

  const unassignedCount = people.filter(p => !p.scheduleUuid).length

  useEffect(() => {
    if (!data || scheduleUuid) return
    const counts = data.schedules.map(s => ({
      uuid: s.uuid,
      count: people.filter(p => p.scheduleUuid === s.uuid).length,
    }))
    counts.sort((a, b) => b.count - a.count)
    if (counts[0]) setScheduleUuid(counts[0].uuid)
  }, [data, people, scheduleUuid])

  const schedulePeriods = useMemo(
    () =>
      (data?.periods ?? [])
        .filter(p => p.pay_schedule_uuid === scheduleUuid)
        .sort((a, b) => a.start_date.localeCompare(b.start_date)),
    [data, scheduleUuid],
  )

  const latestShiftDate = data?.latestShiftAt ? data.latestShiftAt.slice(0, 10) : null

  useEffect(() => {
    if (!schedulePeriods.length) return
    if (schedulePeriods.some(p => periodKey(p) === selectedPeriodKey)) return
    const anchor = latestShiftDate ?? todayIso()
    const fullyCovered = schedulePeriods.filter(p => p.end_date <= anchor)
    const match =
      fullyCovered[fullyCovered.length - 1] ??
      schedulePeriods.find(p => p.start_date <= anchor && anchor <= p.end_date) ??
      schedulePeriods.find(p => p.start_date <= todayIso() && todayIso() <= p.end_date) ??
      schedulePeriods[schedulePeriods.length - 1]!
    setSelectedPeriodKey(periodKey(match))
  }, [schedulePeriods, selectedPeriodKey, latestShiftDate])

  const periodIndex = schedulePeriods.findIndex(p => periodKey(p) === selectedPeriodKey)
  const period = periodIndex >= 0 ? schedulePeriods[periodIndex]! : null
  const schedule = data?.schedules.find(s => s.uuid === scheduleUuid) ?? null
  const schedulePeople = useMemo(
    () => people.filter(p => p.scheduleUuid === scheduleUuid),
    [people, scheduleUuid],
  )

  useEffect(() => {
    if (!companyId || !period) return
    if (!schedulePeople.length) {
      setShifts({ kind: 'done', data: { fetched: 0, kept: [] } })
      return
    }
    const controller = new AbortController()
    setShifts({ kind: 'loading' })
    setExpanded(new Set())
    setFocusPerson(null)
    const path = withQuery(`/v1/companies/${companyId}/time_tracking/time_sheets`, {
      entity_type: 'Employee',
      entity_uuids: schedulePeople.map(p => p.employee.uuid),
      shift_started_after: `${addDays(period.start_date, -1)}T00:00:00Z`,
      shift_started_before: `${addDays(period.end_date, 2)}T00:00:00Z`,
      sort_by: 'shift_started_at',
      sort_order: 'asc',
    })
    void (async () => {
      try {
        const all = await getAllPages<ApiShift>(path, BATCH_LIMIT, controller.signal)
        const kept = all.filter(shift => {
          const date = localStartDate(shift)
          return date >= period.start_date && date <= period.end_date
        })
        setShifts({ kind: 'done', data: { fetched: all.length, kept } })
      } catch (error) {
        if (!controller.signal.aborted) setShifts({ kind: 'error', message: errorMessage(error) })
      }
    })()
    return () => {
      controller.abort()
    }
  }, [companyId, period, schedulePeople])

  useEffect(() => {
    if (sendWhenLoaded && shifts.kind === 'done') {
      setSendWhenLoaded(false)
      setSendOpen(true)
    }
  }, [sendWhenLoaded, shifts])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, select, [role="dialog"]')) return
      if (event.key === 'g' || event.key === 'G') setGapsOn(on => !on)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const selectGap = useCallback((id: string) => {
    setGapsOn(true)
    setActiveGap(id)
    document.getElementById(`gap-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [])

  const periodShifts = useMemo(() => (shifts.kind === 'done' ? shifts.data.kept : []), [shifts])
  const visibleStates = STATUS_FILTERS.find(f => f.value === statusFilter)!.states

  const byPerson = useMemo(() => {
    const map = new Map<string, ApiShift[]>()
    for (const shift of periodShifts) {
      const list = map.get(shift.entity_uuid) ?? []
      list.push(shift)
      map.set(shift.entity_uuid, list)
    }
    return map
  }, [periodShifts])

  const stats = useMemo(() => {
    const counts: Record<ReviewState, number> = {
      open: 0,
      pending: 0,
      rejected: 0,
      unsent: 0,
      sent: 0,
      changed: 0,
    }
    let hours = 0
    for (const shift of periodShifts) {
      counts[reviewState(shift)] += 1
      hours += workedHours(shift)
    }
    return { counts, hours }
  }, [periodShifts])

  const syncedShifts = periodShifts.filter(s => s.synced_to_payroll_at)
  const lastSyncAt = syncedShifts.reduce<string | null>(
    (latest, s) => (!latest || s.synced_to_payroll_at! > latest ? s.synced_to_payroll_at! : latest),
    null,
  )

  const overlappingProcessed = period
    ? (data?.periods ?? []).filter(
        p => p.pay_schedule_uuid !== scheduleUuid && p.payroll?.processed && overlaps(p, period),
      )
    : []

  const latestShiftPeriod =
    latestShiftDate &&
    schedulePeriods.find(p => p.start_date <= latestShiftDate && latestShiftDate <= p.end_date)

  const statusPreview = (targets: ApiShift[], status: ShiftStatus, title: string) => {
    if (targets.length === 1) {
      const shift = targets[0]!
      setPreview({
        title,
        requests: [
          {
            method: 'PATCH',
            path: `/v1/time_tracking/time_sheets/${shift.uuid}`,
            body: { version: shift.version, status },
          },
        ],
        gapIds: shift.synced_to_payroll_at ? ['changed', 'lock-bug'] : ['approval', 'lock-bug'],
      })
      return
    }
    const chunks = Math.ceil(targets.length / BATCH_LIMIT)
    const firstChunk = targets.slice(0, BATCH_LIMIT)
    const shown = firstChunk.slice(0, 3).map(shift => ({
      external_id: shift.uuid,
      uuid: shift.uuid,
      version: shift.version,
      status,
    }))
    setPreview({
      title,
      requests: [
        {
          method: 'POST',
          path: `/v1/companies/${companyId}/time_tracking/time_sheets_batches`,
          body: {
            idempotency_key: '<new uuid per attempt>',
            batch_action: 'update',
            time_sheets:
              firstChunk.length > 3 ? [...shown, `… ${firstChunk.length - 3} more`] : shown,
          },
          caption: `${targets.length} shifts in ${chunks} batch${chunks === 1 ? '' : 'es'}. Then poll GET /v1/time_tracking/time_sheets_batches/{uuid} and reconcile each item's errors.`,
        },
      ],
      gapIds: ['batch', 'lock-bug'],
    })
  }

  const statusActions = (shift: ApiShift) => {
    const name = people.find(p => p.employee.uuid === shift.entity_uuid)?.name ?? 'this person'
    const label = `${name}, ${formatDay(localStartDate(shift))}`
    const actions: Array<{ label: string; status: ShiftStatus }> = []
    if (shift.status !== 'approved' && shift.shift_ended_at)
      actions.push({ label: 'Approve', status: 'approved' })
    if (shift.status !== 'rejected') actions.push({ label: 'Reject', status: 'rejected' })
    if (shift.status !== 'pending') actions.push({ label: 'Return to pending', status: 'pending' })
    return (
      <div className={styles.rowActions}>
        {actions.map(action => (
          <button
            key={action.status}
            type="button"
            className={styles.linkButton}
            onClick={() => {
              statusPreview([shift], action.status, `${action.label}: ${label}`)
            }}
          >
            {action.label}
          </button>
        ))}
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => {
            setEditing(shift)
          }}
        >
          Edit
        </button>
      </div>
    )
  }

  const shiftRow = (shift: ApiShift, showPerson: boolean) => {
    const state = reviewState(shift)
    const person = people.find(p => p.employee.uuid === shift.entity_uuid)
    const rules = new Map(person?.breakPolicy?.rules.map(rule => [rule.uuid, rule]))
    const breaks = shift.breaks.map(b => {
      const rule = b.break_rule_uuid ? rules.get(b.break_rule_uuid) : undefined
      const minutes = b.end_time
        ? Math.round((Date.parse(b.end_time) - Date.parse(b.start_time)) / 60000)
        : null
      const kind = rule ? (rule.break_type === 'meal' ? 'Meal' : 'Rest') : 'Break'
      return `${kind} ${minutes ?? '…'}m${rule && !rule.is_paid ? ' unpaid' : ''}`
    })
    return (
      <tr key={shift.uuid} className={styles.shiftRow}>
        {showPerson && <td>{person?.name}</td>}
        <td className={styles.nowrap}>{formatDay(localStartDate(shift))}</td>
        <td className={styles.nowrap}>
          {formatTime(shift.shift_started_at, shift.time_zone)} –{' '}
          {shift.shift_ended_at ? formatTime(shift.shift_ended_at, shift.time_zone) : 'now'}
          {crossesMidnight(shift) && <span className={styles.plusDay}>+1 day</span>}
        </td>
        <td className={styles.muted}>{breaks.join(', ') || 'No breaks'}</td>
        <td className={styles.num}>{formatHours(workedHours(shift))}</td>
        <td className={styles.num}>—</td>
        <td>
          <span className={`${styles.status} ${styles[`status_${state}`]}`}>
            {REVIEW_STATE_LABEL[state]}
            {shift.synced_to_payroll_at &&
              state !== 'changed' &&
              ` ${formatShortDate(shift.synced_to_payroll_at.slice(0, 10))}`}
          </span>
          {state === 'changed' && <GapPin id="changed" />}
        </td>
        <td>{statusActions(shift)}</td>
      </tr>
    )
  }

  const personSummary = (list: ApiShift[]) => {
    const counts = new Map<ReviewState, number>()
    for (const shift of list)
      counts.set(reviewState(shift), (counts.get(reviewState(shift)) ?? 0) + 1)
    return [...counts.entries()]
      .map(([state, count]) => `${count} ${REVIEW_STATE_LABEL[state].toLowerCase()}`)
      .join(' · ')
  }

  const visiblePeople = schedulePeople
    .map(person => ({
      person,
      shifts: (byPerson.get(person.employee.uuid) ?? []).filter(s =>
        visibleStates.includes(reviewState(s)),
      ),
      all: byPerson.get(person.employee.uuid) ?? [],
    }))
    .filter(row => row.shifts.length > 0)
    .sort((a, b) => a.person.name.localeCompare(b.person.name))

  const peopleWithoutShifts = schedulePeople.filter(p => !byPerson.has(p.employee.uuid))
  const pendingInPeriod = periodShifts.filter(s => s.status === 'pending' && s.shift_ended_at)

  const shiftHeader = (showPerson: boolean) => (
    <tr>
      {showPerson && <th>Person</th>}
      <th>Date</th>
      <th>Time</th>
      <th>Breaks</th>
      <th className={styles.num}>Worked</th>
      <th className={styles.num}>
        Overtime <GapPin id="overtime" />
      </th>
      <th>Status</th>
      <th />
    </tr>
  )

  const focused = focusPerson
    ? visiblePeople.find(row => row.person.employee.uuid === focusPerson)
    : null

  return (
    <GapContext.Provider value={{ on: gapsOn, active: activeGap, setActive: selectGap }}>
      <div className={`${styles.root} ${gapsOn ? styles.withGaps : ''}`}>
        <div className={styles.main}>
          <header className={styles.header}>
            <div>
              <h1>Time tracking review</h1>
              <p className={styles.hint}>
                The prototype’s review page, on real data from the demo company (partner mode). It
                only reads. Every action shows the request it would send.
              </p>
            </div>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setLogOpen(true)
                }}
              >
                Requests ({requestLog.length})
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setGapsOn(on => !on)
                }}
              >
                {gapsOn ? 'Hide gaps' : 'Show gaps'} <kbd>G</kbd>
              </button>
            </div>
          </header>

          {base.kind === 'loading' && (
            <div className={styles.placeholder}>Loading pay schedules, people and policies…</div>
          )}
          {base.kind === 'error' && (
            <div className={styles.error}>
              {base.message}{' '}
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => {
                  setReloadToken(t => t + 1)
                }}
              >
                Try again
              </button>
            </div>
          )}

          {data && (
            <nav className={styles.tabs} aria-label="Sections">
              {TABS.map(t => (
                <button
                  key={t.value}
                  type="button"
                  aria-current={tab === t.value ? 'page' : undefined}
                  onClick={() => {
                    setTab(t.value)
                  }}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          )}

          {data && tab === 'policies' && (
            <PoliciesTab
              companyId={companyId}
              people={people}
              schedules={data.schedules}
              periods={data.periods}
              overtimePolicies={data.overtimePolicies}
              breakPolicies={data.breakPolicies}
              onPreview={setPreview}
            />
          )}

          {data && tab === 'payroll' && (
            <PayrollTab
              companyId={companyId}
              people={people}
              schedules={data.schedules}
              periods={data.periods}
              onPreview={setPreview}
              onReview={(nextSchedule, key, openSend) => {
                setScheduleUuid(nextSchedule)
                setSelectedPeriodKey(key)
                setStatusFilter('all')
                setTab('review')
                if (openSend) setSendWhenLoaded(true)
              }}
            />
          )}

          {data && tab === 'review' && (
            <>
              <section className={styles.toolbar}>
                <label className={styles.field}>
                  <span>Pay schedule</span>
                  <select
                    value={scheduleUuid}
                    onChange={event => {
                      setScheduleUuid(event.target.value)
                      setSelectedPeriodKey('')
                    }}
                  >
                    {data.schedules.map(s => (
                      <option key={s.uuid} value={s.uuid}>
                        {scheduleLabel(s)} ({people.filter(p => p.scheduleUuid === s.uuid).length}{' '}
                        people)
                      </option>
                    ))}
                  </select>
                </label>
                <div className={styles.field}>
                  <span>
                    Pay period <GapPin id="period" />
                  </span>
                  <div className={styles.periodPicker}>
                    <button
                      type="button"
                      className={styles.iconButton}
                      disabled={periodIndex <= 0}
                      onClick={() => {
                        setSelectedPeriodKey(periodKey(schedulePeriods[periodIndex - 1]!))
                      }}
                      aria-label="Previous period"
                    >
                      ‹
                    </button>
                    <select
                      value={selectedPeriodKey}
                      onChange={event => {
                        setSelectedPeriodKey(event.target.value)
                      }}
                    >
                      {schedulePeriods.map(p => (
                        <option key={periodKey(p)} value={periodKey(p)}>
                          {formatPeriod(p)}
                          {p.payroll?.processed ? ' · processed' : ''}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={styles.iconButton}
                      disabled={periodIndex < 0 || periodIndex >= schedulePeriods.length - 1}
                      onClick={() => {
                        setSelectedPeriodKey(periodKey(schedulePeriods[periodIndex + 1]!))
                      }}
                      aria-label="Next period"
                    >
                      ›
                    </button>
                  </div>
                </div>
                <div className={styles.sendArea}>
                  <GapPin id="scope" />
                  <button
                    type="button"
                    className={styles.primaryButton}
                    disabled={!period || shifts.kind !== 'done'}
                    onClick={() => {
                      setSendOpen(true)
                    }}
                  >
                    {lastSyncAt ? 'Update payroll' : 'Send to payroll'} ·{' '}
                    {period ? formatPeriod(period) : ''}
                  </button>
                </div>
              </section>

              {period?.payroll && (
                <p className={styles.payrollLine}>
                  {schedule && scheduleLabel(schedule)} payroll · check date{' '}
                  {formatShortDate(period.payroll.check_date)} · deadline{' '}
                  {formatDateTime(period.payroll.payroll_deadline)} ·{' '}
                  {period.payroll.processed ? 'processed' : 'not processed yet'}
                </p>
              )}

              {period?.payroll?.processed && (
                <div className={styles.bannerWarning}>
                  This period’s payroll is processed. Sending again won’t change it, and status
                  changes are blocked.
                </div>
              )}
              {overlappingProcessed.length > 0 && (
                <div className={styles.bannerWarning}>
                  <GapPin id="lock-bug" /> Another schedule has a processed payroll overlapping
                  these dates ({overlappingProcessed.map(formatPeriod).join(', ')}). The API may
                  block status changes here too.
                </div>
              )}

              <section className={styles.receipt}>
                <div>
                  <strong>Last send for this period</strong> <GapPin id="receipt" />
                  {lastSyncAt ? (
                    <p>
                      {formatDateTime(lastSyncAt)} (inferred from synced_to_payroll_at).{' '}
                      {syncedShifts.length} shifts have a timestamp; {stats.counts.changed} look
                      changed since.
                    </p>
                  ) : (
                    <p>Nothing sent yet. No shift in this period has synced_to_payroll_at.</p>
                  )}
                </div>
                <GapPin id="which-payroll" />
              </section>

              {shifts.kind === 'loading' && (
                <div className={styles.placeholder}>Loading shifts…</div>
              )}
              {shifts.kind === 'error' && <div className={styles.error}>{shifts.message}</div>}

              {shifts.kind === 'done' && (
                <>
                  <section className={styles.stats}>
                    <Stat
                      label="People on schedule"
                      value={`${schedulePeople.length - peopleWithoutShifts.length} / ${schedulePeople.length}`}
                      hint="with shifts"
                      gap="membership"
                    />
                    <Stat
                      label="Shifts"
                      value={String(periodShifts.length)}
                      hint={`${shifts.data.fetched} fetched, ${periodShifts.length} by local date`}
                    />
                    <Stat
                      label="Hours worked"
                      value={formatHours(stats.hours)}
                      hint="unclassified"
                      gap="overtime"
                    />
                    <Stat label="Pending" value={String(stats.counts.pending)} gap="approval" />
                    <Stat label="Approved · not sent" value={String(stats.counts.unsent)} />
                    <Stat
                      label="Approved · sent"
                      value={String(stats.counts.sent + stats.counts.changed)}
                    />
                    <Stat label="Still clocked in" value={String(stats.counts.open)} />
                    <Stat label="Rejected" value={String(stats.counts.rejected)} />
                  </section>

                  {periodShifts.length === 0 && (
                    <div className={styles.bannerInfo}>
                      No shifts in this period.{' '}
                      <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() => {
                          setAdding({ personUuid: null })
                        }}
                      >
                        Add shift
                      </button>
                      {data.latestShiftAt && (
                        <>
                          {' '}
                          The latest shift in this company starts{' '}
                          {formatDateTime(data.latestShiftAt)}.{' '}
                          {latestShiftPeriod &&
                            periodKey(latestShiftPeriod) !== selectedPeriodKey && (
                              <button
                                type="button"
                                className={styles.linkButton}
                                onClick={() => {
                                  setSelectedPeriodKey(periodKey(latestShiftPeriod))
                                }}
                              >
                                Go to {formatPeriod(latestShiftPeriod)}
                              </button>
                            )}
                        </>
                      )}
                    </div>
                  )}

                  {periodShifts.length > 0 && (
                    <>
                      <section className={styles.filters}>
                        <label className={styles.inlineField}>
                          <span>Show</span>
                          <select
                            value={statusFilter}
                            onChange={event => {
                              setStatusFilter(event.target.value as StatusFilter)
                            }}
                          >
                            {STATUS_FILTERS.map(f => (
                              <option key={f.value} value={f.value}>
                                {f.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className={styles.segmented} role="group" aria-label="Layout">
                          <button
                            type="button"
                            aria-pressed={grouped}
                            onClick={() => {
                              setGrouped(true)
                              setFocusPerson(null)
                            }}
                          >
                            Grouped rows
                          </button>
                          <button
                            type="button"
                            aria-pressed={!grouped}
                            onClick={() => {
                              setGrouped(false)
                            }}
                          >
                            Row per person
                          </button>
                        </div>
                        <GapPin id="grouped-rows" />
                        <span className={styles.spacer} />
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          onClick={() => {
                            setAdding({ personUuid: null })
                          }}
                        >
                          Add shift
                        </button>
                        {pendingInPeriod.length > 0 && (
                          <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => {
                              statusPreview(
                                pendingInPeriod,
                                'approved',
                                `Approve all pending (${pendingInPeriod.length})`,
                              )
                            }}
                          >
                            Approve all pending ({pendingInPeriod.length})
                            <GapPin id="batch" />
                          </button>
                        )}
                      </section>

                      {visiblePeople.length === 0 && (
                        <div className={styles.placeholder}>No shifts match this filter.</div>
                      )}

                      {visiblePeople.length > 0 && !focused && (
                        <div className={styles.tableWrap}>
                          <table className={styles.table}>
                            <thead>
                              <tr>
                                {grouped && <th className={styles.chevronCell} />}
                                <th>Person</th>
                                <th>
                                  Hours sync <GapPin id="flsa" />
                                </th>
                                <th>Policies</th>
                                <th className={styles.num}>Shifts</th>
                                <th className={styles.num}>Worked</th>
                                <th className={styles.num}>
                                  Overtime <GapPin id="overtime" />
                                </th>
                                <th>Status</th>
                                <th />
                              </tr>
                            </thead>
                            <tbody>
                              {visiblePeople.map(({ person, shifts: list, all }) => {
                                const isOpen = grouped && expanded.has(person.employee.uuid)
                                const pending = all.filter(
                                  s => s.status === 'pending' && s.shift_ended_at,
                                )
                                return (
                                  <Fragment key={person.employee.uuid}>
                                    <tr
                                      className={`${styles.personRow} ${grouped ? styles.clickable : ''}`}
                                      onClick={() => {
                                        if (!grouped) return
                                        setExpanded(prev => {
                                          const next = new Set(prev)
                                          if (next.has(person.employee.uuid))
                                            next.delete(person.employee.uuid)
                                          else next.add(person.employee.uuid)
                                          return next
                                        })
                                      }}
                                    >
                                      {grouped && (
                                        <td className={styles.chevronCell}>{isOpen ? '▾' : '▸'}</td>
                                      )}
                                      <td>
                                        <div className={styles.personName}>{person.name}</div>
                                        <div className={styles.muted}>{person.title}</div>
                                      </td>
                                      <td>
                                        <span
                                          className={`${styles.effect} ${styles[`effect_${person.effect}`]}`}
                                        >
                                          {EFFECT_LABEL[person.effect]}
                                        </span>
                                        <div className={styles.muted}>{person.flsa}</div>
                                      </td>
                                      <td className={styles.muted}>
                                        {person.overtimePolicy?.name ?? 'No overtime policy'}
                                        <br />
                                        {person.breakPolicy?.name ?? 'No break policy'}
                                        {person.breakPolicy?.jurisdiction &&
                                          ` (${person.breakPolicy.jurisdiction})`}
                                      </td>
                                      <td className={styles.num}>{list.length}</td>
                                      <td className={styles.num}>
                                        {formatHours(
                                          list.reduce((sum, s) => sum + workedHours(s), 0),
                                        )}
                                      </td>
                                      <td className={styles.num}>—</td>
                                      <td className={styles.muted}>{personSummary(list)}</td>
                                      <td
                                        onClick={event => {
                                          event.stopPropagation()
                                        }}
                                      >
                                        <div className={styles.rowActions}>
                                          {pending.length > 0 && (
                                            <button
                                              type="button"
                                              className={styles.linkButton}
                                              onClick={() => {
                                                statusPreview(
                                                  pending,
                                                  'approved',
                                                  `Approve ${person.name}’s ${pending.length} pending shifts`,
                                                )
                                              }}
                                            >
                                              Approve all ({pending.length})
                                            </button>
                                          )}
                                          <button
                                            type="button"
                                            className={styles.linkButton}
                                            onClick={() => {
                                              setAdding({ personUuid: person.employee.uuid })
                                            }}
                                          >
                                            Add shift
                                          </button>
                                          {!grouped && (
                                            <button
                                              type="button"
                                              className={styles.linkButton}
                                              onClick={() => {
                                                setFocusPerson(person.employee.uuid)
                                              }}
                                            >
                                              See shifts
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                    {isOpen && (
                                      <tr className={styles.nestedRow}>
                                        <td />
                                        <td colSpan={8}>
                                          <table className={styles.innerTable}>
                                            <thead>{shiftHeader(false)}</thead>
                                            <tbody>
                                              {list.map(shift => shiftRow(shift, false))}
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    )}
                                  </Fragment>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {focused && (
                        <section className={styles.focusSection}>
                          <div className={styles.focusHeader}>
                            <button
                              type="button"
                              className={styles.linkButton}
                              onClick={() => {
                                setFocusPerson(null)
                              }}
                            >
                              ‹ All people
                            </button>
                            <h2>
                              {focused.person.name} · {focused.shifts.length} shifts
                            </h2>
                          </div>
                          <div className={styles.tableWrap}>
                            <table className={styles.table}>
                              <thead>{shiftHeader(false)}</thead>
                              <tbody>{focused.shifts.map(shift => shiftRow(shift, false))}</tbody>
                            </table>
                          </div>
                        </section>
                      )}

                      {peopleWithoutShifts.length > 0 && (
                        <p className={styles.muted}>
                          No shifts this period: {peopleWithoutShifts.map(p => p.name).join(', ')}.
                        </p>
                      )}
                    </>
                  )}
                  {unassignedCount > 0 && (
                    <p className={styles.muted}>
                      {unassignedCount} {unassignedCount === 1 ? 'person has' : 'people have'} no
                      pay schedule assignment, so they don’t appear on any schedule.{' '}
                      <GapPin id="membership" />
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {gapsOn && (
          <aside className={styles.gapsPanel} aria-label="API gaps">
            <div className={styles.gapsHeader}>
              <h2>API gaps on this page</h2>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => {
                  setGapsOn(false)
                }}
                aria-label="Hide gaps"
              >
                ×
              </button>
            </div>
            <p className={styles.muted}>
              From the real API and the Tspec appendix (Nov 19). Click a numbered pin to jump here.
            </p>
            <ol className={styles.gapList}>
              {GAPS.filter(gap => gap.tabs.includes(tab)).map(gap => (
                <li
                  key={gap.id}
                  id={`gap-${gap.id}`}
                  className={`${styles.gap} ${activeGap === gap.id ? styles.gapActive : ''}`}
                >
                  <div className={styles.gapTitle}>
                    <span className={styles.gapNumber}>{GAP_NUMBER[gap.id]}</span>
                    <span>{gap.title}</span>
                  </div>
                  <span className={`${styles.gapKind} ${styles[`kind_${gap.kind}`]}`}>
                    {GAP_KIND_LABEL[gap.kind]}
                  </span>
                  <p>
                    <strong>API:</strong> {gap.api}
                  </p>
                  <p>
                    <strong>Here:</strong> {gap.here}
                  </p>
                </li>
              ))}
            </ol>
          </aside>
        )}

        {preview && (
          <Modal
            title={preview.title}
            onClose={() => {
              setPreview(null)
            }}
            footer={
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setPreview(null)
                }}
              >
                Close
              </button>
            }
          >
            {preview.requests.map((r, i) => (
              <RequestBlock
                key={`${r.method}-${r.path}-${i}`}
                method={r.method}
                path={r.path}
                body={r.body}
                caption={r.caption}
              />
            ))}
            {preview.notes && (
              <ul className={styles.plainList}>
                {preview.notes.map(note => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
            <ReadOnlyNote />
            <p className={styles.muted}>
              Related gaps:{' '}
              {preview.gapIds.map(id => (
                <GapPin key={id} id={id} />
              ))}
              {!gapsOn && preview.gapIds.map(id => `#${GAP_NUMBER[id]}`).join(', ')}
            </p>
          </Modal>
        )}

        {editing && (
          <EditShiftModal
            shift={editing}
            person={people.find(p => p.employee.uuid === editing.entity_uuid)}
            onClose={() => {
              setEditing(null)
            }}
          />
        )}

        {adding && period && (
          <AddShiftModal
            companyId={companyId}
            people={schedulePeople}
            period={period}
            shifts={periodShifts}
            initialPersonUuid={adding.personUuid}
            onClose={() => {
              setAdding(null)
            }}
          />
        )}

        {sendOpen && period && schedule && (
          <SendModal
            companyId={companyId}
            schedule={schedule}
            period={period}
            people={schedulePeople}
            shifts={periodShifts}
            isUpdate={Boolean(lastSyncAt)}
            onClose={() => {
              setSendOpen(false)
            }}
            onReview={personUuid => {
              setSendOpen(false)
              setStatusFilter('all')
              setGrouped(true)
              setFocusPerson(null)
              setExpanded(new Set([personUuid]))
            }}
          />
        )}

        {logOpen && (
          <Modal
            title={`Requests this session (${requestLog.length})`}
            onClose={() => {
              setLogOpen(false)
            }}
            wide
          >
            <p className={styles.muted}>Every call is a GET through the dev proxy. Newest first.</p>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Path</th>
                  <th className={styles.num}>Status</th>
                  <th className={styles.num}>ms</th>
                </tr>
              </thead>
              <tbody>
                {requestLog.map(entry => (
                  <tr key={entry.id}>
                    <td>{entry.method}</td>
                    <td className={styles.logPath}>
                      <code>{entry.path.replace(companyId, '{company}')}</code>
                    </td>
                    <td className={styles.num}>{entry.status ?? '—'}</td>
                    <td className={styles.num}>{entry.ms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Modal>
        )}
      </div>
    </GapContext.Provider>
  )
}

function Stat({
  label,
  value,
  hint,
  gap,
}: {
  label: string
  value: string
  hint?: string
  gap?: string
}) {
  return (
    <div className={styles.stat}>
      <div className={styles.statLabel}>
        {label} {gap && <GapPin id={gap} />}
      </div>
      <div className={styles.statValue}>{value}</div>
      {hint && <div className={styles.muted}>{hint}</div>}
    </div>
  )
}
