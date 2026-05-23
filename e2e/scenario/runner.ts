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
} from '../scenarios/schema/scenario.types'

const DEFAULT_GWS_FLOWS_HOST = 'https://flows.gusto-demo.com'

interface ApiClient {
  get: <T>(path: string) => Promise<T>
  post: <T>(path: string, body: Record<string, unknown>) => Promise<T>
  put: <T>(path: string, body: Record<string, unknown>) => Promise<T>
}

function makeApi(gwsFlowsBase: string, flowToken: string): ApiClient {
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
 * The `react_sdk_demo_company_onboarded` factory on flows.gusto-demo.com is
 * non-deterministic: most invocations return a fully-onboarded company with
 * ~14 seed employees, but a meaningful minority return an effectively-fresh
 * company with 8+ payroll blockers and no employees. Tests that depend on
 * the seeded onboarded state (the four canaries that opt in via
 * requireOnboardedCompany / requireOnboardedEmployees) fail downstream with
 * misleading errors when this happens.
 *
 * Returns null on success, or a human-readable reason string when the demo
 * is degraded. The caller re-provisions on a non-null result.
 */
async function checkBaseDemoState(
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
 * Batch sizes used to find an acceptable base demo when the factory is in a
 * degraded mode. The factory's bad output is statistically independent
 * per-demo invocation (verified empirically), so a parallel batch converts
 * serial retry latency into one round-trip per batch.
 *
 * Sized to be gentle on the demo backend. An earlier iteration used 4-way
 * parallel retries — that worked when one CI run hit the backend at a
 * time, but multiple concurrent CI runs (5 in parallel hitting backend
 * simultaneously, ~200 concurrent POST /demos calls) overloaded the
 * factory and made BOTH the original creation AND subsequent retries
 * time out at 180s. 2-way batches at 3 attempts is enough headroom at
 * the observed ~21% degraded-factory good-rate without flooding the
 * backend:
 *
 *   batch 1 (size 1):   P(success) = 0.21
 *   batch 2 (size 2):   P(at-least-one-good) = 1 - 0.79^2 = 0.38, cumulative 0.51
 *   batch 3 (size 2):   cumulative 0.69
 *   batch 4 (size 2):   cumulative 0.81
 *
 * Total worst-case demos: 7 (vs 13 before). Wall time worst case is
 * still ~4 batches × ~25s each = ~100s, because each batch is bounded
 * by the slowest demo not the sum.
 */
const BASE_DEMO_VALIDATION_BATCH_SIZES = [1, 2, 2, 2] as const

/**
 * Wait between batches to give the demo backend time to settle if it's
 * overloaded. The 5-run-concurrent stress test showed POST /demos
 * timing out at 180s when hammered; a brief pause between escalating
 * batches lets the backend recover (and lets a flaky transient
 * degraded factory window pass).
 */
const BASE_DEMO_VALIDATION_INTER_BATCH_DELAY_MS = 5_000

async function findAcceptableBaseDemo(
  gwsFlowsBase: string,
  baseDemoType: string,
  requirements: { onboarded: boolean; onboardedEmployees: boolean },
  log: ReturnType<typeof makeLog>,
  onProgress?: ProgressFn,
): Promise<{
  demo: Awaited<ReturnType<typeof createDemoAndProvision>> | null
  failures: string[]
}> {
  const failures: string[] = []

  for (let batchIdx = 0; batchIdx < BASE_DEMO_VALIDATION_BATCH_SIZES.length; batchIdx++) {
    const batchSize = BASE_DEMO_VALIDATION_BATCH_SIZES[batchIdx]!
    if (batchIdx > 0) {
      log(
        `  Previous attempt(s) returned degraded demos; pausing ${BASE_DEMO_VALIDATION_INTER_BATCH_DELAY_MS}ms then escalating to parallel batch of ${batchSize}`,
      )
      await new Promise(r => setTimeout(r, BASE_DEMO_VALIDATION_INTER_BATCH_DELAY_MS))
    }

    // Settle individually so one demo's 180s timeout doesn't kill the whole
    // batch — that would force the caller to re-create everything from
    // scratch on the next batch.  Each batch member resolves either to a
    // ready demo or to a creation error we record in failures.
    const batch = await Promise.allSettled(
      Array.from({ length: batchSize }, () =>
        createDemoAndProvision(gwsFlowsBase, baseDemoType, { onProgress }),
      ),
    )

    const creations: Array<{
      candidate: Awaited<ReturnType<typeof createDemoAndProvision>> | null
      reason: string | null
    }> = []
    for (const settled of batch) {
      if (settled.status === 'fulfilled') {
        creations.push({ candidate: settled.value, reason: null })
      } else {
        creations.push({ candidate: null, reason: `creation failed: ${String(settled.reason)}` })
      }
    }

    // Validate each successfully-created candidate in parallel; pick the
    // first acceptable one.
    const validations = await Promise.all(
      creations.map(async creation => {
        if (!creation.candidate) {
          return { candidate: null, reason: creation.reason ?? 'creation failed' }
        }
        const candidateApi = makeApi(gwsFlowsBase, creation.candidate.flowToken)
        const reason = await checkBaseDemoState(
          candidateApi,
          creation.candidate.companyId,
          requirements,
        )
        return { candidate: creation.candidate, reason }
      }),
    )

    const acceptable = validations.find(v => v.reason === null && v.candidate !== null)
    if (acceptable?.candidate) {
      const discarded = validations.length - 1
      if (discarded > 0) {
        log(`  Found acceptable demo on batch ${batchIdx + 1} (discarded ${discarded} degraded)`)
      }
      return { demo: acceptable.candidate, failures }
    }

    for (const v of validations) {
      const companyHint = v.candidate ? v.candidate.companyId.slice(0, 8) : 'no-company'
      failures.push(`batch ${batchIdx + 1} (${companyHint}): ${v.reason}`)
    }
    log(
      `  Batch ${batchIdx + 1} of ${BASE_DEMO_VALIDATION_BATCH_SIZES.length} returned ${batch.length}/${batch.length} degraded demos`,
    )
  }

  return { demo: null, failures }
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
  let demoResult: Awaited<ReturnType<typeof createDemoAndProvision>> | null = null
  let validationFailures: string[] = []

  if (!requireOnboarded) {
    demoResult = await createDemoAndProvision(gwsFlowsBase, scenario.baseDemo, {
      onProgress: options?.onProgress,
    })
  } else {
    const result = await findAcceptableBaseDemo(
      gwsFlowsBase,
      scenario.baseDemo,
      { onboarded: requireOnboarded, onboardedEmployees: requireOnboardedEmployees },
      log,
      options?.onProgress,
    )
    demoResult = result.demo
    validationFailures = result.failures
  }

  if (!demoResult) {
    throw new Error(
      `Base demo "${scenario.baseDemo}" failed scenario preconditions after ${BASE_DEMO_VALIDATION_BATCH_SIZES.reduce((s, n) => s + n, 0)} attempts across ${BASE_DEMO_VALIDATION_BATCH_SIZES.length} batches:\n${validationFailures
        .map(f => `  - ${f}`)
        .join(
          '\n',
        )}\nThis indicates a regression in the demo factory on the gws-flows backend, not in the SDK.`,
    )
  }

  const { flowToken, companyId } = demoResult
  const api = makeApi(gwsFlowsBase, flowToken)
  const decorations = scenario.decorations

  const locationIds = decorations.locations
    ? await decorateLocations(api, companyId, decorations.locations, log)
    : {}

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
