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

interface BankAccount {
  uuid: string
  routing_number?: string
  hidden_account_number?: string
  verification_status: string
}

interface PaySchedule {
  uuid: string
  frequency: string
}

interface Signatory {
  uuid: string
  first_name: string
  last_name: string
}

interface CompanyForm {
  uuid: string
  name: string
  requires_signing: boolean
}

interface FederalTax {
  version: string
  has_ein: boolean
  ein: string
  tax_payer_type: string | null
}

interface TaxRequirement {
  state: string
  questions: Array<{
    key: string
    label: string
    is_required: boolean
    answers: Array<{ valid_from: string; valid_up_to: string | null; value: unknown }>
  }>
}

interface StateTaxState {
  state: string
  questions: Array<{
    key: string
    label: string
    answers: Array<{ valid_from: string; valid_up_to: string | null; value: unknown }>
  }>
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

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const hireDate = thirtyDaysAgo.toISOString().split('T')[0]

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

async function ensureCompanyAddress(flowToken: string, companyId: string): Promise<void> {
  const base = `/fe_sdk/${flowToken}/v1`
  const locations = await fetchFromApi<Location[]>(`${base}/companies/${companyId}/locations`)

  const hasFilingAddress = locations.some(loc => loc.filing_address)
  if (hasFilingAddress) {
    console.log('Company already has a filing address')
    return
  }

  const addressData = {
    street_1: '525 20th Street',
    city: 'San Francisco',
    state: 'CA',
    zip: '94107',
    phone_number: '4155551234',
    filing_address: true,
    mailing_address: true,
  }

  if (locations.length === 0) {
    console.log('Creating company filing address...')
    await postToApi<Location>(`${base}/companies/${companyId}/locations`, addressData)
  } else {
    console.log('Updating existing location to be filing address...')
    const existingLoc = locations[0]
    await putToApi<Location>(`${base}/locations/${existingLoc.uuid}`, {
      ...addressData,
      version: existingLoc.version,
    })
  }
  console.log('Company filing address configured')
}

async function ensureFederalTaxDetails(flowToken: string, companyId: string): Promise<void> {
  const base = `/fe_sdk/${flowToken}/v1`
  const fedTax = await fetchFromApi<FederalTax>(
    `${base}/companies/${companyId}/federal_tax_details`,
  )

  if (fedTax.has_ein && fedTax.tax_payer_type) {
    console.log('Federal tax details already configured')
    return
  }

  const randomEin = `${String(Math.floor(Math.random() * 90) + 10)}-${String(Math.floor(Math.random() * 9000000) + 1000000)}`
  console.log(`Updating federal tax details (EIN: ${randomEin})...`)
  await putToApi<FederalTax>(`${base}/companies/${companyId}/federal_tax_details`, {
    version: fedTax.version,
    ein: randomEin,
    tax_payer_type: 'C-Corporation',
    legal_name: 'E2E Test Company Inc',
    filing_form: '941',
  })
  console.log('Federal tax details configured')
}

async function ensureIndustrySelection(flowToken: string, companyId: string): Promise<void> {
  const base = `/fe_sdk/${flowToken}/v1`
  try {
    await putToApi<unknown>(`${base}/companies/${companyId}/industry_selection`, {
      naics_code: '541511',
    })
    console.log('Industry selection configured (Custom Computer Programming Services)')
  } catch {
    console.log('Industry selection already configured or not available')
  }
}

async function ensureSignatory(flowToken: string, companyId: string): Promise<void> {
  const base = `/fe_sdk/${flowToken}/v1`
  try {
    const signatories = await fetchFromApi<Signatory[]>(
      `${base}/companies/${companyId}/signatories`,
    )
    if (signatories.length > 0) {
      console.log(
        `Found existing signatory: ${signatories[0].first_name} ${signatories[0].last_name}`,
      )
      return
    }
  } catch {
    // endpoint may not be accessible
  }

  try {
    console.log('Creating company signatory...')
    await postToApi<Signatory>(`${base}/companies/${companyId}/signatories`, {
      first_name: 'E2E',
      last_name: 'Signatory',
      title: 'CEO',
      email: `signatory.${Date.now()}@example.com`,
      phone: '4155551234',
      birthday: '1980-01-15',
      ssn: '123-45-6789',
      home_address: {
        street_1: '525 20th Street',
        city: 'San Francisco',
        state: 'CA',
        zip: '94107',
      },
    })
    console.log('Signatory created')
  } catch (error) {
    console.log(`Signatory creation: ${error instanceof Error ? error.message : 'failed'}`)
  }
}

async function ensureBankAccount(flowToken: string, companyId: string): Promise<void> {
  const base = `/fe_sdk/${flowToken}/v1`
  try {
    const accounts = await fetchFromApi<BankAccount[]>(
      `${base}/companies/${companyId}/bank_accounts`,
    )
    if (accounts.length > 0) {
      console.log(`Found existing bank account: ${accounts[0].hidden_account_number}`)
      return
    }
  } catch {
    // endpoint may not be accessible
  }

  try {
    console.log('Creating company bank account...')
    await postToApi<BankAccount>(`${base}/companies/${companyId}/bank_accounts`, {
      routing_number: '110000000',
      account_number: '123456789',
      account_type: 'Checking',
    })
    console.log('Bank account created')
  } catch (error) {
    console.log(`Bank account creation: ${error instanceof Error ? error.message : 'failed'}`)
  }
}

async function ensureStateTaxSetup(flowToken: string, companyId: string): Promise<void> {
  const base = `/fe_sdk/${flowToken}/v1`
  try {
    const stateTaxReqs = await fetchFromApi<TaxRequirement[]>(
      `${base}/companies/${companyId}/tax_requirements`,
    )
    if (Array.isArray(stateTaxReqs) && stateTaxReqs.length > 0) {
      console.log(`Found ${stateTaxReqs.length} state tax requirement(s)`)
      for (const req of stateTaxReqs) {
        try {
          const response = await fetch(
            `${GWS_FLOWS_BASE}${base}/companies/${companyId}/tax_requirements/${req.state}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(req),
            },
          )
          console.log(`State tax ${req.state}: ${response.status} ${response.statusText}`)
        } catch (error) {
          console.log(
            `State tax req ${req.state}: ${error instanceof Error ? error.message : 'failed'}`,
          )
        }
      }
    }
  } catch {
    console.log('State tax requirements endpoint not accessible (may be OK)')
  }
}

async function verifyBankAccount(flowToken: string, companyId: string): Promise<void> {
  const base = `/fe_sdk/${flowToken}/v1`
  try {
    const accounts = await fetchFromApi<BankAccount[]>(
      `${base}/companies/${companyId}/bank_accounts`,
    )
    const unverified = accounts.find(a => a.verification_status !== 'verified')
    if (!unverified) {
      console.log('Bank account already verified')
      return
    }

    console.log('Sending test deposits for bank verification...')
    const deposits = await postToApi<{ deposit_1?: number; deposit_2?: number }>(
      `${base}/companies/${companyId}/bank_accounts/${unverified.uuid}/send_test_deposits`,
      {},
    )
    console.log(`Test deposits: ${deposits.deposit_1}, ${deposits.deposit_2}`)

    if (deposits.deposit_1 && deposits.deposit_2) {
      console.log('Verifying bank account with test deposit amounts...')
      await putToApi<unknown>(
        `${base}/companies/${companyId}/bank_accounts/${unverified.uuid}/verify`,
        {
          deposit_1: deposits.deposit_1,
          deposit_2: deposits.deposit_2,
        },
      )
      console.log('Bank account verified')
    }
  } catch (error) {
    console.log(
      `Bank verification: ${error instanceof Error ? error.message : 'not available in demo'}`,
    )
  }
}

async function finishOnboardingAndApprove(flowToken: string, companyId: string): Promise<void> {
  const base = `/fe_sdk/${flowToken}/v1`
  try {
    console.log('Finishing company onboarding...')
    await putToApi<unknown>(`${base}/companies/${companyId}/finish_onboarding`, {})
    console.log('Company onboarding finished')
  } catch (error) {
    console.log(`Finish onboarding: ${error instanceof Error ? error.message : 'failed'}`)
  }

  try {
    console.log('Approving company...')
    await putToApi<unknown>(`${base}/companies/${companyId}/approve`, {})
    console.log('Company approved')
  } catch (error) {
    console.log(`Approve company: ${error instanceof Error ? error.message : 'failed'}`)
  }
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

async function signCompanyForms(flowToken: string, companyId: string): Promise<void> {
  const base = `/fe_sdk/${flowToken}/v1`
  try {
    const forms = await fetchFromApi<CompanyForm[]>(`${base}/companies/${companyId}/forms`)
    const unsignedForms = forms.filter(f => f.requires_signing)
    if (unsignedForms.length === 0) {
      console.log('All company forms already signed')
      return
    }

    for (const form of unsignedForms) {
      try {
        await putToApi<unknown>(`${base}/forms/${form.uuid}/sign`, {
          agree: true,
          signature_text: 'E2E Signatory',
          signed_by_ip_address: '127.0.0.1',
        })
        console.log(`Signed form: ${form.name}`)
      } catch (error) {
        console.log(
          `Could not sign form ${form.name}: ${error instanceof Error ? error.message : 'failed'}`,
        )
      }
    }
  } catch {
    console.log('Company forms endpoint not accessible')
  }
}

async function setupEmployeeFederalTaxes(flowToken: string, employeeId: string): Promise<void> {
  const base = `/fe_sdk/${flowToken}/v1`
  console.log('Setting up employee federal taxes...')
  const fedTaxes = await fetchFromApi<FederalTax>(`${base}/employees/${employeeId}/federal_taxes`)
  await putToApi<unknown>(`${base}/employees/${employeeId}/federal_taxes`, {
    version: fedTaxes.version,
    filing_status: 'Single',
    w4_data_type: 'rev_2020_w4',
    extra_withholding: '0.0',
    two_jobs: false,
    dependents_amount: '0.0',
    other_income: '0.0',
    deductions: '0.0',
  })
  console.log('Employee federal taxes configured')
}

async function setupEmployeeStateTaxes(flowToken: string, employeeId: string): Promise<void> {
  const base = `/fe_sdk/${flowToken}/v1`
  console.log('Setting up employee state taxes...')
  const stateTaxes = await fetchFromApi<StateTaxState[]>(
    `${base}/employees/${employeeId}/state_taxes`,
  )

  if (!Array.isArray(stateTaxes) || stateTaxes.length === 0) {
    console.log('  No state tax entries found')
    return
  }

  const defaultAnswer = (value: unknown) => ({
    valid_from: '2010-01-01',
    valid_up_to: null,
    value,
  })

  const STATE_TAX_DEFAULTS: Record<string, unknown> = {
    filing_status: 'S',
    withholding_allowance: 1,
    additional_withholding: '0.0',
    file_new_hire_report: false,
  }

  for (const st of stateTaxes) {
    console.log(`  State ${st.state}: ${st.questions.length} questions`)
    for (const q of st.questions) {
      const hasAnswer =
        q.answers?.length > 0 && q.answers[0].value !== null && q.answers[0].value !== ''
      const defaultValue = STATE_TAX_DEFAULTS[q.key]
      if (!hasAnswer && defaultValue !== undefined) {
        console.log(`    Setting ${q.key} = ${JSON.stringify(defaultValue)}`)
        q.answers = [defaultAnswer(defaultValue)]
      }
    }
  }

  await putToApi<unknown>(`${base}/employees/${employeeId}/state_taxes`, {
    states: stateTaxes,
  })
  console.log('Employee state taxes confirmed')
}

async function completeEmployeeOnboardingStatus(
  flowToken: string,
  employeeId: string,
): Promise<void> {
  const base = `/fe_sdk/${flowToken}/v1`
  const onboardingStatus = await fetchFromApi<{
    onboarding_status: string
    onboarding_steps: Array<{ title: string; required: boolean; completed: boolean }>
  }>(`${base}/employees/${employeeId}/onboarding_status`)
  console.log(`Employee onboarding status: ${onboardingStatus.onboarding_status}`)

  if (onboardingStatus.onboarding_status === 'onboarding_completed') {
    console.log('Employee already onboarded, skipping')
    return
  }

  const incompleteSteps = onboardingStatus.onboarding_steps?.filter(s => s.required && !s.completed)
  if (incompleteSteps?.length > 0) {
    console.log('Incomplete required steps:')
    incompleteSteps.forEach(s => console.log(`  - ${s.title}`))
  }

  await putToApi<unknown>(`${base}/employees/${employeeId}/onboarding_status`, {
    onboarding_status: 'onboarding_completed',
  })
  console.log('Employee onboarding completed')
}

async function onboardEmployee(flowToken: string, employeeId: string): Promise<void> {
  try {
    await setupEmployeeFederalTaxes(flowToken, employeeId)
  } catch (error) {
    console.log(`Employee federal taxes: ${error instanceof Error ? error.message : 'failed'}`)
  }

  try {
    await setupEmployeeStateTaxes(flowToken, employeeId)
  } catch (error) {
    console.log(`Employee state taxes: ${error instanceof Error ? error.message : 'failed'}`)
  }

  try {
    await completeEmployeeOnboardingStatus(flowToken, employeeId)
  } catch (error) {
    console.log(`Employee onboarding: ${error instanceof Error ? error.message : 'failed'}`)
  }
}

async function setupCompanyForPayroll(flowToken: string, companyId: string): Promise<void> {
  console.log('\n--- Setting up company for payroll ---')
  await ensureCompanyAddress(flowToken, companyId)
  await ensureFederalTaxDetails(flowToken, companyId)
  await ensureIndustrySelection(flowToken, companyId)
  await ensureStateTaxSetup(flowToken, companyId)
  await ensureSignatory(flowToken, companyId)
  await ensureBankAccount(flowToken, companyId)
  await verifyBankAccount(flowToken, companyId)
  await ensurePaySchedule(flowToken, companyId)
  await signCompanyForms(flowToken, companyId)
  await finishOnboardingAndApprove(flowToken, companyId)
  await logRemainingBlockers(flowToken, companyId)
  console.log('--- Company setup complete ---\n')
}

async function skipPayrolls(
  flowToken: string,
  companyId: string,
  payrollType: string,
): Promise<number> {
  const skipEndpoint = `/fe_sdk/${flowToken}/v1/companies/${companyId}/payrolls/skip`
  let skippedCount = 0
  for (let i = 0; i < 30; i++) {
    try {
      await postToApi<unknown>(skipEndpoint, { payroll_type: payrollType })
      skippedCount++
    } catch {
      break
    }
  }
  return skippedCount
}

async function ensurePaySchedule(flowToken: string, companyId: string): Promise<void> {
  const endpoint = `/fe_sdk/${flowToken}/v1/companies/${companyId}/pay_schedules`
  const schedules = await fetchFromApi<PaySchedule[]>(endpoint)

  if (schedules.length > 0) {
    console.log(`Found existing pay schedule: ${schedules[0].uuid}`)
  } else {
    const anchorEnd = new Date()
    anchorEnd.setDate(anchorEnd.getDate() - 30)
    const anchorEndOfPayPeriod = anchorEnd.toISOString().split('T')[0]

    const payDate = new Date()
    payDate.setDate(payDate.getDate() - 25)
    const anchorPayDate = payDate.toISOString().split('T')[0]

    console.log(
      `Creating pay schedule (period end: ${anchorEndOfPayPeriod}, pay date: ${anchorPayDate})...`,
    )
    await postToApi<PaySchedule>(endpoint, {
      frequency: 'Every other week',
      anchor_pay_date: anchorPayDate,
      anchor_end_of_pay_period: anchorEndOfPayPeriod,
    })
    console.log('Pay schedule created and auto-assigned to all employees')
  }

  const transitionSkipped = await skipPayrolls(
    flowToken,
    companyId,
    'Transition from old pay schedule',
  )
  if (transitionSkipped > 0) console.log(`Skipped ${transitionSkipped} transition payroll(s)`)

  const regularSkipped = await skipPayrolls(flowToken, companyId, 'Regular')
  if (regularSkipped > 0) console.log(`Skipped ${regularSkipped} regular payroll(s)`)
}

async function createTerminatedEmployee(
  flowToken: string,
  companyId: string,
  locationId: string,
): Promise<string> {
  const base = `/fe_sdk/${flowToken}/v1`
  const timestamp = Date.now()

  console.log('\n--- Creating terminated employee (matching GWS-Flows sequence) ---')

  const ssnSuffix = String(timestamp).slice(-4)
  const testSSN = `123-45-${ssnSuffix}`

  console.log('Step 1/8: Creating employee with personal details...')
  const employee = await postToApi<Employee>(`${base}/companies/${companyId}/employees`, {
    first_name: 'Dismissed',
    last_name: `Employee${timestamp}`,
    email: `dismissed.${timestamp}@example.com`,
    ssn: testSSN,
    date_of_birth: '1999-06-15',
  })
  console.log(`Created: ${employee.first_name} ${employee.last_name} (${employee.uuid})`)

  console.log('Step 2/8: Creating work address...')
  const fortyFiveDaysAgo = new Date()
  fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45)
  const effectiveDateWorkAddress = fortyFiveDaysAgo.toISOString().split('T')[0]
  await postToApi<unknown>(`${base}/employees/${employee.uuid}/work_addresses`, {
    location_uuid: locationId,
    effective_date: effectiveDateWorkAddress,
  })

  console.log('Step 3/8: Creating job...')
  const hireDate = effectiveDateWorkAddress
  const job = await postToApi<Job>(`${base}/employees/${employee.uuid}/jobs`, {
    title: 'E2E Dismissal Position',
    hire_date: hireDate,
  })

  console.log('Step 4/8: Updating compensation (hourly $50/hr)...')
  if (job.compensations?.length > 0) {
    const comp = job.compensations[0]
    await putToApi<Compensation>(`${base}/compensations/${comp.uuid}`, {
      version: comp.version,
      rate: '50.00',
      payment_unit: 'Hour',
      flsa_status: 'Exempt',
    })
  }

  console.log('Step 5/8: Creating home address...')
  await postToApi<unknown>(`${base}/employees/${employee.uuid}/home_addresses`, {
    street_1: '500 3rd Street',
    street_2: '',
    city: 'San Francisco',
    state: 'CA',
    zip: '94107',
  })

  console.log('Step 6/8: Setting up federal taxes...')
  await setupEmployeeFederalTaxes(flowToken, employee.uuid)

  console.log('Step 7/8: Setting up state taxes...')
  await setupEmployeeStateTaxes(flowToken, employee.uuid)

  console.log('Step 8/8: Completing employee onboarding...')
  await completeEmployeeOnboardingStatus(flowToken, employee.uuid)

  const oneMonthFromNow = new Date()
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1)
  const terminationDate = oneMonthFromNow.toISOString().split('T')[0]

  console.log(`Terminating employee (effective: ${terminationDate})...`)
  await postToApi<Termination>(`${base}/employees/${employee.uuid}/terminations`, {
    effective_date: terminationDate,
    run_termination_payroll: true,
  })
  console.log(`Terminated employee: ${employee.uuid}`)

  await logRemainingBlockers(flowToken, companyId)
  console.log('--- Terminated employee setup complete ---\n')
  return employee.uuid
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
    console.log('\n=== Setting up separate company for dismissal tests ===')
    const dismissalDemo = await createFreshDemo()
    dismissalFlowToken = dismissalDemo.flowToken
    dismissalCompanyId = dismissalDemo.companyId
    console.log(`Dismissal Company ID: ${dismissalCompanyId}`)
    console.log(`Dismissal Flow Token: ${dismissalFlowToken.slice(0, 10)}...`)

    const dismissalLocationId = await getOrCreateLocation(dismissalFlowToken, dismissalCompanyId)
    const dismissalEmployeeId = await getOrCreateEmployee(
      dismissalFlowToken,
      dismissalCompanyId,
      dismissalLocationId,
    )

    await setupCompanyForPayroll(dismissalFlowToken, dismissalCompanyId)
    if (dismissalEmployeeId) {
      await onboardEmployee(dismissalFlowToken, dismissalEmployeeId)
    }
    terminatedEmployeeId = await createTerminatedEmployee(
      dismissalFlowToken,
      dismissalCompanyId,
      dismissalLocationId,
    )

    const postTerminationTransitionSkipped = await skipPayrolls(
      dismissalFlowToken,
      dismissalCompanyId,
      'Transition from old pay schedule',
    )
    if (postTerminationTransitionSkipped > 0)
      console.log(
        `Skipped ${postTerminationTransitionSkipped} post-termination transition payroll(s)`,
      )

    const postTerminationRegularSkipped = await skipPayrolls(
      dismissalFlowToken,
      dismissalCompanyId,
      'Regular',
    )
    if (postTerminationRegularSkipped > 0)
      console.log(`Skipped ${postTerminationRegularSkipped} post-termination regular payroll(s)`)

    await logRemainingBlockers(dismissalFlowToken, dismissalCompanyId)
    console.log('=== Dismissal company setup complete ===\n')
  } catch (error) {
    console.warn(`Warning: Dismissal company setup failed: ${error}`)
    console.warn('Dismissal tests may fail')
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
