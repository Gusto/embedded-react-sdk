import { resolve, relative } from 'node:path'
import type { ScenarioContext } from './context'
import { loadScenario } from './loader'
import { createDemoAndProvision } from '../../sdk-app/scripts/demo-provisioner'
import type {
  Scenario,
  EmployeeDecoration,
  LocationDecoration,
  ContractorDecoration,
  PayScheduleDecoration,
  PayrollDecoration,
  StateTaxDecoration,
} from '../scenarios/schema/scenario.types'

const DEFAULT_GWS_FLOWS_HOST = 'https://flows.gusto-demo.com'

export interface ApiClient {
  get: <T>(path: string) => Promise<T>
  post: <T>(path: string, body: Record<string, unknown>) => Promise<T>
  put: <T>(path: string, body: Record<string, unknown>) => Promise<T>
}

export function makeApi(gwsFlowsBase: string, flowToken: string): ApiClient {
  const base = `${gwsFlowsBase}/fe_sdk/${flowToken}/v1`

  async function request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const url = `${base}${path}`
    const response = await fetch(url, {
      method,
      ...(body
        ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
        : {}),
    })
    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      throw new Error(`${method} ${path} failed (${response.status}): ${errorBody}`)
    }
    return response.json() as Promise<T>
  }

  return {
    get: <T>(path: string) => request<T>('GET', path),
    post: <T>(path: string, body: Record<string, unknown>) => request<T>('POST', path, body),
    put: <T>(path: string, body: Record<string, unknown>) => request<T>('PUT', path, body),
  }
}

function deriveScenarioId(scenarioPath: string): string {
  const abs = resolve(scenarioPath)
  const fromRoot = relative(resolve('e2e/scenarios'), abs)
  return fromRoot.replace(/\.json$/, '')
}

type ProgressFn = (msg: string) => void

function makeLog(onProgress?: ProgressFn) {
  return (msg: string) => {
    onProgress?.(msg)
    console.log('[scenario-runner]', msg)
  }
}

async function decorateLocations(
  api: ApiClient,
  companyId: string,
  locations: LocationDecoration[],
  log: ReturnType<typeof makeLog>,
): Promise<Record<string, string>> {
  const locationIds: Record<string, string> = {}

  for (const loc of locations) {
    if ('$ref' in loc) continue
    log(`Creating location: ${loc.key}`)

    const created = await api.post<{ uuid: string }>(`/companies/${companyId}/locations`, {
      street_1: loc.street_1,
      city: loc.city,
      state: loc.state,
      zip: loc.zip,
      phone_number: '4155551234',
      ...(loc.filing_address ? { filing_address: true } : {}),
      ...(loc.mailing_address ? { mailing_address: true } : {}),
    })

    locationIds[loc.key] = created.uuid
  }

  return locationIds
}

async function decorateStateTaxes(
  api: ApiClient,
  companyId: string,
  stateTaxes: StateTaxDecoration[],
  log: ReturnType<typeof makeLog>,
): Promise<void> {
  for (const entry of stateTaxes) {
    log(`Pre-seeding tax requirements for ${entry.state}`)
    // gws-flows surfaces tax requirements per-state once the company is
    // registered in that state (typically via a location with state=XX or
    // an employee work_address in XX). PUT /tax_requirements/:state accepts
    // the same requirement_sets shape that the SDK posts during edit. We
    // honor the canonical key names — `effective_from` and snake-case keys.
    await api.put(`/companies/${companyId}/tax_requirements/${entry.state}`, {
      requirement_sets: entry.requirementSets.map(set => ({
        state: entry.state,
        key: set.key,
        ...(set.effective_from !== undefined ? { effective_from: set.effective_from } : {}),
        requirements: set.requirements.map(r => ({ key: r.key, value: r.value })),
      })),
    })
  }
}

async function decorateEmployees(
  api: ApiClient,
  companyId: string,
  employees: EmployeeDecoration[],
  locationIds: Record<string, string>,
  log: ReturnType<typeof makeLog>,
): Promise<Record<string, string>> {
  const employeeIds: Record<string, string> = {}

  for (const emp of employees) {
    if ('$ref' in emp) continue
    log(`Creating employee: ${emp.key}`)

    const created = await api.post<{ uuid: string }>(`/companies/${companyId}/employees`, {
      first_name: emp.first_name,
      last_name: emp.last_name,
      ...(emp.email ? { email: emp.email } : {}),
    })
    const uuid = created.uuid
    employeeIds[emp.key] = uuid

    if (emp.home_address) {
      log(`  Setting home address for ${emp.key}`)
      await api.post(`/employees/${uuid}/home_addresses`, {
        street_1: emp.home_address.street_1,
        street_2: emp.home_address.street_2,
        city: emp.home_address.city,
        state: emp.home_address.state,
        zip: emp.home_address.zip,
      })
    }

    if (emp.work_address) {
      const locationUuid = emp.work_address.locationKey
        ? locationIds[emp.work_address.locationKey]
        : undefined
      if (emp.work_address.locationKey && !locationUuid) {
        throw new Error(
          `Employee ${emp.key} references unknown locationKey: ${emp.work_address.locationKey}`,
        )
      }
      log(`  Setting work address for ${emp.key}`)
      await api.post(`/employees/${uuid}/work_addresses`, {
        location_uuid: locationUuid,
      })
    }

    if (emp.job) {
      const jobLocationUuid = emp.job.locationKey ? locationIds[emp.job.locationKey] : undefined
      if (emp.job.locationKey && !jobLocationUuid) {
        throw new Error(
          `Employee ${emp.key} job references unknown locationKey: ${emp.job.locationKey}`,
        )
      }
      log(`  Creating job for ${emp.key}`)
      await api.post(`/employees/${uuid}/jobs`, {
        title: emp.job.title,
        hire_date: emp.job.hire_date,
        ...(jobLocationUuid ? { location_uuid: jobLocationUuid } : {}),
      })
    }

    if (emp.compensation) {
      log(`  Setting compensation for ${emp.key}`)
      const jobs = await api.get<
        Array<{ uuid: string; compensations?: Array<{ uuid: string; version: string }> }>
      >(`/employees/${uuid}/jobs`)
      const job = jobs[jobs.length - 1]
      if (!job) {
        throw new Error(`Employee ${emp.key} has compensation but no jobs were found`)
      }

      const existingComp = job.compensations?.[job.compensations.length - 1]
      const compBody: Record<string, unknown> = {
        ...(emp.compensation.rate ? { rate: emp.compensation.rate } : {}),
        ...(emp.compensation.payment_unit ? { payment_unit: emp.compensation.payment_unit } : {}),
        ...(emp.compensation.flsa_status ? { flsa_status: emp.compensation.flsa_status } : {}),
      }

      if (existingComp) {
        await api.put(`/compensations/${existingComp.uuid}`, {
          ...compBody,
          version: existingComp.version,
        })
      } else {
        await api.post(`/jobs/${job.uuid}/compensations`, compBody)
      }
    }

    if (emp.onboarding_status) {
      const onboardingStatus =
        emp.onboarding_status === 'completed' ? 'onboarding_completed' : emp.onboarding_status
      log(`  Setting onboarding status for ${emp.key}: ${emp.onboarding_status}`)
      // The previous implementation swallowed this error and continued, which
      // turned a half-provisioned scenario into a downstream test failure
      // 30+s later (e.g. "list shows no employees" when in fact the runner
      // never finished provisioning). If this PUT fails, the scenario can't
      // be delivered as declared — fail fast with the API's reason rather
      // than letting tests run against an unfinished company.
      await api.put(`/employees/${uuid}/onboarding_status`, {
        onboarding_status: onboardingStatus,
      })
    }

    if (emp.termination) {
      log(`  Creating termination for ${emp.key}`)
      await api.post(`/employees/${uuid}/terminations`, {
        effective_date: emp.termination.effective_date,
        run_termination_payroll: emp.termination.run_termination_payroll,
      })
    }
  }

  return employeeIds
}

async function decorateContractors(
  api: ApiClient,
  companyId: string,
  contractors: ContractorDecoration[],
  log: ReturnType<typeof makeLog>,
): Promise<Record<string, string>> {
  const contractorIds: Record<string, string> = {}

  for (const contractor of contractors) {
    if ('$ref' in contractor) continue
    log(`Creating contractor: ${contractor.key}`)

    const created = await api.post<{ uuid: string }>(`/companies/${companyId}/contractors`, {
      type: contractor.type,
      ...(contractor.first_name ? { first_name: contractor.first_name } : {}),
      ...(contractor.last_name ? { last_name: contractor.last_name } : {}),
      ...(contractor.business_name ? { business_name: contractor.business_name } : {}),
      ...(contractor.email ? { email: contractor.email } : {}),
      ...(contractor.wage_type ? { wage_type: contractor.wage_type } : {}),
      ...(contractor.hourly_rate ? { hourly_rate: contractor.hourly_rate } : {}),
      start_date: new Date().toISOString().split('T')[0],
    })

    contractorIds[contractor.key] = created.uuid

    if (contractor.address) {
      log(`  Setting address for ${contractor.key}`)
      await api.put(`/contractors/${created.uuid}/address`, {
        street_1: contractor.address.street_1,
        ...(contractor.address.street_2 ? { street_2: contractor.address.street_2 } : {}),
        city: contractor.address.city,
        state: contractor.address.state,
        zip: contractor.address.zip,
      })
    }

    if (contractor.onboarding_status) {
      const onboardingStatus =
        contractor.onboarding_status === 'completed'
          ? 'onboarding_completed'
          : contractor.onboarding_status

      if (onboardingStatus === 'onboarding_completed') {
        // The contractor's PUT /onboarding_status only allows the transition
        // from `admin_onboarding_review` -> `onboarding_completed`. Reaching
        // `admin_onboarding_review` requires every *required* onboarding step
        // to be complete: basic_details (from create), compensation_details
        // (from wage_type+rate on create), add_address (handled above), and
        // payment_details. Set the payment method to `Check` so the contractor
        // auto-advances into `admin_onboarding_review` before we attempt the
        // final transition.
        log(`  Setting payment method to Check for ${contractor.key}`)
        const paymentMethod = await api.get<{ version?: string }>(
          `/contractors/${created.uuid}/payment_method`,
        )
        await api.put(`/contractors/${created.uuid}/payment_method`, {
          type: 'Check',
          version: paymentMethod.version,
        })
      }

      // PUT /contractors/:uuid/onboarding_status with retry on 422.
      //
      // Setting payment_method = Check transitions some demo contractors
      // into admin_onboarding_review (eligible for the final transition);
      // others stay in self_onboarding_not_invited or admin_onboarding_incomplete
      // depending on the base demo's seed state. Only the first group can
      // be PUT to onboarding_completed via the API alone — the second
      // group is missing a prerequisite (typically an onboarding step the
      // scenario runner cannot fulfill) and never converges, regardless
      // of how long we wait.
      //
      // Strategy: try the transition with a short retry window for the
      // genuinely-eventual-consistent cases, but treat persistent 422 as a
      // best-effort warning rather than a fatal scenario error. Downstream
      // contractor specs that need a payment-ready contractor (canary 03,
      // contractor-payment-submit-lifecycle) handle the empty-payable-list
      // case themselves by picking from the demo seed's pre-existing
      // contractors. Other 4xx/5xx codes still fail fast.
      log(`  Setting onboarding status for ${contractor.key}: ${contractor.onboarding_status}`)
      // Bumped from 30s to 90s. The previous 30s budget (6 attempts at 5s
      // intervals) was reaching exhaustion in CI under the slow demo
      // backend — the contractor's intermediate onboarding state was
      // taking longer to advance than 30s allowed for. 90s gives 18
      // attempts, comfortably enough margin that "still not ready after
      // 90s" is a real degraded state, not retry-budget exhaustion.
      const ONBOARDING_RETRY_BUDGET_MS = 90_000
      const start = Date.now()
      let lastError: unknown = null
      let attempt = 0
      let succeeded = false
      while (Date.now() - start < ONBOARDING_RETRY_BUDGET_MS) {
        attempt++
        try {
          await api.put(`/contractors/${created.uuid}/onboarding_status`, {
            onboarding_status: onboardingStatus,
          })
          lastError = null
          succeeded = true
          break
        } catch (error) {
          lastError = error
          const message = String(error)
          // 422 means the backend won't accept the transition from the
          // contractor's current state — wait and retry in case it's
          // eventual consistency. Any other failure (network, 5xx, etc.)
          // is not transient and should fail fast.
          if (!message.includes('(422)')) {
            throw error
          }
          await new Promise(r => setTimeout(r, 5_000))
        }
      }
      if (!succeeded) {
        log(
          `  Transition to ${contractor.onboarding_status} for ${contractor.key} did not succeed after ${attempt} attempts (${Math.round((Date.now() - start) / 1000)}s); continuing as best-effort. Last error: ${String(lastError)}`,
        )
      }
    }
  }

  return contractorIds
}

async function decoratePaySchedule(
  api: ApiClient,
  companyId: string,
  paySchedule: PayScheduleDecoration,
  log: ReturnType<typeof makeLog>,
): Promise<{ uuid: string }> {
  log(`Setting pay schedule: ${paySchedule.frequency}`)

  const existing = await api.get<Array<{ uuid: string; version?: string }>>(
    `/companies/${companyId}/pay_schedules`,
  )

  const body: Record<string, unknown> = {
    frequency: paySchedule.frequency,
    ...(paySchedule.anchor_pay_date ? { anchor_pay_date: paySchedule.anchor_pay_date } : {}),
    ...(paySchedule.anchor_end_of_pay_period
      ? { anchor_end_of_pay_period: paySchedule.anchor_end_of_pay_period }
      : {}),
  }

  if (existing.length > 0) {
    const schedule = existing[0]!
    const updated = await api.put<{ uuid: string }>(
      `/companies/${companyId}/pay_schedules/${schedule.uuid}`,
      { ...body, ...(schedule.version ? { version: schedule.version } : {}) },
    )
    return { uuid: updated.uuid }
  }

  const created = await api.post<{ uuid: string }>(`/companies/${companyId}/pay_schedules`, body)
  return { uuid: created.uuid }
}

interface PayPeriod {
  start_date: string
  end_date: string
  payroll: {
    payroll_uuid: string
    payroll_type: string
    processed: boolean
  }
}

interface PayrollStatus {
  uuid: string
  processed: boolean
  processing_request?: { status: string }
}

async function pollUntil<T>(
  fn: () => Promise<T | null>,
  options: { maxWaitMs: number; initialDelayMs?: number; maxDelayMs?: number },
): Promise<T | null> {
  const start = Date.now()
  let delay = options.initialDelayMs ?? 500
  const cap = options.maxDelayMs ?? 2000
  while (Date.now() - start < options.maxWaitMs) {
    const result = await fn()
    if (result !== null) return result
    await new Promise(r => setTimeout(r, delay))
    delay = Math.min(delay * 2, cap)
  }
  return null
}

async function processPayroll(
  api: ApiClient,
  companyId: string,
  payrollUuid: string,
  log: ReturnType<typeof makeLog>,
): Promise<void> {
  log(`  Preparing payroll ${payrollUuid}`)
  await api.put(`/companies/${companyId}/payrolls/${payrollUuid}/prepare`, {})

  log(`  Calculating payroll ${payrollUuid}`)
  await api.put(`/companies/${companyId}/payrolls/${payrollUuid}/calculate`, {})

  // Previously this was 20 attempts * 3s = 60s per phase with a 3s pre-sleep
  // on every iteration. The exponential backoff below keeps the same ~60s
  // overall budget per phase but lets fast paths return in <1s instead of
  // always paying the 3s pre-sleep.
  const PHASE_BUDGET_MS = 60_000

  const calculated = await pollUntil(
    async () => {
      const payroll = await api.get<PayrollStatus>(
        `/companies/${companyId}/payrolls/${payrollUuid}`,
      )
      if (payroll.processing_request?.status === 'calculate_failed') {
        throw new Error(`Payroll ${payrollUuid} calculation failed`)
      }
      return payroll.processing_request?.status === 'calculate_success' ? payroll : null
    },
    { maxWaitMs: PHASE_BUDGET_MS },
  )

  if (!calculated) {
    throw new Error(`Payroll ${payrollUuid} calculation timed out`)
  }

  log(`  Submitting payroll ${payrollUuid}`)
  await api.put(`/companies/${companyId}/payrolls/${payrollUuid}/submit`, {})

  const processed = await pollUntil(
    async () => {
      const payroll = await api.get<PayrollStatus>(
        `/companies/${companyId}/payrolls/${payrollUuid}`,
      )
      return payroll.processed ? payroll : null
    },
    { maxWaitMs: PHASE_BUDGET_MS },
  )

  if (!processed) {
    throw new Error(`Payroll ${payrollUuid} processing timed out`)
  }

  log(`  Payroll ${payrollUuid} processed`)
}

async function decoratePayrolls(
  api: ApiClient,
  companyId: string,
  payrolls: PayrollDecoration[],
  log: ReturnType<typeof makeLog>,
): Promise<Record<string, string>> {
  const payrollIds: Record<string, string> = {}

  for (const payroll of payrolls) {
    log(
      `Creating payroll: ${payroll.key} (type=${payroll.type}, status=${payroll.status ?? 'unprocessed'})`,
    )

    let payrollUuid: string

    if (payroll.type === 'off_cycle') {
      const payload: Record<string, unknown> = {
        check_date: payroll.check_date,
        off_cycle: true,
        off_cycle_reason: 'Bonus',
      }
      const startDate =
        typeof payroll['start_date'] === 'string' ? (payroll['start_date'] as string) : undefined
      const endDate =
        typeof payroll['end_date'] === 'string' ? (payroll['end_date'] as string) : undefined
      const defaultRangeDate = payroll.check_date ?? new Date().toISOString().slice(0, 10)
      payload.start_date = startDate ?? defaultRangeDate
      payload.end_date = endDate ?? defaultRangeDate

      const created = await api.post<{ uuid: string }>(`/companies/${companyId}/payrolls`, {
        ...payload,
      })
      payrollUuid = created.uuid
    } else {
      const today = new Date()
      const rangeStart = new Date(today)
      rangeStart.setMonth(today.getMonth() - 3)
      const rangeEnd = new Date(today)
      rangeEnd.setDate(today.getDate() + 30)

      const periods = await api.get<PayPeriod[]>(
        `/companies/${companyId}/pay_periods` +
          `?start_date=${rangeStart.toISOString().split('T')[0]}` +
          `&end_date=${rangeEnd.toISOString().split('T')[0]}`,
      )

      const unprocessedPast = periods.find(
        p =>
          !p.payroll?.processed &&
          p.payroll?.payroll_type === 'regular' &&
          p.end_date <= today.toISOString().split('T')[0]!,
      )
      const unprocessedAny = periods.find(
        p => !p.payroll?.processed && p.payroll?.payroll_type === 'regular',
      )
      const unprocessed = unprocessedPast ?? unprocessedAny

      if (!unprocessed) {
        throw new Error(`No unprocessed regular payroll found for payroll key: ${payroll.key}`)
      }
      payrollUuid = unprocessed.payroll.payroll_uuid
    }

    if (payroll.status === 'processed') {
      try {
        await processPayroll(api, companyId, payrollUuid, log)
      } catch (error) {
        const message = String(error)
        if (message.includes('payroll_blocker') || message.includes('missing_forms')) {
          log(`  Skipping payroll processing for ${payroll.key}; blocker encountered (${message})`)
        } else {
          throw error
        }
      }
    }

    payrollIds[payroll.key] = payrollUuid
  }

  return payrollIds
}

function validateExpectedContext(context: ScenarioContext, expectedPaths: string[]): void {
  const missing: string[] = []

  for (const dottedPath of expectedPaths) {
    const parts = dottedPath.split('.')
    let current: unknown = context
    let resolved = true

    for (const part of parts) {
      if (current == null || typeof current !== 'object') {
        resolved = false
        break
      }
      current = (current as Record<string, unknown>)[part]
    }

    if (!resolved || current == null) {
      missing.push(dottedPath)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Scenario expected context validation failed. Missing paths:\n${missing.map(p => `  - ${p}`).join('\n')}`,
    )
  }
}

/**
 * Validate that the base demo's company satisfies the scenario's stated
 * preconditions (onboarding complete, employees seeded, etc.).
 *
 * Single-shot check. Caller wraps in waitForBaseDemoReady when polling is
 * required.
 *
 * Returns null on success, or a human-readable reason string when the demo
 * isn't ready.
 */
export async function checkBaseDemoState(
  api: ApiClient,
  companyId: string,
  requirements: { onboarded: boolean; onboardedEmployees: boolean },
): Promise<string | null> {
  if (!requirements.onboarded && !requirements.onboardedEmployees) return null

  try {
    const status = await api.get<{ onboarding_completed?: boolean }>(
      `/companies/${companyId}/onboarding_status`,
    )
    if (status.onboarding_completed !== true) {
      return `expected onboarding_completed=true, got ${status.onboarding_completed ?? 'undefined'}`
    }
  } catch (error) {
    return `could not read onboarding_status: ${String(error)}`
  }

  if (requirements.onboardedEmployees) {
    try {
      type EmployeeSummary = {
        uuid: string
        onboarded?: boolean
        onboarding_status?: string
        terminated?: boolean
      }
      const employees = await api.get<EmployeeSummary[]>(`/companies/${companyId}/employees`)
      const onboarded = employees.filter(
        e =>
          !e.terminated && (e.onboarded === true || e.onboarding_status === 'onboarding_completed'),
      )
      if (onboarded.length === 0) {
        return `expected ≥1 onboarded non-terminated employee, got ${employees.length} total / 0 onboarded`
      }
    } catch (error) {
      return `could not read employees: ${String(error)}`
    }
  }

  return null
}

/**
 * Maximum patience for the base demo's background seeding to complete.
 * The react_sdk_demo_company_onboarded factory finishes seeding the company
 * (signatory creation, form signing, employee roster materialization) on a
 * background job after POST /demos returns the flow token. Observed
 * seeding window: 10-90s, with the long tail going up toward 2-3 minutes
 * when the demo backend is under load. 180s gives a 1.5x margin over the
 * upper end of the observed window.
 *
 * We trust the backend to eventually finish — we don't discard demos and
 * retry, we just wait. If a single demo can't reach the required state in
 * 180s, that's a real backend regression and the caller fails loudly.
 */
const BASE_DEMO_READINESS_BUDGET_MS = 180_000

/**
 * Poll a single demo's company state with exponential backoff until it
 * satisfies the requirements, or the readiness budget runs out.
 *
 * Returns null on success, the last validation reason on timeout.
 */
async function waitForBaseDemoReady(
  api: ApiClient,
  companyId: string,
  requirements: { onboarded: boolean; onboardedEmployees: boolean },
  log: ReturnType<typeof makeLog>,
): Promise<string | null> {
  const start = Date.now()
  let delay = 500
  let lastReason: string | null = null
  let pollCount = 0

  while (Date.now() - start < BASE_DEMO_READINESS_BUDGET_MS) {
    pollCount++
    lastReason = await checkBaseDemoState(api, companyId, requirements)
    if (lastReason === null) {
      if (pollCount > 1) {
        log(
          `  Demo ${companyId.slice(0, 8)} became ready after ${pollCount} poll(s) (${Math.round(
            (Date.now() - start) / 1000,
          )}s)`,
        )
      }
      return null
    }
    await new Promise(r => setTimeout(r, delay))
    delay = Math.min(delay * 2, 2_000)
  }

  const elapsedSec = Math.round((Date.now() - start) / 1000)
  log(
    `  Demo ${companyId.slice(0, 8)} not ready after ${elapsedSec}s / ${pollCount} polls (last reason: ${lastReason})`,
  )
  return lastReason
}

export async function provisionScenario(
  scenarioPath: string,
  options?: { gwsFlowsHost?: string; onProgress?: ProgressFn },
): Promise<ScenarioContext> {
  const gwsFlowsBase =
    options?.gwsFlowsHost ?? process.env.E2E_GWS_FLOWS_HOST ?? DEFAULT_GWS_FLOWS_HOST
  const log = makeLog(options?.onProgress)
  const scenarioId = deriveScenarioId(scenarioPath)

  log(`Loading scenario: ${scenarioId}`)

  const scenario = await loadScenario(scenarioPath)

  // requireOnboardedEmployees implies requireOnboardedCompany — if you need
  // onboarded employees you definitionally need onboarding to be complete.
  const requireOnboarded =
    scenario.requireOnboardedCompany === true || scenario.requireOnboardedEmployees === true
  const requireOnboardedEmployees = scenario.requireOnboardedEmployees === true

  log(`Provisioning ${scenario.baseDemo} demo for ${scenarioId}`)
  const demoResult = await createDemoAndProvision(gwsFlowsBase, scenario.baseDemo, {
    onProgress: options?.onProgress,
  })

  const { flowToken, companyId } = demoResult
  const api = makeApi(gwsFlowsBase, flowToken)

  if (requireOnboarded) {
    const reason = await waitForBaseDemoReady(
      api,
      companyId,
      { onboarded: requireOnboarded, onboardedEmployees: requireOnboardedEmployees },
      log,
    )
    if (reason !== null) {
      throw new Error(
        `Base demo "${scenario.baseDemo}" (company ${companyId.slice(
          0,
          8,
        )}) failed readiness check after ${BASE_DEMO_READINESS_BUDGET_MS / 1000}s of patient polling: ${reason}\nThis indicates a regression in the demo factory on the gws-flows backend, not in the SDK.`,
      )
    }
  }

  const decorations = scenario.decorations

  const locationIds = decorations.locations
    ? await decorateLocations(api, companyId, decorations.locations, log)
    : {}

  if (decorations.stateTaxes) {
    await decorateStateTaxes(api, companyId, decorations.stateTaxes, log)
  }

  const employeeIds = decorations.employees
    ? await decorateEmployees(api, companyId, decorations.employees, locationIds, log)
    : {}

  const contractorIds = decorations.contractors
    ? await decorateContractors(api, companyId, decorations.contractors, log)
    : {}

  const paySchedule = decorations.paySchedule
    ? await decoratePaySchedule(api, companyId, decorations.paySchedule, log)
    : undefined

  const payrollIds = decorations.payrolls
    ? await decoratePayrolls(api, companyId, decorations.payrolls, log)
    : {}

  const context: ScenarioContext = {
    flowToken,
    companyId,
    locationIds,
    employeeIds,
    contractorIds,
    paySchedule,
    payrollIds,
  }

  if (scenario.expectedContext) {
    validateExpectedContext(context, scenario.expectedContext)
  }

  log(`Scenario ${scenarioId} provisioned`)

  return context
}
