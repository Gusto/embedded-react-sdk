import { resolve, relative } from 'node:path'
import type { ScenarioContext } from './cache'
import { getCachedScenario, setCachedScenario } from './cache'
import { loadScenario, resolveScenario } from './loader'
import { hashScenarioStructure } from './hash'
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
      street_2: loc.street_2,
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
    const startDate =
      'start_date' in contractor && typeof contractor.start_date === 'string'
        ? contractor.start_date
        : new Date().toISOString().split('T')[0]

    const created = await api.post<{ uuid: string }>(`/companies/${companyId}/contractors`, {
      type: contractor.type,
      ...(contractor.first_name ? { first_name: contractor.first_name } : {}),
      ...(contractor.last_name ? { last_name: contractor.last_name } : {}),
      ...(contractor.business_name ? { business_name: contractor.business_name } : {}),
      ...(contractor.email ? { email: contractor.email } : {}),
      ...(contractor.wage_type ? { wage_type: contractor.wage_type } : {}),
      ...(contractor.hourly_rate ? { hourly_rate: contractor.hourly_rate } : {}),
      start_date: startDate,
    })

    contractorIds[contractor.key] = created.uuid
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

  const MAX_POLL = 20
  const POLL_INTERVAL_MS = 3000

  for (let i = 0; i < MAX_POLL; i++) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
    const payroll = await api.get<PayrollStatus>(`/companies/${companyId}/payrolls/${payrollUuid}`)
    if (payroll.processing_request?.status === 'calculate_success') {
      log(`  Submitting payroll ${payrollUuid}`)
      await api.put(`/companies/${companyId}/payrolls/${payrollUuid}/submit`, {})
      break
    }
    if (payroll.processing_request?.status === 'calculate_failed') {
      throw new Error(`Payroll ${payrollUuid} calculation failed`)
    }
  }

  for (let i = 0; i < MAX_POLL; i++) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
    const payroll = await api.get<PayrollStatus>(`/companies/${companyId}/payrolls/${payrollUuid}`)
    if (payroll.processed) {
      log(`  Payroll ${payrollUuid} processed`)
      return
    }
  }

  throw new Error(`Payroll ${payrollUuid} processing timed out`)
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
      const created = await api.post<{ uuid: string }>(`/companies/${companyId}/payrolls`, {
        check_date: payroll.check_date,
        off_cycle: true,
        off_cycle_reason: 'Bonus',
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

      const unprocessed = periods.find(
        p =>
          !p.payroll?.processed &&
          p.payroll?.payroll_type === 'regular' &&
          p.end_date <= today.toISOString().split('T')[0]!,
      )

      if (!unprocessed) {
        throw new Error(`No unprocessed regular payroll found for payroll key: ${payroll.key}`)
      }
      payrollUuid = unprocessed.payroll.payroll_uuid
    }

    if (payroll.status === 'processed') {
      await processPayroll(api, companyId, payrollUuid, log)
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

export async function provisionScenario(
  scenarioPath: string,
  options?: { gwsFlowsHost?: string; onProgress?: ProgressFn },
): Promise<ScenarioContext> {
  const gwsFlowsBase =
    options?.gwsFlowsHost ?? process.env.E2E_GWS_FLOWS_HOST ?? DEFAULT_GWS_FLOWS_HOST
  const log = makeLog(options?.onProgress)
  const scenarioId = deriveScenarioId(scenarioPath)

  log(`Loading scenario: ${scenarioId}`)

  const [scenario, preTemplateValue] = await Promise.all([
    loadScenario(scenarioPath),
    resolveScenario(scenarioPath),
  ])

  const hash = hashScenarioStructure(
    preTemplateValue as Parameters<typeof hashScenarioStructure>[0],
  )

  const cached = await getCachedScenario(scenarioId, hash, gwsFlowsBase)
  if (cached) {
    log(`Cache hit for ${scenarioId}`)
    return cached
  }

  log(`Cache miss — provisioning ${scenario.baseDemo} demo`)
  const demoResult = await createDemoAndProvision(gwsFlowsBase, scenario.baseDemo, {
    onProgress: options?.onProgress,
  })

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

  setCachedScenario(scenarioId, hash, context)
  log(`Scenario ${scenarioId} provisioned and cached`)

  return context
}
