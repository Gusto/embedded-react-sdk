import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import type { EntityIds } from '../useEntities'
import { useResolvedTheme } from '../useThemeModeContext'
import { darkTheme } from '../darkTheme'
import { getAllPages, getJson, withQuery } from './api'
import { GAPS, GAP_KIND_LABEL, GAP_NUMBER, type Tab } from './gaps'
import {
  REVIEW_STATE_LABEL,
  addDays,
  crossesMidnight,
  estimateOvertime,
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
  sentSummary,
  type SentSummary,
  primaryJob,
  resolvePaySchedule,
  reviewState,
  scheduleLabel,
  syncEffect,
  workedHours,
  type ApiAssignments,
  type ApiBreakPolicy,
  type ApiEmployee,
  type ApiOvertimePolicy,
  type ApiPayPeriod,
  type ApiPaySchedule,
  type ApiShift,
  type Person,
  type ReviewState,
  type ShiftStatus,
  breakIssueDetail,
  breakIssueKind,
  breakIssues,
} from './model'
import { PayrollTab } from './PayrollTab'
import { PoliciesTab } from './PoliciesTab'
import { ReceiptPage, SendPage, type SendFailure, type SendOutcome } from './SendPage'
import { ShiftPage, type ShiftPageMode } from './ShiftPage'
import { CHANGES, CHANGE_NUMBER, ROUND_LABEL, type ChangeRound } from './changes'
import { ChangeContext, GapContext } from './gapContext'
import { ApproveReject, ChangePin, GapPin, PrototypeModal, RequestBlock, Trail } from './parts'
import { nowIso, type NoticeStatus, type Preview } from './preview'
import type { PolicyData } from './PoliciesTab'
import styles from './TimeTrackingReview.module.scss'
import { DataView, Flex, HamburgerMenu, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { GustoProvider } from '@/contexts/GustoProvider/GustoProvider'

interface BaseData {
  schedules: ApiPaySchedule[]
  periods: ApiPayPeriod[]
  assignments: ApiAssignments
  employees: ApiEmployee[]
  breakPolicies: ApiBreakPolicy[]
  overtimePolicies: ApiOvertimePolicy[]
  latestShiftAt: string | null
}

type Load<T> = { kind: 'loading' } | { kind: 'error'; message: string } | { kind: 'done'; data: T }

const TABS: Array<{ value: Tab; label: string }> = [
  { value: 'review', label: 'Timesheets' },
  { value: 'policies', label: 'Policies' },
  { value: 'payroll', label: 'Run payroll (another flow)' },
]

const BADGE_STATUS: Record<ReviewState, 'success' | 'warning' | 'error' | 'info'> = {
  open: 'warning',
  pending: 'warning',
  rejected: 'error',
  unsent: 'info',
  sent: 'success',
  changed: 'warning',
}

const SHORT_STATE_LABEL: Record<ReviewState, string> = {
  open: 'clocked in',
  pending: 'pending',
  rejected: 'rejected',
  unsent: 'not sent',
  sent: 'sent',
  changed: 'changed',
}

const BATCH_LIMIT = 500

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function TimeTrackingReview() {
  const resolvedTheme = useResolvedTheme()
  return (
    <GustoProvider
      config={{ baseUrl: `${window.location.origin}/api/` }}
      theme={resolvedTheme === 'dark' ? darkTheme : undefined}
    >
      <TimeTrackingPrototype />
    </GustoProvider>
  )
}

function TimeTrackingPrototype() {
  const Components = useComponentContext()
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const companyId = entities.companyId
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: Tab = TABS.some(t => t.value === searchParams.get('tab'))
    ? (searchParams.get('tab') as Tab)
    : 'review'
  const setTab = (next: string) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev)
      params.set('tab', next)
      return params
    })
  }

  const [base, setBase] = useState<Load<BaseData>>({ kind: 'loading' })
  const [scheduleUuid, setScheduleUuid] = useState('')
  const [selectedPeriodKey, setSelectedPeriodKey] = useState('')
  const [shifts, setShifts] = useState<Load<ApiShift[]>>({ kind: 'loading' })
  const [reloadToken, setReloadToken] = useState(0)
  const focusPerson = searchParams.get('person')
  const setFocusPerson = (uuid: string | null) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev)
      if (uuid) params.set('person', uuid)
      else params.delete('person')
      return params
    })
  }
  const shiftsHref = (uuid: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', 'review')
    params.set('person', uuid)
    return `?${params.toString()}`
  }
  const loadedPeriodKey = useRef<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // The SDK Link only takes an href, and react-aria's RouterProvider can't be used outside the UI
  // folder, so same-page links are routed here instead of reloading the page.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = (event.target as Element | null)?.closest('a[href^="?"]')
      if (!anchor || !rootRef.current?.contains(anchor)) return
      event.preventDefault()
      void navigate(anchor.getAttribute('href') ?? '')
    }
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
    }
  }, [navigate])
  const [selectedShifts, setSelectedShifts] = useState<Set<string>>(new Set())
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set())

  const [overlay, setOverlay] = useState<'gaps' | 'changes' | null>('gaps')
  const gapsOn = overlay === 'gaps'
  const changesOn = overlay === 'changes'
  const toggleOverlay = (next: 'gaps' | 'changes') => {
    setOverlay(current => (current === next ? null : next))
  }
  const [activeGap, setActiveGap] = useState<string | null>(null)
  const [activeChange, setActiveChange] = useState<string | null>(null)

  const [preview, setPreview] = useState<Preview | null>(null)
  const [sim, setSim] = useState<{ shifts: Record<string, ApiShift | null>; added: ApiShift[] }>({
    shifts: {},
    added: [],
  })
  const [changes, setChanges] = useState(0)
  const [notice, setNotice] = useState<{
    message: string
    preview: Preview
    status: NoticeStatus
  } | null>(null)
  const [shiftPage, setShiftPage] = useState<ShiftPageMode | null>(null)
  const [sendView, setSendView] = useState<'review' | 'receipt' | null>(null)
  const [sending, setSending] = useState<{ key: string; startedAt: string } | null>(null)
  const [sendFailures, setSendFailures] = useState<Record<string, SendFailure>>({})
  const [sendSnapshots, setSendSnapshots] = useState<Record<string, SentSummary>>({})
  const sendTimer = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (sendTimer.current) window.clearTimeout(sendTimer.current)
    },
    [],
  )
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

  useEffect(() => {
    if (!data || scheduleUuid) return
    const counts = data.schedules
      .map(s => ({ uuid: s.uuid, count: people.filter(p => p.scheduleUuid === s.uuid).length }))
      .sort((a, b) => b.count - a.count)
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
      schedulePeriods[schedulePeriods.length - 1]!
    setSelectedPeriodKey(periodKey(match))
  }, [schedulePeriods, selectedPeriodKey, latestShiftDate])

  const period = schedulePeriods.find(p => periodKey(p) === selectedPeriodKey) ?? null
  const schedule = data?.schedules.find(s => s.uuid === scheduleUuid) ?? null
  const schedulePeople = useMemo(
    () => people.filter(p => p.scheduleUuid === scheduleUuid),
    [people, scheduleUuid],
  )

  useEffect(() => {
    if (!companyId || !period) return
    if (loadedPeriodKey.current && loadedPeriodKey.current !== periodKey(period)) {
      setSearchParams(prev => {
        const params = new URLSearchParams(prev)
        params.delete('person')
        return params
      })
    }
    loadedPeriodKey.current = periodKey(period)
    if (!schedulePeople.length) {
      setShifts({ kind: 'done', data: [] })
      return
    }
    const controller = new AbortController()
    setShifts({ kind: 'loading' })
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
        setShifts({
          kind: 'done',
          data: all.filter(shift => {
            const date = localStartDate(shift)
            return date >= period.start_date && date <= period.end_date
          }),
        })
      } catch (error) {
        if (!controller.signal.aborted) setShifts({ kind: 'error', message: errorMessage(error) })
      }
    })()
    return () => {
      controller.abort()
    }
  }, [companyId, period, schedulePeople, setSearchParams])

  useEffect(() => {
    setSelectedShifts(new Set())
  }, [focusPerson, selectedPeriodKey])

  useEffect(() => {
    setSelectedPeople(new Set())
  }, [selectedPeriodKey, scheduleUuid])

  useEffect(() => {
    if (sendWhenLoaded && shifts.kind === 'done') {
      setSendWhenLoaded(false)
      setSendView('review')
    }
  }, [sendWhenLoaded, shifts])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, select, [role="dialog"]')) return
      if (event.key === 'g' || event.key === 'G')
        setOverlay(current => (current === 'gaps' ? null : 'gaps'))
      if (event.key === 'c' || event.key === 'C')
        setOverlay(current => (current === 'changes' ? null : 'changes'))
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const selectGap = useCallback((id: string) => {
    setOverlay('gaps')
    setActiveGap(id)
    document.getElementById(`gap-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [])
  const selectChange = useCallback((id: string) => {
    setOverlay('changes')
    setActiveChange(id)
    document
      .getElementById(`change-${id}`)
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [])

  const applySim = useCallback(
    (loaded: ApiShift[]) => [
      ...loaded
        .map(shift => (shift.uuid in sim.shifts ? sim.shifts[shift.uuid] : shift))
        .filter((shift): shift is ApiShift => shift !== null),
      ...sim.added,
    ],
    [sim],
  )

  const periodShifts = useMemo(() => {
    if (shifts.kind !== 'done' || !period) return []
    const onSchedule = new Set(schedulePeople.map(p => p.employee.uuid))
    const loaded = shifts.data
      .map(shift => (shift.uuid in sim.shifts ? sim.shifts[shift.uuid] : shift))
      .filter((shift): shift is ApiShift => shift !== null)
    const added = sim.added.filter(shift => {
      const date = localStartDate(shift)
      return (
        onSchedule.has(shift.entity_uuid) && date >= period.start_date && date <= period.end_date
      )
    })
    return [...loaded, ...added].sort((a, b) =>
      a.shift_started_at.localeCompare(b.shift_started_at),
    )
  }, [shifts, sim, period, schedulePeople])

  const notify = (message: string, nextPreview: Preview, status: NoticeStatus = 'success') => {
    setNotice({ message, preview: nextPreview, status })
    if (status === 'success') setChanges(c => c + 1)
  }

  const putShifts = (next: ApiShift[]) => {
    setSim(prev => {
      const added = [...prev.added]
      const replaced = { ...prev.shifts }
      for (const shift of next) {
        const index = added.findIndex(a => a.uuid === shift.uuid)
        if (index >= 0) added[index] = shift
        else replaced[shift.uuid] = shift
      }
      return { shifts: replaced, added }
    })
  }

  const removeShift = (uuid: string) => {
    setSim(prev =>
      prev.added.some(a => a.uuid === uuid)
        ? { ...prev, added: prev.added.filter(a => a.uuid !== uuid) }
        : { ...prev, shifts: { ...prev.shifts, [uuid]: null } },
    )
  }

  const updateData = (update: (current: BaseData) => BaseData) => {
    setBase(prev => (prev.kind === 'done' ? { kind: 'done', data: update(prev.data) } : prev))
  }

  const resetSimulation = () => {
    setSim({ shifts: {}, added: [] })
    setSendSnapshots({})
    setChanges(0)
    setNotice(null)
    setReloadToken(t => t + 1)
  }
  const syncedShifts = periodShifts.filter(s => s.synced_to_payroll_at)
  const lastSyncAt = syncedShifts.reduce<string | null>(
    (latest, s) => (!latest || s.synced_to_payroll_at! > latest ? s.synced_to_payroll_at! : latest),
    null,
  )
  const changedCount = periodShifts.filter(s => reviewState(s) === 'changed').length
  const sendKey = period ? `${scheduleUuid}:${periodKey(period)}` : ''
  const sendingHere = sending?.key === sendKey ? sending : null
  const sent =
    sendSnapshots[sendKey] ??
    sentSummary(periodShifts, schedulePeople, schedule?.workweek_start_day ?? null)

  const setSendFailure = (key: string, failure: SendFailure | null) => {
    setSendFailures(prev =>
      failure
        ? { ...prev, [key]: failure }
        : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key)),
    )
  }

  const startSend = (included: ApiShift[], request: Preview, outcome: SendOutcome) => {
    const key = sendKey
    setSendView('receipt')
    if (period?.payroll?.processed) {
      setSendFailure(key, { kind: 'processed' })
      return
    }
    setSendFailure(key, null)
    setSending({ key, startedAt: nowIso() })
    sendTimer.current = window.setTimeout(() => {
      setSending(null)
      if (outcome === 'error') {
        setSendFailure(key, { kind: 'error' })
        notify('The send to payroll failed. Nothing changed on payroll.', request, 'error')
        return
      }
      const firstPerson = included[0]?.entity_uuid
      const failedShifts =
        outcome === 'partial' ? included.filter(s => s.entity_uuid === firstPerson) : []
      const now = nowIso()
      const sentShifts = included
        .filter(shift => !failedShifts.includes(shift))
        .map(shift => ({ ...shift, synced_to_payroll_at: now }))
      setSendSnapshots(prev => ({
        ...prev,
        [key]: sentSummary(sentShifts, schedulePeople, schedule?.workweek_start_day ?? null),
      }))
      putShifts(sentShifts)
      if (failedShifts.length > 0) {
        const name = people.find(p => p.employee.uuid === firstPerson)?.name ?? 'One person'
        setSendFailure(key, { kind: 'partial', names: [name], shifts: failedShifts.length })
        notify(
          `Sent ${sentShifts.length} shifts. ${failedShifts.length} for ${name} didn’t reach payroll.`,
          request,
          'error',
        )
        return
      }
      notify(`Hours for ${included.length} shifts sent to payroll.`, request)
    }, 2500)
  }

  const overlappingProcessed = period
    ? (data?.periods ?? []).filter(
        p => p.pay_schedule_uuid !== scheduleUuid && p.payroll?.processed && overlaps(p, period),
      )
    : []

  const latestShiftPeriod =
    latestShiftDate &&
    schedulePeriods.find(p => p.start_date <= latestShiftDate && latestShiftDate <= p.end_date)

  const statusRequest = (targets: ApiShift[], status: ShiftStatus, title: string): Preview => {
    if (targets.length === 1) {
      const shift = targets[0]!
      return {
        title,
        requests: [
          {
            method: 'PATCH',
            path: `/v1/time_tracking/time_sheets/${shift.uuid}`,
            body: { version: shift.version, status },
          },
        ],
        gapIds: shift.synced_to_payroll_at ? ['which-timesheets', 'status-lock'] : ['status-lock'],
      }
    }
    const chunks = Math.ceil(targets.length / BATCH_LIMIT)
    const firstChunk = targets.slice(0, BATCH_LIMIT)
    const shown = firstChunk.slice(0, 3).map(shift => ({
      external_id: shift.uuid,
      uuid: shift.uuid,
      version: shift.version,
      status,
    }))
    return {
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
          caption: `${targets.length} shifts in ${chunks} batch${chunks === 1 ? '' : 'es'}. Then poll the batch and reconcile each item's errors.`,
        },
      ],
      gapIds: ['bulk-approval', 'status-lock'],
    }
  }

  const changeStatus = (targets: ApiShift[], status: ShiftStatus, title: string) => {
    if (!targets.length) return
    const request = statusRequest(targets, status, title)
    if (period?.payroll?.processed) {
      notify('Couldn’t change status: this period’s payroll is processed.', request, 'error')
      return
    }
    const now = nowIso()
    putShifts(targets.map(shift => ({ ...shift, status, updated_at: now })))
    const count = targets.length === 1 ? 'Shift' : `${targets.length} shifts`
    const wasSent = targets.some(t => t.synced_to_payroll_at)
    notify(
      status === 'approved'
        ? `${count} approved. ${targets.length === 1 ? 'It goes' : 'They go'} to payroll the next time you send this period.`
        : status === 'rejected'
          ? `${count} rejected. ${targets.length === 1 ? 'It won’t' : 'They won’t'} be sent to payroll.${wasSent ? ' Hours already sent stay on payroll until you update it.' : ''}`
          : `${count} set back to pending.${wasSent ? ' Hours already sent stay on payroll until you update it.' : ''}`,
      request,
    )
  }

  const byPerson = useMemo(() => {
    const map = new Map<string, ApiShift[]>()
    for (const shift of periodShifts) {
      const list = map.get(shift.entity_uuid) ?? []
      list.push(shift)
      map.set(shift.entity_uuid, list)
    }
    return map
  }, [periodShifts])

  const personRows = schedulePeople
    .filter(person => byPerson.has(person.employee.uuid))
    .map(person => ({ person, shifts: byPerson.get(person.employee.uuid)! }))
    .sort((a, b) => a.person.name.localeCompare(b.person.name))

  const focused = focusPerson ? personRows.find(r => r.person.employee.uuid === focusPerson) : null

  const review = data && (
    <Flex flexDirection="column" gap={16}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarFilters}>
          <div className={styles.toolbarSchedule}>
            <Components.Select
              label="Pay schedule"
              placeholder="Choose a pay schedule"
              value={scheduleUuid}
              options={data.schedules.map(s => ({ value: s.uuid, label: scheduleLabel(s) }))}
              onChange={value => {
                setScheduleUuid(value)
                setSelectedPeriodKey('')
              }}
            />
          </div>
          <div className={styles.toolbarPeriod}>
            <Components.Select
              label="Pay period"
              placeholder="Choose a pay period"
              value={selectedPeriodKey}
              options={schedulePeriods.map(p => ({
                value: periodKey(p),
                label: `${formatPeriod(p)}${p.payroll?.processed ? ' · processed' : ''}`,
              }))}
              onChange={setSelectedPeriodKey}
            />
          </div>
        </div>
        <div className={styles.toolbarActions}>
          <ChangePin id="send-page" />
          <GapPin id="auto-sync" />
          <GapPin id="sync-limits" />
          <GapPin id="by-period" />
          <Components.Button
            variant="secondary"
            icon={<PlusIcon />}
            isDisabled={!period}
            onClick={() => {
              setShiftPage({ kind: 'add', personUuid: focusPerson })
            }}
          >
            Add shift
          </Components.Button>
          <Components.Button
            isDisabled={!period || shifts.kind !== 'done'}
            onClick={() => {
              setSendView('review')
            }}
          >
            {lastSyncAt ? 'Update payroll' : 'Send to payroll'}
          </Components.Button>
        </div>
      </div>
      {period?.payroll && (
        <Components.Text size="sm" variant="supporting">
          Payroll check date {formatShortDate(period.payroll.check_date)}, deadline{' '}
          {formatDateTime(period.payroll.payroll_deadline)}.
          {!lastSyncAt && !sendingHere && ' Nothing sent to payroll yet.'}
        </Components.Text>
      )}
      {!sendingHere && sendFailures[sendKey] && (
        <Components.Alert
          status="error"
          label={
            sendFailures[sendKey].kind === 'partial'
              ? 'Some hours didn’t reach payroll'
              : 'The last send didn’t go through'
          }
          action={
            <Components.Button
              variant="secondary"
              onClick={() => {
                setSendView('receipt')
              }}
            >
              View details
            </Components.Button>
          }
        >
          <ChangePin id="send-outcomes" />
        </Components.Alert>
      )}
      {sendingHere ? (
        <Components.Alert status="info" label="Sending hours to payroll…">
          Started {formatDateTime(sendingHere.startedAt)}. You can keep working.{' '}
          <GapPin id="sync-limits" /> <ChangePin id="receipt" />
        </Components.Alert>
      ) : (
        lastSyncAt &&
        period && (
          <Components.Alert
            status="success"
            label={`Last sent ${formatDateTime(lastSyncAt)} to the ${period.payroll ? `${formatShortDate(period.payroll.check_date)} payroll` : 'payroll'}`}
            action={
              <Components.Button
                variant="secondary"
                onClick={() => {
                  setSendView('receipt')
                }}
              >
                View what was sent
              </Components.Button>
            }
          >
            {sent.sent.length} shifts · {sent.rows.length} people · {formatHours(sent.hours)} hours
            · {formatHours(sent.overtime)} estimated overtime <GapPin id="rules-applied" />
            {changedCount > 0 && ` · ${changedCount} changed since`}{' '}
            <GapPin id="which-timesheets" /> <ChangePin id="receipt" />
          </Components.Alert>
        )
      )}

      {period?.payroll?.processed && (
        <Components.Alert status="warning" label="This period’s payroll is processed">
          Sending again won’t change it, and status changes are blocked.
        </Components.Alert>
      )}
      {overlappingProcessed.length > 0 && (
        <Components.Alert status="warning" label="An overlapping payroll is processed">
          {overlappingProcessed.map(formatPeriod).join(', ')} on another schedule is processed. The
          API may block status changes here too. <GapPin id="status-lock" />
        </Components.Alert>
      )}

      {shifts.kind === 'loading' && <Components.LoadingSpinner />}
      {shifts.kind === 'error' && (
        <Components.Alert status="error" label="Couldn’t load shifts">
          {shifts.message}
        </Components.Alert>
      )}

      {shifts.kind === 'done' && periodShifts.length === 0 && (
        <Components.Alert
          status="info"
          label="No shifts in this period"
          action={
            latestShiftPeriod && periodKey(latestShiftPeriod) !== selectedPeriodKey ? (
              <Components.Button
                variant="secondary"
                onClick={() => {
                  setSelectedPeriodKey(periodKey(latestShiftPeriod))
                }}
              >
                Go to {formatPeriod(latestShiftPeriod)}
              </Components.Button>
            ) : undefined
          }
        >
          {data.latestShiftAt
            ? `The latest shift in this company starts ${formatDateTime(data.latestShiftAt)}.`
            : 'This company has no shifts.'}
        </Components.Alert>
      )}

      {shifts.kind === 'done' && periodShifts.length > 0 && !focused && (
        <PeopleTable
          rows={personRows}
          workweekStartDay={schedule?.workweek_start_day ?? null}
          shiftsHref={shiftsHref}
          selected={selectedPeople}
          onSelectedChange={setSelectedPeople}
          onBulk={changeStatus}
          onAddShift={uuid => {
            setShiftPage({ kind: 'add', personUuid: uuid })
          }}
        />
      )}

      {focused && (
        <ShiftsTable
          person={focused.person}
          shifts={focused.shifts}
          selected={selectedShifts}
          onSelectedChange={setSelectedShifts}
          onBack={() => {
            setFocusPerson(null)
          }}
          onStatus={changeStatus}
          onEdit={shift => {
            setShiftPage({ kind: 'edit', shift, clockOut: false })
          }}
          onClockOut={shift => {
            setShiftPage({ kind: 'edit', shift, clockOut: true })
          }}
        />
      )}
    </Flex>
  )

  return (
    <GapContext.Provider value={{ on: gapsOn, active: activeGap, setActive: selectGap }}>
      <ChangeContext.Provider
        value={{ on: changesOn, active: activeChange, setActive: selectChange }}
      >
        <div ref={rootRef} className={`${styles.root} ${overlay ? styles.withGaps : ''}`}>
          <div className={styles.main}>
            <Flex justifyContent="space-between" alignItems="flex-start" gap={16} flexWrap="wrap">
              <Flex flexDirection="column" gap={4}>
                <Components.Heading as="h1">Time tracking</Components.Heading>
                <Components.Text size="sm" variant="supporting">
                  Prototype on real API data. It only reads; every action shows the request it would
                  send.
                </Components.Text>
              </Flex>
              <div className={styles.overlayToggle}>
                <Components.Button
                  variant={gapsOn ? 'secondary' : 'tertiary'}
                  onClick={() => {
                    toggleOverlay('gaps')
                  }}
                >
                  {gapsOn ? 'Hide gaps' : 'Show gaps'} (G)
                </Components.Button>
                <Components.Button
                  variant={changesOn ? 'secondary' : 'tertiary'}
                  onClick={() => {
                    toggleOverlay('changes')
                  }}
                >
                  {changesOn ? 'Hide changes' : 'Show changes'} (C)
                </Components.Button>
              </div>
            </Flex>

            {base.kind === 'loading' && <Components.LoadingSpinner />}
            {base.kind === 'error' && (
              <Components.Alert
                status="error"
                label="Couldn’t load the company"
                action={
                  <Components.Button
                    variant="secondary"
                    onClick={() => {
                      setReloadToken(t => t + 1)
                    }}
                  >
                    Try again
                  </Components.Button>
                }
              >
                {base.message}
              </Components.Alert>
            )}

            {changes > 0 && (
              <Flex alignItems="center" gap={8}>
                <span className={styles.simTag}>
                  Simulated · {changes} {changes === 1 ? 'change' : 'changes'}, nothing sent
                </span>
                <Components.Button variant="tertiary" onClick={resetSimulation}>
                  Reset to real data
                </Components.Button>
              </Flex>
            )}

            {notice && (
              <Components.Alert
                status={notice.status}
                label={notice.message}
                onDismiss={() => {
                  setNotice(null)
                }}
                action={
                  <Components.Button
                    variant="secondary"
                    onClick={() => {
                      setPreview(notice.preview)
                    }}
                  >
                    View request
                  </Components.Button>
                }
              />
            )}

            {data && (
              <Components.Tabs
                aria-label="Time tracking"
                selectedId={tab}
                onSelectionChange={setTab}
                tabs={[
                  {
                    id: 'review',
                    label: 'Timesheets',
                    content:
                      shiftPage && period ? (
                        <ShiftPage
                          key={shiftPage.kind === 'edit' ? shiftPage.shift.uuid : 'new'}
                          mode={shiftPage}
                          companyId={companyId}
                          people={schedulePeople}
                          period={period}
                          shifts={periodShifts}
                          trail={[
                            {
                              label: 'Timesheets',
                              onClick: () => {
                                setShiftPage(null)
                                setFocusPerson(null)
                              },
                            },
                            ...(focused
                              ? [
                                  {
                                    label: focused.person.name,
                                    onClick: () => {
                                      setShiftPage(null)
                                    },
                                  },
                                ]
                              : []),
                          ]}
                          onBack={() => {
                            setShiftPage(null)
                          }}
                          onSave={(saved, request) => {
                            setShiftPage(null)
                            if (shiftPage.kind === 'add') {
                              setSim(prev => ({ ...prev, added: [...prev.added, saved] }))
                              notify(
                                saved.status === 'approved'
                                  ? 'Shift added as approved. It goes to payroll the next time you send this period.'
                                  : 'Shift added as pending.',
                                request,
                              )
                              return
                            }
                            putShifts([saved])
                            notify(
                              saved.synced_to_payroll_at
                                ? 'Saved. Still approved, but not on payroll until you update this period.'
                                : 'Shift saved.',
                              request,
                            )
                          }}
                          onDelete={(deleted, request) => {
                            setShiftPage(null)
                            removeShift(deleted.uuid)
                            notify(
                              deleted.synced_to_payroll_at
                                ? 'Shift deleted. Its hours stay on payroll until you update this period.'
                                : 'Shift deleted.',
                              request,
                            )
                          }}
                        />
                      ) : sendView === 'receipt' && period && schedule ? (
                        <ReceiptPage
                          schedule={schedule}
                          period={period}
                          people={schedulePeople}
                          shifts={periodShifts}
                          workweekStartDay={schedule.workweek_start_day}
                          snapshot={sendSnapshots[sendKey] ?? null}
                          sendingSince={sendingHere?.startedAt ?? null}
                          failure={sendFailures[sendKey] ?? null}
                          onBack={() => {
                            setSendView(null)
                          }}
                          onUpdate={() => {
                            setSendFailure(sendKey, null)
                            setSendView('review')
                          }}
                          onRunPayroll={() => {
                            setSendView(null)
                            setTab('payroll')
                          }}
                        />
                      ) : sendView === 'review' && period && schedule ? (
                        <SendPage
                          companyId={companyId}
                          schedule={schedule}
                          period={period}
                          people={schedulePeople}
                          shifts={periodShifts}
                          isUpdate={Boolean(lastSyncAt)}
                          onClose={() => {
                            setSendView(null)
                          }}
                          onReview={personUuid => {
                            setSendView(null)
                            setFocusPerson(personUuid)
                          }}
                          onSend={startSend}
                        />
                      ) : (
                        review
                      ),
                  },
                  {
                    id: 'policies',
                    label: 'Policies',
                    content: (
                      <PoliciesTab
                        companyId={companyId}
                        people={people}
                        schedules={data.schedules}
                        overtimePolicies={data.overtimePolicies}
                        breakPolicies={data.breakPolicies}
                        onPoliciesChange={(next: PolicyData) => {
                          updateData(current => ({ ...current, ...next }))
                        }}
                        onNotify={notify}
                      />
                    ),
                  },
                  {
                    id: 'payroll',
                    label: 'Run payroll (another flow)',
                    content: (
                      <PayrollTab
                        companyId={companyId}
                        people={people}
                        schedules={data.schedules}
                        periods={data.periods}
                        applySim={applySim}
                        onNotify={notify}
                        onProcess={processed => {
                          updateData(current => ({
                            ...current,
                            periods: current.periods.map(p =>
                              p === processed && p.payroll
                                ? { ...p, payroll: { ...p.payroll, processed: true } }
                                : p,
                            ),
                          }))
                        }}
                        onReview={(nextSchedule, key) => {
                          setScheduleUuid(nextSchedule)
                          setSelectedPeriodKey(key)
                          setTab('review')
                          setSendWhenLoaded(true)
                        }}
                      />
                    ),
                  },
                ]}
              />
            )}
          </div>

          {gapsOn && (
            <aside className={styles.gapsPanel} aria-label="API gaps">
              <div className={styles.gapsHeader}>
                <h2>API gaps on this tab</h2>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => {
                    setOverlay(null)
                  }}
                  aria-label="Hide gaps"
                >
                  ×
                </button>
              </div>
              <p className={styles.muted}>
                One badge for each row of “Appendix: Time Tracking SDK PRD and REST API Comparison”
                that isn’t fully supported, in its order and wording.
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
                      {gap.priority} · {GAP_KIND_LABEL[gap.kind]}
                    </span>
                    <p>
                      <strong>Details:</strong> {gap.details}
                    </p>
                    {gap.needed && (
                      <p className={styles.needed}>
                        <strong>Needed to meet the PRD:</strong> {gap.needed}
                      </p>
                    )}
                    <p>
                      <strong>Here:</strong> {gap.here}
                    </p>
                  </li>
                ))}
              </ol>
            </aside>
          )}

          {changesOn && (
            <aside className={`${styles.gapsPanel} ${styles.changesPanel}`} aria-label="Changes">
              <div className={styles.gapsHeader}>
                <h2>Changes from review on this tab</h2>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => {
                    setOverlay(null)
                  }}
                  aria-label="Hide changes"
                >
                  ×
                </button>
              </div>
              <p className={styles.muted}>
                Each pink badge marks something that changed after a review, newest first. Badges
                inside pages show when you open them.
              </p>
              {(['nov-20', 'nov-19'] satisfies ChangeRound[]).map(round => {
                const changes = CHANGES.filter(
                  change => change.round === round && change.tabs.includes(tab),
                )
                if (changes.length === 0) return null
                return (
                  <section key={round}>
                    <h3 className={styles.roundHeading}>{ROUND_LABEL[round]}</h3>
                    <ol className={styles.gapList}>
                      {changes.map(change => (
                        <li
                          key={change.id}
                          id={`change-${change.id}`}
                          className={`${styles.gap} ${activeChange === change.id ? styles.changeActive : ''}`}
                        >
                          <div className={styles.gapTitle}>
                            <span className={`${styles.gapNumber} ${styles.changeNumber}`}>
                              {CHANGE_NUMBER[change.id]}
                            </span>
                            <span>{change.title}</span>
                          </div>
                          <span className={styles.changeSource}>
                            {change.feedback
                              ? round === 'nov-20'
                                ? 'Call feedback'
                                : 'Review feedback'
                              : 'Added after review'}
                          </span>
                          {change.feedback && <p className={styles.quote}>“{change.feedback}”</p>}
                          <p>
                            <strong>What changed:</strong> {change.what}
                          </p>
                          <p>
                            <strong>Where:</strong> {change.where}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </section>
                )
              })}
            </aside>
          )}

          {preview && (
            <PrototypeModal
              title={`What “${preview.title}” would send`}
              onClose={() => {
                setPreview(null)
              }}
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
              {preview.notes?.map(note => (
                <Components.Text key={note} size="sm">
                  {note}
                </Components.Text>
              ))}
              <Components.Text size="sm" variant="supporting">
                Not sent. The page applied this change locally.
                {preview.gapIds.length > 0 && ' Related gaps: '}
                {preview.gapIds.map(id => (
                  <GapPin key={id} id={id} />
                ))}
                {!gapsOn && preview.gapIds.map(id => `#${GAP_NUMBER[id]}`).join(', ')}
              </Components.Text>
            </PrototypeModal>
          )}
        </div>
      </ChangeContext.Provider>
    </GapContext.Provider>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M8 5L13 10L8 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
      <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function StatusBadges({ shifts }: { shifts: ApiShift[] }) {
  const Components = useComponentContext()
  const counts = new Map<ReviewState, number>()
  for (const shift of shifts)
    counts.set(reviewState(shift), (counts.get(reviewState(shift)) ?? 0) + 1)
  return (
    <div className={styles.statusBadges}>
      {[...counts.entries()].map(([state, count]) => (
        <Components.Badge key={state} status={BADGE_STATUS[state]}>
          {count} {SHORT_STATE_LABEL[state]}
        </Components.Badge>
      ))}
    </div>
  )
}

interface PersonRow {
  person: Person
  shifts: ApiShift[]
}

function PeopleTable({
  rows,
  workweekStartDay,
  shiftsHref,
  selected,
  onSelectedChange,
  onBulk,
  onAddShift,
}: {
  rows: PersonRow[]
  workweekStartDay: string | null
  shiftsHref: (personUuid: string) => string
  selected: Set<string>
  onSelectedChange: (next: Set<string>) => void
  onBulk: (targets: ApiShift[], status: ShiftStatus, title: string) => void
  onAddShift: (personUuid: string) => void
}) {
  const Components = useComponentContext()
  const navigate = useNavigate()
  const dataView = useDataView<PersonRow>({
    data: rows,
    selectionMode: 'multiple',
    getIsItemSelected: row => selected.has(row.person.employee.uuid),
    onSelect: (row, checked) => {
      const next = new Set(selected)
      if (checked) next.add(row.person.employee.uuid)
      else next.delete(row.person.employee.uuid)
      onSelectedChange(next)
    },
    onSelectAll: (checked, visible) => {
      onSelectedChange(checked ? new Set(visible.map(row => row.person.employee.uuid)) : new Set())
    },
    columns: [
      {
        title: 'Person',
        render: ({ person }) => (
          <Flex flexDirection="column" gap={0}>
            <Components.Text weight="medium">{person.name}</Components.Text>
            <Components.Text size="sm" variant="supporting">
              {person.title}
            </Components.Text>
          </Flex>
        ),
      },
      {
        title: (
          <>
            Shifts <ChangePin id="view-shifts" />
          </>
        ),
        render: ({ person, shifts }) => (
          <Components.Button
            variant="tertiary"
            aria-label={`View ${person.name}’s ${shifts.length} shifts`}
            onClick={() => {
              void navigate(shiftsHref(person.employee.uuid))
            }}
          >
            <span className={styles.drillIn}>
              {shifts.length} shifts
              <ChevronRightIcon />
            </span>
          </Components.Button>
        ),
      },
      {
        title: (
          <>
            Worked <GapPin id="period-totals" />
          </>
        ),
        justify: 'end',
        render: ({ shifts }) => formatHours(shifts.reduce((sum, s) => sum + workedHours(s), 0)),
      },
      {
        title: (
          <>
            Overtime (est.) <GapPin id="rules-applied" />
          </>
        ),
        justify: 'end',
        render: ({ person, shifts }) => {
          const estimate = estimateOvertime(shifts, person.overtimePolicy, workweekStartDay)
          if (!estimate) return '—'
          return (
            <span className={styles.estimate}>
              {formatHours(estimate.overtime)}
              {estimate.double > 0 && ` + ${formatHours(estimate.double)} DT`}
            </span>
          )
        },
      },
      { title: 'Status', render: ({ shifts }) => <StatusBadges shifts={shifts} /> },
      {
        title: (
          <>
            <span className={styles.srOnly}>Approve or reject</span>
            <ChangePin id="row-icons" /> <ChangePin id="row-actions-text" />
          </>
        ),
        render: ({ person, shifts }) => {
          const toApprove = shifts.filter(s => s.status !== 'approved' && s.shift_ended_at)
          const toReject = shifts.filter(s => s.status !== 'rejected')
          return (
            <ApproveReject
              label={`all of ${person.name}’s shifts`}
              approveCount={toApprove.length}
              rejectCount={toReject.length}
              onApprove={
                toApprove.length
                  ? () => {
                      onBulk(
                        toApprove,
                        'approved',
                        `Approve ${person.name}’s ${toApprove.length} shifts`,
                      )
                    }
                  : undefined
              }
              onReject={
                toReject.length
                  ? () => {
                      onBulk(
                        toReject,
                        'rejected',
                        `Reject ${person.name}’s ${toReject.length} shifts`,
                      )
                    }
                  : undefined
              }
            />
          )
        },
      },
    ],
    itemMenu: ({ person }) => (
      <HamburgerMenu
        triggerLabel={`More actions for ${person.name}`}
        items={[
          {
            label: 'View shifts',
            onClick: () => {
              void navigate(shiftsHref(person.employee.uuid))
            },
          },
          {
            label: 'Add shift',
            onClick: () => {
              onAddShift(person.employee.uuid)
            },
          },
        ]}
      />
    ),
  })
  const selectedRows = rows.filter(row => selected.has(row.person.employee.uuid))
  const selectedShifts = selectedRows.flatMap(row => row.shifts)
  const toApprove = selectedShifts.filter(s => s.status !== 'approved' && s.shift_ended_at)
  const toReject = selectedShifts.filter(s => s.status !== 'rejected')
  const who = `${selectedRows.length} ${selectedRows.length === 1 ? 'person' : 'people'}`

  return (
    <Flex flexDirection="column" gap={8}>
      {selectedRows.length > 0 && (
        <Flex alignItems="center" justifyContent="space-between" gap={12} flexWrap="wrap">
          <Components.Text size="sm" weight="medium">
            {who} selected · {selectedShifts.length} shifts <GapPin id="bulk-approval" />
          </Components.Text>
          <ApproveReject
            label={`the selected shifts for ${who}`}
            approveCount={toApprove.length}
            rejectCount={toReject.length}
            onApprove={
              toApprove.length
                ? () => {
                    onBulk(toApprove, 'approved', `Approve ${toApprove.length} shifts for ${who}`)
                  }
                : undefined
            }
            onReject={
              toReject.length
                ? () => {
                    onBulk(toReject, 'rejected', `Reject ${toReject.length} shifts for ${who}`)
                  }
                : undefined
            }
          />
        </Flex>
      )}
      <div className={styles.reviewTable}>
        <DataView label="People with shifts this period" {...dataView} />
      </div>
    </Flex>
  )
}

function ShiftsTable({
  person,
  shifts,
  selected,
  onSelectedChange,
  onBack,
  onStatus,
  onEdit,
  onClockOut,
}: {
  person: Person
  shifts: ApiShift[]
  selected: Set<string>
  onSelectedChange: (next: Set<string>) => void
  onBack: () => void
  onStatus: (targets: ApiShift[], status: ShiftStatus, title: string) => void
  onEdit: (shift: ApiShift) => void
  onClockOut: (shift: ApiShift) => void
}) {
  const Components = useComponentContext()
  const rules = new Map(person.breakPolicy?.rules.map(rule => [rule.uuid, rule]))
  const label = (shift: ApiShift) => `${person.name}, ${formatDay(localStartDate(shift))}`
  const selectedShifts = shifts.filter(s => selected.has(s.uuid))
  const selectedToApprove = selectedShifts.filter(s => s.status !== 'approved' && s.shift_ended_at)
  const selectedToReject = selectedShifts.filter(s => s.status !== 'rejected')
  const policy = person.breakPolicy
  const issuesByShift = new Map(shifts.map(s => [s.uuid, breakIssues(s, policy)]))
  const shiftsWithIssues = shifts.filter(s => issuesByShift.get(s.uuid)?.length)

  const dataView = useDataView<ApiShift>({
    data: shifts,
    selectionMode: 'multiple',
    getIsItemSelected: shift => selected.has(shift.uuid),
    onSelect: (shift, checked) => {
      const next = new Set(selected)
      if (checked) next.add(shift.uuid)
      else next.delete(shift.uuid)
      onSelectedChange(next)
    },
    onSelectAll: (checked, visible) => {
      onSelectedChange(checked ? new Set(visible.map(s => s.uuid)) : new Set())
    },
    columns: [
      { title: 'Date', render: shift => formatDay(localStartDate(shift)) },
      {
        title: (
          <>
            Time <ChangePin id="clock-out" />
          </>
        ),
        render: shift => (
          <span className={styles.nowrap}>
            {formatTime(shift.shift_started_at, shift.time_zone)} –{' '}
            {shift.shift_ended_at ? formatTime(shift.shift_ended_at, shift.time_zone) : 'now'}
            {crossesMidnight(shift) && ' (+1 day)'}
          </span>
        ),
      },
      {
        title: (
          <>
            Breaks <ChangePin id="missed-breaks" />
          </>
        ),
        render: shift => {
          const taken =
            shift.breaks
              .map(b => {
                const rule = b.break_rule_uuid ? rules.get(b.break_rule_uuid) : undefined
                const minutes = b.end_time
                  ? Math.round((Date.parse(b.end_time) - Date.parse(b.start_time)) / 60000)
                  : null
                const kind = rule ? (rule.break_type === 'meal' ? 'Meal' : 'Rest') : 'Break'
                return `${kind} ${minutes ?? '…'}m`
              })
              .join(', ') || 'None'
          const issues = issuesByShift.get(shift.uuid) ?? []
          if (issues.length === 0) return taken
          return (
            <div className={styles.breaksCell}>
              <span>{taken}</span>
              <span className={styles.breakIssue}>
                <Components.Badge status="warning">
                  {breakIssueKind(issues) === 'missing' ? 'Missed' : 'Short'}
                </Components.Badge>
                <span className={styles.breakIssueDetail}>
                  {breakIssueDetail(issues)}
                  {policy?.pay_premium ? ' · premium' : ''}
                </span>
              </span>
            </div>
          )
        },
      },
      { title: 'Worked', justify: 'end', render: shift => formatHours(workedHours(shift)) },
      {
        title: 'Status',
        render: shift => {
          const state = reviewState(shift)
          return (
            <Components.Badge status={BADGE_STATUS[state]}>
              {REVIEW_STATE_LABEL[state]}
              {state === 'sent' && shift.synced_to_payroll_at
                ? ` ${formatShortDate(shift.synced_to_payroll_at.slice(0, 10))}`
                : ''}
            </Components.Badge>
          )
        },
      },
      {
        title: (
          <>
            <span className={styles.srOnly}>Approve or reject</span>
            <ChangePin id="row-icons" /> <ChangePin id="row-actions-text" />
          </>
        ),
        render: shift => (
          <ApproveReject
            label={label(shift)}
            onApprove={
              shift.status !== 'approved' && shift.shift_ended_at
                ? () => {
                    onStatus([shift], 'approved', `Approve: ${label(shift)}`)
                  }
                : undefined
            }
            onReject={
              shift.status !== 'rejected'
                ? () => {
                    onStatus([shift], 'rejected', `Reject: ${label(shift)}`)
                  }
                : undefined
            }
          />
        ),
      },
    ],
    itemMenu: shift => (
      <HamburgerMenu
        triggerLabel={`Actions for ${label(shift)}`}
        items={[
          ...(shift.status !== 'pending'
            ? [
                {
                  label: 'Return to pending',
                  onClick: () => {
                    onStatus([shift], 'pending', `Return to pending: ${label(shift)}`)
                  },
                },
              ]
            : []),
          {
            label: 'Edit or delete',
            onClick: () => {
              onEdit(shift)
            },
          },
          ...(shift.shift_ended_at
            ? []
            : [
                {
                  label: 'Clock out now',
                  onClick: () => {
                    onClockOut(shift)
                  },
                },
              ]),
        ]}
      />
    ),
  })

  return (
    <Flex flexDirection="column" gap={12}>
      <Flex alignItems="center" gap={12} flexWrap="wrap">
        <Trail trail={[{ label: 'Timesheets', onClick: onBack }]} current={person.name} />
      </Flex>
      <Flex alignItems="center" gap={12} flexWrap="wrap">
        <Components.Heading as="h2" styledAs="h4">
          {person.name} · {shifts.length} shifts
        </Components.Heading>
        <span className={styles.spacer} />
        {selectedShifts.length > 0 && (
          <>
            <GapPin id="bulk-approval" />
            <ApproveReject
              label={`${selectedShifts.length} selected shifts`}
              approveCount={selectedToApprove.length}
              rejectCount={selectedToReject.length}
              onApprove={
                selectedToApprove.length
                  ? () => {
                      onStatus(
                        selectedToApprove,
                        'approved',
                        `Approve ${selectedToApprove.length} shifts`,
                      )
                    }
                  : undefined
              }
              onReject={
                selectedToReject.length
                  ? () => {
                      onStatus(
                        selectedToReject,
                        'rejected',
                        `Reject ${selectedToReject.length} shifts`,
                      )
                    }
                  : undefined
              }
            />
          </>
        )}
      </Flex>
      {policy && shiftsWithIssues.length > 0 && (
        <Components.Alert
          status="warning"
          label={`${shiftsWithIssues.length} of these shifts are missing a break or have a short one`}
        >
          {policy.pay_premium
            ? `${policy.name} pays a premium for each missed or short break, so these shifts earn extra pay. Fix the breaks if they were actually taken.`
            : `${policy.name} doesn’t pay a premium, so this doesn’t change pay. Fix the breaks if they were actually taken.`}{' '}
          The page checks this against the policy’s rules; the API doesn’t flag it.{' '}
          <ChangePin id="missed-breaks" />
        </Components.Alert>
      )}
      <div className={styles.reviewTable}>
        <DataView label={`${person.name}’s shifts`} {...dataView} />
      </div>
    </Flex>
  )
}
