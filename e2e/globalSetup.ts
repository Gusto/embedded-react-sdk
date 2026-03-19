import { resolve } from 'path'
import { resolve as dnsResolve } from 'dns/promises'
import { existsSync, writeFileSync } from 'fs'
import * as dotenv from 'dotenv'
import { refreshTokenIfNeeded, createFreshDemo } from './scripts/refreshToken'

const localEnvPath = resolve(process.cwd(), 'e2e/local.config.env')
if (existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath })
}

const DEFAULT_GWS_FLOWS_HOST = 'https://flows.gusto-demo.com'
const GWS_FLOWS_BASE = process.env.E2E_GWS_FLOWS_HOST || DEFAULT_GWS_FLOWS_HOST
const isLocalHost = GWS_FLOWS_BASE.includes('localhost')

async function logNetworkDiagnostics(response: Response, targetUrl: string): Promise<void> {
  console.log('\n' + '='.repeat(60))
  console.log('=== E2E DEMO DIAGNOSTICS ===')
  console.log(`Step: globalSetup.ts -> checkGWSFlowsHealth()`)
  console.log(`Target URL: ${targetUrl}`)

  try {
    const hostname = new URL(GWS_FLOWS_BASE).hostname
    const addresses = await dnsResolve(hostname)
    console.log(`DNS: ${hostname} -> ${addresses.join(', ')}`)
  } catch (dnsError) {
    console.log(`DNS: resolution failed - ${dnsError}`)
  }

  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json', {
      signal: AbortSignal.timeout(5000),
    })
    const ipData = (await ipResponse.json()) as { ip: string }
    console.log(`Runner outbound IP: ${ipData.ip}`)
  } catch {
    console.log('Runner outbound IP: could not determine')
  }

  console.log(`Response status: ${response.status} ${response.statusText}`)
  console.log(`Response URL: ${response.url}`)

  console.log('Response headers:')
  response.headers.forEach((value, key) => {
    console.log(`  ${key}: ${value}`)
  })

  try {
    const body = await response.clone().text()
    const truncatedBody = body.substring(0, 1000)
    console.log(`Response body (${body.length} chars, showing first 1000):`)
    console.log(truncatedBody)
  } catch {
    console.log('Response body: could not read')
  }

  console.log('='.repeat(60) + '\n')
}

async function checkGWSFlowsHealth(): Promise<{ ok: boolean; detail: string }> {
  const targetUrl = `${GWS_FLOWS_BASE}/demos`
  try {
    const response = await fetch(targetUrl, {
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    })
    if (response.ok || response.status === 404) {
      return { ok: true, detail: `status ${response.status}` }
    }
    await logNetworkDiagnostics(response, targetUrl)
    return { ok: false, detail: `status ${response.status} ${response.statusText}` }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, detail: message }
  }
}

async function waitForGWSFlows(maxAttempts = 5): Promise<void> {
  console.log(`\n🔍 Checking GWS-Flows connection at ${GWS_FLOWS_BASE}...`)

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await checkGWSFlowsHealth()
    if (result.ok) {
      console.log(`✅ GWS-Flows is responding (${result.detail})`)
      return
    }

    if (attempt < maxAttempts) {
      console.log(`⏳ Attempt ${attempt}/${maxAttempts}: ${result.detail} - retrying in 5s...`)
      await new Promise(r => setTimeout(r, 5000))
    } else {
      console.log(`❌ Attempt ${attempt}/${maxAttempts}: ${result.detail}`)
    }
  }

  console.error('\n' + '='.repeat(60))
  console.error(`❌ GWS-Flows is not responding at ${GWS_FLOWS_BASE}`)
  console.error('')
  if (isLocalHost) {
    console.error('Please ensure:')
    console.error('  1. GWS-Flows is running (usually: cd gws-flows && bin/rails s)')
    console.error('  2. ZP is running (usually: cd zp && bin/rails s -p 3000)')
    console.error('')
    console.error('Once both are running, re-run: npm run test:e2e:local')
  } else {
    console.error('The remote demo environment may be temporarily unavailable.')
    console.error('Try again in a few minutes or check the service status.')
  }
  console.error('='.repeat(60) + '\n')

  throw new Error(`GWS-Flows not available at ${GWS_FLOWS_BASE}`)
}

interface E2EState {
  companyId: string
  employeeId: string
  contractorId: string
  locationId: string
  dismissalCompanyId: string
  dismissalFlowToken: string
  terminatedEmployeeId: string
}

interface Employee {
  uuid: string
  first_name: string
  last_name: string
  email?: string
  version?: string
  date_of_birth?: string | null
}

interface Contractor {
  uuid: string
  first_name: string
  last_name: string
}

interface Location {
  uuid: string
  street_1: string
  city: string
  state: string
  filing_address?: boolean
  mailing_address?: boolean
  version?: string
}

interface Compensation {
  uuid: string
  version: string
  rate: string
  payment_unit: string
}

interface Job {
  uuid: string
  title: string
  hire_date: string
  compensations: Compensation[]
}

interface Termination {
  uuid: string
  employee_uuid: string
  effective_date: string
  run_termination_payroll: boolean
}

async function fetchFromApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${GWS_FLOWS_BASE}${endpoint}`)
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

async function postToApi<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${GWS_FLOWS_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API POST failed: ${response.status} ${response.statusText} - ${errorText}`)
  }
  return response.json()
}

async function putToApi<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${GWS_FLOWS_BASE}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API PUT failed: ${response.status} ${response.statusText} - ${errorText}`)
  }
  return response.json()
}

async function getOrCreateLocation(flowToken: string, companyId: string): Promise<string> {
  const endpoint = `/fe_sdk/${flowToken}/v1/companies/${companyId}/locations`
  const locations = await fetchFromApi<Location[]>(endpoint)

  if (locations.length > 0) {
    console.log(`Found existing location: ${locations[0].street_1}, ${locations[0].city}`)
    return locations[0].uuid
  }

  console.log('No locations found, creating one...')
  const newLocation = await postToApi<Location>(endpoint, {
    street_1: '100 Test Street',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    phone_number: '4155551234',
  })
  console.log(`Created location: ${newLocation.street_1}, ${newLocation.city}`)
  return newLocation.uuid
}

async function getOrCreateEmployee(
  flowToken: string,
  companyId: string,
  locationId?: string,
): Promise<string> {
  const endpoint = `/fe_sdk/${flowToken}/v1/companies/${companyId}/employees`
  const employees = await fetchFromApi<Employee[]>(endpoint)

  if (employees.length > 0) {
    console.log(`Found existing employee: ${employees[0].first_name} ${employees[0].last_name}`)
    return employees[0].uuid
  }

  console.log('No employees found, creating one...')
  const timestamp = Date.now()
  const newEmployee = await postToApi<Employee>(endpoint, {
    first_name: 'E2E',
    last_name: `Test${timestamp}`,
    email: `e2e.test.${timestamp}@example.com`,
  })
  console.log(`Created employee: ${newEmployee.first_name} ${newEmployee.last_name}`)

  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const hireDate = threeDaysAgo.toISOString().split('T')[0]

  const base = `/fe_sdk/${flowToken}/v1`
  try {
    console.log(`Setting up employee job (hire date: ${hireDate})...`)
    const job = await postToApi<Job>(`${base}/employees/${newEmployee.uuid}/jobs`, {
      title: 'E2E Test Position',
      hire_date: hireDate,
    })

    if (job.compensations?.length > 0) {
      const comp = job.compensations[0]
      await putToApi<Compensation>(`${base}/compensations/${comp.uuid}`, {
        version: comp.version,
        rate: '60000.00',
        payment_unit: 'Year',
        flsa_status: 'Exempt',
      })
    }
  } catch (error) {
    console.log(`Employee job setup: ${error instanceof Error ? error.message : 'failed'}`)
  }

  try {
    console.log('Setting up employee personal details...')
    const empDetail = await fetchFromApi<Employee>(`${base}/employees/${newEmployee.uuid}`)

    await putToApi<unknown>(`${base}/employees/${newEmployee.uuid}`, {
      version: empDetail.version,
      date_of_birth: '1990-05-15',
      ssn: '123-45-6789',
    })

    await postToApi<unknown>(`${base}/employees/${newEmployee.uuid}/home_addresses`, {
      street_1: '525 20th Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
    })

    if (locationId) {
      await postToApi<unknown>(`${base}/employees/${newEmployee.uuid}/work_addresses`, {
        location_uuid: locationId,
      })
    }

    console.log('Employee personal details configured')
  } catch (error) {
    console.log(`Employee details setup: ${error instanceof Error ? error.message : 'failed'}`)
  }

  return newEmployee.uuid
}

async function getOrCreateContractor(flowToken: string, companyId: string): Promise<string> {
  const endpoint = `/fe_sdk/${flowToken}/v1/companies/${companyId}/contractors`
  const contractors = await fetchFromApi<Contractor[]>(endpoint)

  if (contractors.length > 0) {
    console.log(
      `Found existing contractor: ${contractors[0].first_name} ${contractors[0].last_name}`,
    )
    return contractors[0].uuid
  }

  console.log('No contractors found, creating one...')
  const timestamp = Date.now()
  const newContractor = await postToApi<Contractor>(endpoint, {
    first_name: 'E2E',
    last_name: `Contractor${timestamp}`,
    type: 'Individual',
    wage_type: 'Fixed',
    start_date: new Date().toISOString().split('T')[0],
  })
  console.log(`Created contractor: ${newContractor.first_name} ${newContractor.last_name}`)
  return newContractor.uuid
}

async function logRemainingBlockers(flowToken: string, companyId: string): Promise<void> {
  const base = `/fe_sdk/${flowToken}/v1`
  try {
    const blockers = await fetchFromApi<Array<{ key: string; message: string }>>(
      `${base}/companies/${companyId}/payrolls/blockers`,
    )
    if (blockers.length > 0) {
      console.log(`Remaining payroll blockers (${blockers.length}):`)
      blockers.forEach(b => console.log(`  - ${b.key}: ${b.message}`))
    } else {
      console.log('No payroll blockers remaining')
    }
  } catch {
    console.log('Could not check payroll blockers')
  }
}

export default async function globalSetup() {
  const isRealApi = process.env.E2E_LOCAL === 'true'

  if (!isRealApi) {
    console.log('Skipping global setup - using MSW mocks')
    return
  }

  console.log('\n=== E2E Global Setup ===')
  console.log(`Target: ${GWS_FLOWS_BASE}`)

  await waitForGWSFlows()

  const tokenInfo = await refreshTokenIfNeeded()
  const flowToken = tokenInfo.flowToken
  const companyId = tokenInfo.companyId

  console.log(`Primary Company ID: ${companyId}`)
  console.log(`Primary Flow Token: ${flowToken.slice(0, 10)}...`)

  let locationId = ''
  let employeeId = ''
  let contractorId = ''

  try {
    locationId = await getOrCreateLocation(flowToken, companyId)
  } catch (error) {
    console.warn(`Warning: Could not fetch/create location: ${error}`)
    console.warn('Tests requiring locations may fail')
  }

  try {
    employeeId = await getOrCreateEmployee(flowToken, companyId, locationId)
  } catch (error) {
    console.warn(`Warning: Could not fetch/create employee: ${error}`)
    console.warn('Tests requiring employees may fail')
  }

  try {
    contractorId = await getOrCreateContractor(flowToken, companyId)
  } catch (error) {
    console.warn(`Warning: Could not fetch/create contractor: ${error}`)
    console.warn('Tests requiring contractors may fail')
  }

  let dismissalCompanyId = ''
  let dismissalFlowToken = ''
  let terminatedEmployeeId = ''

  try {
    console.log('\n=== Setting up dismissal company via onboarded demo ===')
    const dismissalDemo = await createFreshDemo('react_sdk_demo_company_onboarded')
    dismissalFlowToken = dismissalDemo.flowToken
    dismissalCompanyId = dismissalDemo.companyId
    console.log(`Dismissal Company ID: ${dismissalCompanyId}`)
    console.log(`Dismissal Flow Token: ${dismissalFlowToken.slice(0, 10)}...`)

    const base = `/fe_sdk/${dismissalFlowToken}/v1`

    console.log('Waiting for demo employee to be ready...')
    let employees: Employee[] = []
    for (let attempt = 1; attempt <= 24; attempt++) {
      try {
        employees = await fetchFromApi<Employee[]>(
          `${base}/companies/${dismissalCompanyId}/employees`,
        )
        if (employees.length > 0) break
      } catch {
        // endpoint may not be ready yet
      }
      if (attempt % 4 === 0) console.log(`  Still waiting for employees... (${attempt * 5}s)`)
      await new Promise(r => setTimeout(r, 5000))
    }

    if (employees.length === 0) {
      throw new Error('No employees found in onboarded demo company')
    }

    console.log(
      `Found ${employees.length} employee(s): ${employees.map(e => `${e.first_name} ${e.last_name}`).join(', ')}`,
    )

    const employeeToTerminate = employees[0]
    console.log(
      `Terminating employee: ${employeeToTerminate.first_name} ${employeeToTerminate.last_name} (${employeeToTerminate.uuid})`,
    )

    const oneMonthFromNow = new Date()
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1)
    const terminationDate = oneMonthFromNow.toISOString().split('T')[0]

    await postToApi<Termination>(`${base}/employees/${employeeToTerminate.uuid}/terminations`, {
      effective_date: terminationDate,
      run_termination_payroll: true,
    })
    terminatedEmployeeId = employeeToTerminate.uuid
    console.log(`Terminated employee (effective: ${terminationDate})`)

    await logRemainingBlockers(dismissalFlowToken, dismissalCompanyId)
    console.log('=== Dismissal company setup complete ===\n')
  } catch (error) {
    throw new Error(`Dismissal company setup failed: ${error}`)
  }

  const state: E2EState = {
    companyId,
    employeeId,
    contractorId,
    locationId,
    dismissalCompanyId,
    dismissalFlowToken,
    terminatedEmployeeId,
  }

  const statePath = resolve(process.cwd(), 'e2e/.e2e-state.json')
  writeFileSync(statePath, JSON.stringify(state, null, 2))
  console.log(`State written to ${statePath}`)
  console.log('=== Setup Complete ===\n')
}
