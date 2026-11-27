import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { EntityIds } from './useEntities'
import panelStyles from './DemoSettingsPanel.module.scss'
import styles from './PayPeriodShiftsExplorer.module.scss'

type StageState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'done'; status: number; ok: boolean; body: unknown }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : []
}

function stringField(record: Record<string, unknown>, key: string): string {
  const value = record[key]
  return typeof value === 'string' ? value : ''
}

function prettyPrint(value: unknown): string {
  return JSON.stringify(value, null, 2)
}

function withQuery(path: string, params: Record<string, string | string[] | undefined>): string {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item) searchParams.append(`${key}[]`, item)
      }
    } else if (value) {
      searchParams.set(key, value)
    }
  }
  const queryString = searchParams.toString()
  return queryString ? `${path}?${queryString}` : path
}

async function fetchJson(
  path: string,
  signal: AbortSignal,
): Promise<{ status: number; ok: boolean; body: unknown }> {
  const res = await fetch(`/api${path}`, { signal })
  const text = await res.text()
  let body: unknown = text
  try {
    body = JSON.parse(text)
  } catch {
    // Non-JSON body -- display as raw text.
  }
  return { status: res.status, ok: res.ok, body }
}

interface AssignmentConfig {
  type: string
  hourlyPayScheduleUuid: string
  salariedPayScheduleUuid: string
  defaultPayScheduleUuid: string
  employeeOverrides: Map<string, string>
  departmentSchedules: Map<string, string>
}

function buildAssignmentConfig(body: unknown): AssignmentConfig | null {
  if (!isRecord(body)) return null

  const employeeOverrides = new Map<string, string>()
  for (const entry of asRecordArray(body.employees)) {
    const employeeUuid = stringField(entry, 'employee_uuid')
    const payScheduleUuid = stringField(entry, 'pay_schedule_uuid')
    if (employeeUuid && payScheduleUuid) employeeOverrides.set(employeeUuid, payScheduleUuid)
  }

  const departmentSchedules = new Map<string, string>()
  for (const entry of asRecordArray(body.departments)) {
    const departmentUuid = stringField(entry, 'department_uuid')
    const payScheduleUuid = stringField(entry, 'pay_schedule_uuid')
    if (departmentUuid && payScheduleUuid) departmentSchedules.set(departmentUuid, payScheduleUuid)
  }

  return {
    type: stringField(body, 'type'),
    hourlyPayScheduleUuid: stringField(body, 'hourly_pay_schedule_uuid'),
    salariedPayScheduleUuid: stringField(body, 'salaried_pay_schedule_uuid'),
    defaultPayScheduleUuid: stringField(body, 'default_pay_schedule_uuid'),
    employeeOverrides,
    departmentSchedules,
  }
}

// Not documented anywhere -- inferred from FlsaStatusType's description ("Hourly
// ('Nonexempt')... Commissioned with overtime ('Commission Only Nonexempt')...").
// Everything else (Exempt, Salaried Nonexempt, Owner, Commission Only Exempt) is
// treated as salaried. Flagged in the UI as an assumption, not a documented contract.
const HOURLY_FLSA_STATUSES = new Set(['Nonexempt', 'Commission Only Nonexempt'])

type ResolutionMethod =
  | 'employee override'
  | 'hourly/salaried split (inferred)'
  | 'department default'
  | 'company default'

interface ResolvedEmployee {
  uuid: string
  payScheduleUuid: string
  method: ResolutionMethod
}

function resolveEmployeePaySchedule(
  employee: Record<string, unknown>,
  config: AssignmentConfig,
): ResolvedEmployee | null {
  const uuid = stringField(employee, 'uuid')
  if (!uuid) return null

  const override = config.employeeOverrides.get(uuid)
  if (override) return { uuid, payScheduleUuid: override, method: 'employee override' }

  switch (config.type) {
    case 'single':
      return config.defaultPayScheduleUuid
        ? { uuid, payScheduleUuid: config.defaultPayScheduleUuid, method: 'company default' }
        : null
    case 'hourly_salaried': {
      const flsaStatus = stringField(employee, 'flsa_status')
      const payScheduleUuid = HOURLY_FLSA_STATUSES.has(flsaStatus)
        ? config.hourlyPayScheduleUuid
        : config.salariedPayScheduleUuid
      return payScheduleUuid
        ? { uuid, payScheduleUuid, method: 'hourly/salaried split (inferred)' }
        : null
    }
    case 'by_department': {
      const departmentUuid = stringField(employee, 'department_uuid')
      const departmentSchedule = departmentUuid
        ? config.departmentSchedules.get(departmentUuid)
        : undefined
      if (departmentSchedule) {
        return { uuid, payScheduleUuid: departmentSchedule, method: 'department default' }
      }
      return config.defaultPayScheduleUuid
        ? { uuid, payScheduleUuid: config.defaultPayScheduleUuid, method: 'company default' }
        : null
    }
    case 'by_employee':
      return config.defaultPayScheduleUuid
        ? { uuid, payScheduleUuid: config.defaultPayScheduleUuid, method: 'company default' }
        : null
    default:
      return null
  }
}

interface QueryStepProps {
  step: string
  title: string
  method: string
  path: string
  state: StageState
  footer?: React.ReactNode
  action?: React.ReactNode
}

function QueryStep({ step, title, method, path, state, footer, action }: QueryStepProps) {
  return (
    <div className={styles.step}>
      <div className={styles.stepHeader}>
        <span className={styles.stepNumber}>{step}</span>
        <h3 className={styles.stepTitle}>{title}</h3>
      </div>
      <div className={styles.requestLine}>
        <span className={styles.method}>{method}</span>
        <code>{path}</code>
        {action}
      </div>
      {state.kind === 'loading' && <div className={styles.placeholder}>Loading…</div>}
      {state.kind === 'error' && <div className={styles.error}>{state.message}</div>}
      {state.kind === 'done' && (
        <>
          <div
            className={`${styles.statusLine} ${state.ok ? styles.statusOk : styles.statusError}`}
          >
            HTTP {state.status}
          </div>
          <details className={styles.responseDetails}>
            <summary>Response body</summary>
            <pre className={styles.body}>{prettyPrint(state.body)}</pre>
          </details>
        </>
      )}
      {footer}
    </div>
  )
}

export function PayPeriodShiftsExplorer() {
  const { entities } = useOutletContext<{ entities: EntityIds }>()
  const companyId = entities.companyId

  const [schedulesState, setSchedulesState] = useState<StageState>({ kind: 'idle' })
  const [selectedScheduleUuid, setSelectedScheduleUuid] = useState('')

  const [assignmentsState, setAssignmentsState] = useState<StageState>({ kind: 'idle' })
  const [employeesState, setEmployeesState] = useState<StageState>({ kind: 'idle' })

  const [periodsWindowStart, setPeriodsWindowStart] = useState('')
  const [periodsWindowEnd, setPeriodsWindowEnd] = useState('')
  const [periodsState, setPeriodsState] = useState<StageState>({ kind: 'idle' })
  const [selectedPeriodKey, setSelectedPeriodKey] = useState('')

  const [shiftsState, setShiftsState] = useState<StageState>({ kind: 'idle' })

  const schedulesAbortRef = useRef<AbortController | null>(null)
  const resolutionFetchedRef = useRef(false)
  const periodsAbortRef = useRef<AbortController | null>(null)
  const shiftsAbortRef = useRef<AbortController | null>(null)

  const schedulesPath = `/v1/companies/${companyId}/pay_schedules`

  useEffect(() => {
    if (!companyId) return
    schedulesAbortRef.current?.abort()
    const controller = new AbortController()
    schedulesAbortRef.current = controller
    setSchedulesState({ kind: 'loading' })
    void (async () => {
      try {
        const result = await fetchJson(schedulesPath, controller.signal)
        if (controller.signal.aborted) return
        setSchedulesState({ kind: 'done', ...result })
      } catch (err) {
        if (controller.signal.aborted) return
        setSchedulesState({
          kind: 'error',
          message: err instanceof Error ? err.message : String(err),
        })
      }
    })()
    return () => {
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId])

  const schedules = schedulesState.kind === 'done' ? asRecordArray(schedulesState.body) : []

  const assignmentsPath = `/v1/companies/${companyId}/pay_schedules/assignments`
  const employeesPath = `/v1/companies/${companyId}/employees`

  useEffect(() => {
    if (!companyId || !selectedScheduleUuid || resolutionFetchedRef.current) return
    resolutionFetchedRef.current = true

    const assignmentsController = new AbortController()
    const employeesController = new AbortController()

    setAssignmentsState({ kind: 'loading' })
    void (async () => {
      try {
        const result = await fetchJson(assignmentsPath, assignmentsController.signal)
        if (assignmentsController.signal.aborted) return
        setAssignmentsState({ kind: 'done', ...result })
      } catch (err) {
        if (assignmentsController.signal.aborted) return
        setAssignmentsState({
          kind: 'error',
          message: err instanceof Error ? err.message : String(err),
        })
      }
    })()

    setEmployeesState({ kind: 'loading' })
    void (async () => {
      try {
        const result = await fetchJson(employeesPath, employeesController.signal)
        if (employeesController.signal.aborted) return
        setEmployeesState({ kind: 'done', ...result })
      } catch (err) {
        if (employeesController.signal.aborted) return
        setEmployeesState({
          kind: 'error',
          message: err instanceof Error ? err.message : String(err),
        })
      }
    })()

    return () => {
      assignmentsController.abort()
      employeesController.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, selectedScheduleUuid])

  const assignmentConfig =
    assignmentsState.kind === 'done' ? buildAssignmentConfig(assignmentsState.body) : null
  const allEmployees = employeesState.kind === 'done' ? asRecordArray(employeesState.body) : []
  const resolutionReady = assignmentsState.kind === 'done' && employeesState.kind === 'done'

  const resolvedEmployees: ResolvedEmployee[] = []
  const unresolvedEmployees: Record<string, unknown>[] = []
  if (assignmentConfig) {
    for (const employee of allEmployees) {
      const resolved = resolveEmployeePaySchedule(employee, assignmentConfig)
      if (resolved) resolvedEmployees.push(resolved)
      else unresolvedEmployees.push(employee)
    }
  }
  const employeesOnSchedule = resolvedEmployees.filter(
    e => e.payScheduleUuid === selectedScheduleUuid,
  )

  const periodsPath = withQuery(`/v1/companies/${companyId}/pay_periods`, {
    start_date: periodsWindowStart || undefined,
    end_date: periodsWindowEnd || undefined,
  })

  useEffect(() => {
    setSelectedPeriodKey('')
    setShiftsState({ kind: 'idle' })
    if (!companyId || !selectedScheduleUuid) {
      setPeriodsState({ kind: 'idle' })
      return
    }
    periodsAbortRef.current?.abort()
    const controller = new AbortController()
    periodsAbortRef.current = controller
    setPeriodsState({ kind: 'loading' })
    void (async () => {
      try {
        const result = await fetchJson(periodsPath, controller.signal)
        if (controller.signal.aborted) return
        setPeriodsState({ kind: 'done', ...result })
      } catch (err) {
        if (controller.signal.aborted) return
        setPeriodsState({
          kind: 'error',
          message: err instanceof Error ? err.message : String(err),
        })
      }
    })()
    return () => {
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, selectedScheduleUuid, periodsWindowStart, periodsWindowEnd])

  const allPeriods = periodsState.kind === 'done' ? asRecordArray(periodsState.body) : []
  const periodsForSchedule = allPeriods.filter(
    period => stringField(period, 'pay_schedule_uuid') === selectedScheduleUuid,
  )
  const selectedPeriod = periodsForSchedule.find(
    period =>
      `${stringField(period, 'start_date')}_${stringField(period, 'end_date')}` ===
      selectedPeriodKey,
  )

  const employeeUuidsOnSchedule = employeesOnSchedule.map(e => e.uuid)
  const canBuildShiftsQuery = Boolean(selectedPeriod) && employeeUuidsOnSchedule.length > 0

  const shiftsPath =
    selectedPeriod && canBuildShiftsQuery
      ? withQuery(`/v1/companies/${companyId}/time_tracking/time_sheets`, {
          entity_type: 'Employee',
          entity_uuids: employeeUuidsOnSchedule,
          shift_started_after: `${stringField(selectedPeriod, 'start_date')}T00:00:00Z`,
          shift_started_before: `${stringField(selectedPeriod, 'end_date')}T23:59:59Z`,
        })
      : ''

  const sendShiftsRequest = () => {
    if (!shiftsPath) return
    shiftsAbortRef.current?.abort()
    const controller = new AbortController()
    shiftsAbortRef.current = controller
    setShiftsState({ kind: 'loading' })
    void (async () => {
      try {
        const result = await fetchJson(shiftsPath, controller.signal)
        if (controller.signal.aborted) return
        setShiftsState({ kind: 'done', ...result })
      } catch (err) {
        if (controller.signal.aborted) return
        setShiftsState({ kind: 'error', message: err instanceof Error ? err.message : String(err) })
      }
    })()
  }

  return (
    <div className={styles.root}>
      <h1>Pay Period Shifts</h1>
      <p className={styles.hint}>
        Walks through the full query chain needed to fetch all shifts for one pay schedule&apos;s
        pay period. <code>time_sheets</code> has no pay-schedule field on a shift and no pay-period
        aggregation -- every step below exists only because the public API doesn&apos;t expose this
        as a single query.
      </p>

      <p className={styles.hint}>
        <strong>What would collapse this chain:</strong> two new query params on{' '}
        <code>time_tracking/time_sheets</code> (illustrative OAS diff below). Steps 2a/2b and the{' '}
        <code>entity_uuids[]</code> array go away once the backend&apos;s own assignment-resolution
        logic is exposed as a filter; step 3 and the client-side date→datetime translation go away
        once the endpoint accepts a period directly.
      </p>
      <pre className={styles.body}>
        {`  /v1/companies/{company_id}/time_tracking/time_sheets:
    get:
      parameters:
+       - name: pay_schedule_uuid
+         in: query
+         schema: { type: string, format: uuid }
+         description: >
+           Filter to employees currently resolved to this pay schedule
+           (same assignment-rule resolution the backend already applies).
+       - name: pay_period_uuid
+         in: query
+         schema: { type: string, format: uuid }
+         description: >
+           Scope to one pay period's date range directly, instead of
+           computing shift_started_after/before from pay_periods output.`}
      </pre>

      <QueryStep
        step="1"
        title="List pay schedules"
        method="GET"
        path={schedulesPath}
        state={schedulesState}
        footer={
          schedules.length > 0 && (
            <label className={styles.selectRow}>
              <span>Pay schedule</span>
              <select
                value={selectedScheduleUuid}
                onChange={e => {
                  setSelectedScheduleUuid(e.target.value)
                }}
              >
                <option value="">Select a pay schedule…</option>
                {schedules.map(schedule => {
                  const uuid = stringField(schedule, 'uuid')
                  const frequency = stringField(schedule, 'frequency') || 'Pay schedule'
                  return (
                    <option key={uuid} value={uuid}>
                      {frequency} — {uuid}
                    </option>
                  )
                })}
              </select>
            </label>
          )
        }
      />

      {selectedScheduleUuid && (
        <div className={styles.group}>
          <p className={styles.groupNote}>
            <strong>Step 2 — figure out who&apos;s even on this schedule.</strong> No endpoint
            filters shifts, or anything else, by pay schedule. The only way to know is to fetch the
            company&apos;s assignment rule and every employee, then replicate the backend&apos;s
            resolution logic ourselves.
          </p>
          <QueryStep
            step="2a"
            title="Get the company's pay schedule assignment rule"
            method="GET"
            path={assignmentsPath}
            state={assignmentsState}
          />
          <QueryStep
            step="2b"
            title="List every employee (need flsa_status and department_uuid to resolve 2a)"
            method="GET"
            path={employeesPath}
            state={employeesState}
          />
          {resolutionReady && (
            <div className={styles.resolutionSummary}>
              <div className={styles.filteredNote}>
                Assignment type: <code>{assignmentConfig?.type || 'unknown'}</code> ·{' '}
                {employeesOnSchedule.length} of {allEmployees.length} employees resolve to this
                schedule
                {unresolvedEmployees.length > 0 && (
                  <>
                    {' '}
                    · {unresolvedEmployees.length} employee(s) could not be resolved to ANY schedule
                    with this logic
                  </>
                )}
              </div>
              {assignmentConfig?.type === 'hourly_salaried' && (
                <div className={styles.warningNote}>
                  <code>hourly_salaried</code> split above uses an{' '}
                  <strong>undocumented assumption</strong>: <code>flsa_status</code> of Nonexempt /
                  Commission Only Nonexempt → hourly schedule, everything else → salaried schedule.
                  Gusto does not publish this mapping.
                </div>
              )}
              {employeesOnSchedule.length > 0 && (
                <details className={styles.responseDetails}>
                  <summary>
                    Resolved employees on this schedule ({employeesOnSchedule.length})
                  </summary>
                  <ul className={styles.resolvedList}>
                    {employeesOnSchedule.map(employee => (
                      <li key={employee.uuid}>
                        <code>{employee.uuid}</code> — {employee.method}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      )}

      {selectedScheduleUuid && (
        <QueryStep
          step="3"
          title="List pay periods in the search window, filtered to that schedule"
          method="GET"
          path={periodsPath}
          state={periodsState}
          action={
            <span className={styles.windowInputs}>
              <input
                type="date"
                value={periodsWindowStart}
                onChange={e => {
                  setPeriodsWindowStart(e.target.value)
                }}
                aria-label="Window start date (optional, defaults to 6 months ago)"
              />
              <span>–</span>
              <input
                type="date"
                value={periodsWindowEnd}
                onChange={e => {
                  setPeriodsWindowEnd(e.target.value)
                }}
                aria-label="Window end date (optional, defaults to today)"
              />
            </span>
          }
          footer={
            periodsState.kind === 'done' && (
              <>
                <div className={styles.filteredNote}>
                  {periodsForSchedule.length} of {allPeriods.length} periods in this window belong
                  to the selected schedule.
                </div>
                {periodsForSchedule.length > 0 && (
                  <label className={styles.selectRow}>
                    <span>Pay period</span>
                    <select
                      value={selectedPeriodKey}
                      onChange={e => {
                        setSelectedPeriodKey(e.target.value)
                      }}
                    >
                      <option value="">Select a pay period…</option>
                      {periodsForSchedule.map(period => {
                        const start = stringField(period, 'start_date')
                        const end = stringField(period, 'end_date')
                        const key = `${start}_${end}`
                        return (
                          <option key={key} value={key}>
                            {start} – {end}
                          </option>
                        )
                      })}
                    </select>
                  </label>
                )}
              </>
            )
          }
        />
      )}

      {selectedPeriod && resolutionReady && (
        <QueryStep
          step="4"
          title="List employee shifts starting in that period, scoped to resolved employees"
          method="GET"
          path={shiftsPath || '(blocked -- see note)'}
          state={shiftsState}
          action={
            canBuildShiftsQuery ? (
              <button
                type="button"
                className={panelStyles.btn}
                onClick={sendShiftsRequest}
                disabled={shiftsState.kind === 'loading'}
              >
                {shiftsState.kind === 'loading' ? 'Sending…' : 'Send'}
              </button>
            ) : (
              <span className={styles.error}>
                No employees resolved to this schedule — refusing to send an unscoped query.
              </span>
            )
          }
          footer={
            employeeUuidsOnSchedule.length > 50 && (
              <div className={styles.warningNote}>
                {employeeUuidsOnSchedule.length} <code>entity_uuids[]</code> params on one request
                -- large schedules risk hitting URL length limits with this approach.
              </div>
            )
          }
        />
      )}
    </div>
  )
}
