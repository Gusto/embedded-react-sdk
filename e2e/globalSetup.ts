import { resolve } from 'path'
import { existsSync, writeFileSync } from 'fs'
import * as dotenv from 'dotenv'
import { refreshTokenIfNeeded } from './scripts/refreshToken'

const localEnvPath = resolve(process.cwd(), 'e2e/local.config.env')
if (existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath })
}

const DEFAULT_GWS_FLOWS_HOST = 'https://flows.gusto-demo.com'
const GWS_FLOWS_BASE = process.env.E2E_GWS_FLOWS_HOST || DEFAULT_GWS_FLOWS_HOST
const isLocalHost = GWS_FLOWS_BASE.includes('localhost')

async function checkGWSFlowsHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${GWS_FLOWS_BASE}/`, {
      signal: AbortSignal.timeout(10000),
    })
    return response.ok || response.status === 404
  } catch {
    return false
  }
}

async function waitForGWSFlows(maxAttempts = 3): Promise<void> {
  console.log(`\n🔍 Checking GWS-Flows connection at ${GWS_FLOWS_BASE}...`)

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const isHealthy = await checkGWSFlowsHealth()
    if (isHealthy) {
      console.log('✅ GWS-Flows is responding')
      return
    }

    if (attempt < maxAttempts) {
      console.log(
        `⏳ Attempt ${attempt}/${maxAttempts}: GWS-Flows not responding, retrying in 2s...`,
      )
      await new Promise(r => setTimeout(r, 2000))
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
}

interface Employee {
  uuid: string
  first_name: string
  last_name: string
  email?: string
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
}

interface ApiError {
  errors?: Array<{ message: string }>
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

async function getOrCreateEmployee(flowToken: string, companyId: string): Promise<string> {
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

  console.log(`Company ID: ${companyId}`)
  console.log(`Flow Token: ${flowToken.slice(0, 10)}...`)

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
    employeeId = await getOrCreateEmployee(flowToken, companyId)
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

  const state: E2EState = {
    companyId,
    employeeId,
    contractorId,
    locationId,
  }

  const statePath = resolve(process.cwd(), 'e2e/.e2e-state.json')
  writeFileSync(statePath, JSON.stringify(state, null, 2))
  console.log(`State written to ${statePath}`)
  console.log('=== Setup Complete ===\n')
}
