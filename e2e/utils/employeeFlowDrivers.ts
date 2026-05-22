import { expect, type Page } from '@playwright/test'
import type { ScenarioContext } from '../scenario/context'
import { fillDate, generateUniqueSSN, waitForLoadingComplete } from './helpers'

/**
 * Drivers that walk the SDK employee flows from the landing screen through
 * to the documented success landmark. Each driver asserts the landmarks it
 * passes through so a regression surfaces inside the driver, not as a
 * cryptic later-step timeout in the spec.
 *
 * Selectors mirror the strings rendered by src/components/Employee/** and
 * were mapped against the i18n Employee.* namespaces. Update them in
 * lockstep if the SDK copy changes.
 */

const LONG_WAIT = 60_000
const DEMO_GWS_FLOWS_HOST = 'https://flows.gusto-demo.com'

async function landOnEmployeeOnboardingHome(page: Page) {
  await page.goto('/?flow=employee-onboarding')
  await waitForLoadingComplete(page, {
    timeout: LONG_WAIT,
    anchor: page.getByRole('heading', { name: /your employees/i }),
  })
}

async function fillBasicsAndHomeAddress(
  page: Page,
  opts: { firstName: string; lastName: string; email: string },
) {
  await expect(page.getByRole('heading', { name: /^basics$/i })).toBeVisible({ timeout: 30_000 })

  await page.getByLabel(/legal first name/i).fill(opts.firstName)
  await page.getByLabel(/legal last name/i).fill(opts.lastName)
  await page.getByLabel(/personal email/i).fill(opts.email)
  await page.getByLabel(/social security number/i).fill(generateUniqueSSN())

  await fillDate(page, 'Date of birth', { month: 4, day: 15, year: 1992 })
  await fillDate(page, 'Start date', { month: 1, day: 15, year: 2025 })

  // The work address combobox is rendered as a button trigger. We need to
  // pick the only available location ("hq") so the SDK can continue.
  const workAddressButton = page.getByRole('button', { name: /work address/i })
  await workAddressButton.click()
  await page.getByRole('listbox').getByRole('option').first().click()

  await page.getByLabel('Street 1').fill('100 Canary Lane')
  await page.getByLabel(/city/i).fill('San Francisco')
  await page.getByLabel('State').click()
  await page.getByRole('listbox').getByRole('option', { name: 'California' }).click()
  const zipField = page.getByLabel(/zip/i)
  await zipField.clear()
  await zipField.fill('94105')

  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)
}

async function fillCompensation(page: Page) {
  await expect(page.getByRole('heading', { name: /^compensation$/i })).toBeVisible({
    timeout: LONG_WAIT,
  })

  const jobTitleField = page.getByRole('textbox', { name: /job title/i })
  const jobTitleValue = await jobTitleField.inputValue().catch(() => '')
  if (!jobTitleValue) {
    await jobTitleField.fill('Software Engineer')
  }

  const employeeTypeButton = page.getByRole('button', { name: /employee type/i })
  const empTypeLabel = (await employeeTypeButton.textContent()) ?? ''
  if (empTypeLabel.includes('Select')) {
    await employeeTypeButton.click()
    // "Paid by the hour" introduces a JobsList step + Workers' comp fields,
    // so pick the salaried option to keep the canary on the single-page path.
    const salariedOption = page.getByRole('listbox').getByRole('option', { name: /salary/i })
    if (await salariedOption.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await salariedOption.click()
    } else {
      await page.getByRole('listbox').getByRole('option').first().click()
    }
  }

  const compAmountField = page.getByRole('textbox', { name: /compensation amount/i })
  const compValue = await compAmountField.inputValue().catch(() => '')
  if (!compValue || compValue === '0.00') {
    await compAmountField.clear()
    await compAmountField.fill('85000')
  }

  const perButton = page.getByRole('button', { name: /per$/i })
  const perLabel = (await perButton.textContent()) ?? ''
  if (!perLabel.includes('Year')) {
    await perButton.click()
    const yearOption = page.getByRole('listbox').getByRole('option', { name: /year/i })
    if (await yearOption.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await yearOption.click()
    } else {
      await page.getByRole('listbox').getByRole('option').first().click()
    }
  }

  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)
}

async function fillFederalTaxes(page: Page) {
  await expect(page.getByRole('heading', { name: /federal tax withholdings/i })).toBeVisible({
    timeout: LONG_WAIT,
  })

  const filingStatusButton = page.getByRole('button', { name: /filing status/i })
  const filingLabel = (await filingStatusButton.textContent()) ?? ''
  if (filingLabel.includes('Select')) {
    await filingStatusButton.click()
    const singleOption = page.getByRole('listbox').getByRole('option', { name: /^single$/i })
    if (await singleOption.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await singleOption.click()
    } else {
      await page.getByRole('listbox').getByRole('option').first().click()
    }
  }

  // Step 2c: Multiple jobs — radio Yes/No, required on onboarding.
  const multipleJobsNo = page.getByRole('radio', { name: /^no$/i })
  if (await multipleJobsNo.isVisible({ timeout: 2_000 }).catch(() => false)) {
    if (!(await multipleJobsNo.isChecked())) {
      await multipleJobsNo.check({ force: true })
    }
  }

  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)
}

async function fillStateTaxes(page: Page) {
  await expect(page.getByRole('heading', { name: /tax requirements/i })).toBeVisible({
    timeout: LONG_WAIT,
  })

  const stateFilingStatus = page.getByRole('button', { name: /filing status/i })
  if (await stateFilingStatus.isVisible({ timeout: 5_000 }).catch(() => false)) {
    const label = (await stateFilingStatus.textContent()) ?? ''
    if (label.includes('Select')) {
      await stateFilingStatus.click()
      await page.getByRole('listbox').getByRole('option').first().click()
    }
  }

  const withholdingField = page.getByRole('textbox', { name: /withholding allowance/i })
  if (await withholdingField.isVisible({ timeout: 5_000 }).catch(() => false)) {
    const value = await withholdingField.inputValue().catch(() => '')
    if (!value) {
      await withholdingField.fill('1')
    }
  }

  // Admin "File a New Hire Report?" radio — answer No so we don't add latency.
  const newHireNo = page.getByRole('radio', { name: /no, i have already filed/i })
  if (await newHireNo.isVisible({ timeout: 2_000 }).catch(() => false)) {
    if (!(await newHireNo.isChecked())) {
      await newHireNo.check({ force: true })
    }
  }

  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)
}

async function selectCheckPayment(page: Page) {
  await expect(page.getByRole('heading', { name: /employee payment details/i })).toBeVisible({
    timeout: LONG_WAIT,
  })

  // Check avoids bank-account setup. The radio renders inside a React Aria
  // overlay; chained role+name keeps us off the decorative <div>.
  const checkRadio = page.getByRole('radio', { name: /^check$/i })
  await checkRadio.check({ force: true })

  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)
}

async function continueThroughDeductions(page: Page) {
  await expect(page.getByRole('heading', { name: /^deductions$/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)
}

/**
 * Drive the full admin Employee Onboarding flow from the employee list,
 * creating a fresh hire and walking every required screen to the
 * "That's it!" summary.
 */
export async function runAdminEmployeeOnboarding(
  page: Page,
  _scenario: ScenarioContext,
  opts: { firstName?: string; lastName?: string } = {},
): Promise<void> {
  const firstName = opts.firstName ?? 'Canary'
  const lastName = opts.lastName ?? `Hire${Date.now()}`
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}+${Date.now()}@example.com`

  await landOnEmployeeOnboardingHome(page)

  // The list shows "Add an employee" (empty state) or "Add another employee"
  // (with rows). Both match /add/i — accept either.
  const addButton = page.getByRole('button', { name: /^add( an| another)? employee$/i }).first()
  await expect(addButton).toBeVisible({ timeout: 30_000 })
  await addButton.click()
  await waitForLoadingComplete(page, LONG_WAIT)

  await fillBasicsAndHomeAddress(page, { firstName, lastName, email })
  await fillCompensation(page)
  await fillFederalTaxes(page)
  await fillStateTaxes(page)
  await selectCheckPayment(page)
  await continueThroughDeductions(page)

  await expect(
    page.getByRole('heading', { name: /that's it! .+ is ready to get paid/i }),
  ).toBeVisible({ timeout: LONG_WAIT })
}

/**
 * Drive the Employee Self-Onboarding flow on a pre-seeded unfinished
 * employee, from the landing "Let's get started" CTA through every required
 * screen to the "You've completed setup!" summary.
 */
export async function runEmployeeSelfOnboarding(
  page: Page,
  scenario: ScenarioContext,
): Promise<void> {
  const employeeId = scenario.employeeIds.selfee
  if (!employeeId) {
    throw new Error('runEmployeeSelfOnboarding requires scenario.employeeIds.selfee')
  }

  await page.goto(`/?flow=employee-self-onboarding&employeeId=${employeeId}`)
  await waitForLoadingComplete(page, LONG_WAIT)

  const landingHeading = page.getByRole('heading', { name: /welcome to/i, level: 2 })
  await expect(landingHeading).toBeVisible({ timeout: 30_000 })

  await page.getByRole('button', { name: /let's get started/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)

  // Profile (Basics + Home address). SSN/DOB/email/home-address are required
  // because Selma was seeded with only name+email+work_address.
  await expect(page.getByRole('heading', { name: /^basics$/i })).toBeVisible({ timeout: 30_000 })

  const ssnField = page.getByLabel(/social security number/i)
  if (await ssnField.isVisible({ timeout: 5_000 }).catch(() => false)) {
    const ssnValue = await ssnField.inputValue().catch(() => '')
    if (!ssnValue) {
      await ssnField.fill(generateUniqueSSN())
    }
  }

  await fillDate(page, 'Date of birth', { month: 6, day: 1, year: 1990 })

  const streetField = page.getByLabel('Street 1')
  const streetValue = await streetField.inputValue().catch(() => '')
  if (!streetValue) {
    await streetField.fill('200 Canary Place')
    await page.getByLabel(/city/i).fill('San Francisco')
    await page.getByLabel('State').click()
    await page.getByRole('listbox').getByRole('option', { name: 'California' }).click()
    const zipField = page.getByLabel(/zip/i)
    await zipField.clear()
    await zipField.fill('94105')
  }

  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)

  await fillFederalTaxes(page)
  // State taxes — self-flow has no admin "File a New Hire Report?" radio but
  // the rest of fillStateTaxes still works (it checks visibility before
  // interacting with anything optional).
  await fillStateTaxes(page)
  await selectCheckPayment(page)

  // Documents list — no docs to sign on a fresh demo company; Continue
  // is enabled immediately because requires_signing is false for all rows
  // (or the list is empty).
  await expect(page.getByRole('heading', { name: /^documents$/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(page.getByRole('heading', { name: /you've completed setup/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
}

async function pickTerminationCandidateId(scenario: ScenarioContext): Promise<string | undefined> {
  if (!scenario.flowToken || !scenario.companyId) return undefined
  const gwsFlowsHost = process.env.E2E_GWS_FLOWS_HOST ?? DEMO_GWS_FLOWS_HOST
  const apiBase = `${gwsFlowsHost}/fe_sdk/${scenario.flowToken}/v1`
  type EmployeeSummary = { uuid: string; onboarded?: boolean; terminated?: boolean }

  const scenarioIds = new Set(Object.values(scenario.employeeIds))

  // react_sdk_demo_company_onboarded seeds ~12 onboarded "philosopher"
  // employees alongside the always-present unfinished placeholder ("Darryl
  // Philbin"). The philosophers can take a few seconds after company creation
  // to appear in the employees list. TerminationFlow requires an employee
  // with a real hire_date — Darryl has no jobs and submitting against him
  // produces "Invalid hire date" — so we explicitly poll until we find a
  // seed employee with onboarded === true.
  for (let attempt = 0; attempt < 10; attempt++) {
    const data: unknown = await fetch(`${apiBase}/companies/${scenario.companyId}/employees`).then(
      r => (r.ok ? r.json() : []),
    )
    const employees: EmployeeSummary[] = Array.isArray(data) ? (data as EmployeeSummary[]) : []
    const onboardedSeed = employees.find(
      e => !scenarioIds.has(e.uuid) && !e.terminated && e.onboarded === true,
    )
    if (onboardedSeed) return onboardedSeed.uuid
    await new Promise(resolve => setTimeout(resolve, 1_500))
  }
  return undefined
}

/**
 * Drive the Employee TerminationFlow against a real (pre-onboarded, non-
 * terminated) seed employee on the demo company, picking the "Regular
 * payroll" option so we stay on the non-payroll terminal summary screen.
 *
 * Returns the employee id used so the spec can include it in assertions if
 * desired.
 */
export async function runEmployeeTermination(
  page: Page,
  scenario: ScenarioContext,
): Promise<string> {
  const employeeId = await pickTerminationCandidateId(scenario)
  if (!employeeId) {
    throw new Error(
      'No non-terminated employee available on the demo company; cannot drive termination flow',
    )
  }

  await page.goto(`/?flow=termination&employeeId=${employeeId}`)
  await waitForLoadingComplete(page, {
    timeout: LONG_WAIT,
    anchor: page.getByRole('heading', { name: /^terminate /i, level: 2 }),
  })

  // Last day of work: must be in the future for "Regular payroll" path
  // (otherwise the backend rejects "last day cannot be in the past").
  const future = new Date()
  future.setDate(future.getDate() + 21)
  await fillDate(page, 'Last day of work', {
    month: future.getMonth() + 1,
    day: future.getDate(),
    year: future.getFullYear(),
  })

  // "Regular payroll" terminates without spawning a dismissal off-cycle —
  // keeps the canary deterministic and on a single terminal screen.
  await page.getByRole('radio', { name: /^regular payroll$/i }).check({ force: true })

  await page.getByRole('button', { name: /^terminate employee$/i }).click()
  await waitForLoadingComplete(page, {
    timeout: LONG_WAIT,
    anchor: page.getByRole('heading', { name: /^termination summary$/i }),
  })
  await expect(page.getByText(/has been successfully terminated/i)).toBeVisible({
    timeout: LONG_WAIT,
  })

  return employeeId
}
