import { expect, type Page } from '@playwright/test'
import type { ScenarioContext } from '../scenario/context'
import { fillDate, waitForLoadingComplete } from './helpers'

interface DateParts {
  month: number
  day: number
  year: number
}

function dateOffsetFromToday(daysAhead: number): DateParts {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  return { month: d.getMonth() + 1, day: d.getDate(), year: d.getFullYear() }
}

/**
 * Drivers that walk the SDK payroll flows from the landing page through to
 * the receipt (or termination-summary, in the case of dismissal). Each driver
 * asserts the landmarks it passes through so a regression surfaces as a failure
 * inside the driver, not as a cryptic later-step timeout in the spec.
 *
 * Selectors mirror the strings rendered by src/components/Payroll/** and were
 * mapped against the i18n Payroll.* namespaces. Update them in lockstep if the
 * SDK copy changes.
 */

const LONG_WAIT = 60_000
const DEMO_GWS_FLOWS_HOST = 'https://flows.gusto-demo.com'

async function landOnPayrollHome(page: Page) {
  await page.goto('/?flow=payroll')
  await waitForLoadingComplete(page, LONG_WAIT)
  await expect(page.getByRole('tab', { name: /run payroll/i })).toBeVisible({ timeout: 30_000 })
}

/**
 * Newly provisioned demo companies start with unsigned company forms (W-4, tax
 * filing authorizations, etc.) and no assigned signatory. The PayrollList
 * landing page renders a hard "Forms Require Signature" blocker in that state
 * and the Edit Payroll screen leaves "Calculate and review" disabled.
 *
 * In real usage a partner drives this through the SDK's AssignSignatory +
 * DocumentSigner UIs. For canary specs we want to bypass that ceremony and
 * leave the spec focused on the payroll-flow it set out to exercise, so we
 * hit the gws-flows API directly to assign a signatory and sign every
 * unsigned form. Idempotent — safe to call when the company is already
 * payroll-ready (the alert won't be present and we no-op).
 */
export async function ensureCompanyIsPayrollReady(
  page: Page,
  scenario: ScenarioContext,
): Promise<void> {
  if (!scenario.flowToken || !scenario.companyId) return

  const blocker = page.getByRole('heading', { name: /forms require signature/i })
  const stillBlocked = await blocker.isVisible({ timeout: 5_000 }).catch(() => false)
  if (!stillBlocked) return

  const gwsFlowsHost = process.env.E2E_GWS_FLOWS_HOST ?? DEMO_GWS_FLOWS_HOST
  const apiBase = `${gwsFlowsHost}/fe_sdk/${scenario.flowToken}/v1`

  type Signatory = { uuid: string }
  const existing = await fetch(`${apiBase}/companies/${scenario.companyId}/signatories`).then(r =>
    r.ok ? (r.json() as Promise<Signatory[]>) : Promise.resolve<Signatory[]>([]),
  )

  if (existing.length === 0) {
    const createResponse = await fetch(`${apiBase}/companies/${scenario.companyId}/signatories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: 'Signer',
        last_name: 'Canary',
        title: 'CEO',
        phone: '4155551234',
        birthday: '1980-01-15',
        email: `signer-canary+${Date.now()}@example.com`,
        ssn: '123456789',
        home_address: {
          street_1: '500 Canary Way',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
        },
      }),
    })
    if (!createResponse.ok) {
      throw new Error(
        `Failed to create signatory (${createResponse.status}): ${await createResponse.text().catch(() => '')}`,
      )
    }
  }

  type CompanyForm = { uuid: string; requires_signing?: boolean }
  const forms = (await fetch(`${apiBase}/companies/${scenario.companyId}/forms`).then(r =>
    r.ok ? r.json() : [],
  )) as CompanyForm[]

  for (const form of forms.filter(f => f.requires_signing)) {
    const signResponse = await fetch(`${apiBase}/forms/${form.uuid}/sign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signature_text: 'Signer Canary',
        agree: true,
        signed_by_ip_address: '127.0.0.1',
      }),
    })
    if (!signResponse.ok) {
      throw new Error(
        `Failed to sign form ${form.uuid} (${signResponse.status}): ${await signResponse.text().catch(() => '')}`,
      )
    }
  }

  await page.reload()
  await waitForLoadingComplete(page, LONG_WAIT)
  await expect(blocker).not.toBeVisible({ timeout: 30_000 })
}

async function calculateAndReachReview(page: Page) {
  await expect(page.getByRole('heading', { name: /edit payroll/i, level: 1 })).toBeVisible({
    timeout: 30_000,
  })
  await page.getByRole('button', { name: /calculate and review/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(page.getByRole('heading', { name: /review payroll/i, level: 1 })).toBeVisible({
    timeout: LONG_WAIT,
  })
}

async function calculateAndSubmit(page: Page) {
  await calculateAndReachReview(page)
  await page.getByRole('button', { name: /^submit$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)

  const submittedAlert = page.getByText(/payroll submitted/i).first()
  const summaryHeading = page.getByRole('heading', { name: /payroll summary/i, level: 1 })
  await expect(submittedAlert.or(summaryHeading).first()).toBeVisible({ timeout: LONG_WAIT })
}

async function openReceipt(page: Page) {
  const viewReceipt = page.getByRole('button', { name: /view payroll receipt/i })
  if (await viewReceipt.isVisible({ timeout: 10_000 }).catch(() => false)) {
    await viewReceipt.click()
    await waitForLoadingComplete(page, LONG_WAIT)
    await expect(page.getByText(/^total$/i).first()).toBeVisible({ timeout: LONG_WAIT })
  }
}

export async function runNextRegularPayroll(page: Page, scenario: ScenarioContext): Promise<void> {
  await landOnPayrollHome(page)
  await ensureCompanyIsPayrollReady(page, scenario)

  const runButton = page.getByRole('button', { name: /^run payroll$/i }).first()
  const reviewButton = page.getByRole('button', { name: /review and submit/i }).first()
  const entry = (await runButton.isVisible({ timeout: 15_000 }).catch(() => false))
    ? runButton
    : reviewButton
  await entry.click()
  await waitForLoadingComplete(page, LONG_WAIT)

  await calculateAndSubmit(page)
  await openReceipt(page)
}

export async function createAndSubmitOffCycleBonus(
  page: Page,
  scenario: ScenarioContext,
  opts: { reason: 'Bonus' | 'Correction payment' },
): Promise<void> {
  await landOnPayrollHome(page)
  await ensureCompanyIsPayrollReady(page, scenario)

  await page.getByRole('button', { name: /run off-cycle payroll/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(page.getByRole('heading', { name: /new off-cycle payroll/i, level: 2 })).toBeVisible(
    { timeout: 30_000 },
  )

  const reasonPattern = opts.reason === 'Bonus' ? /^bonus$/i : /^correction payment$/i
  await page.getByRole('radio', { name: reasonPattern }).check()

  // Correction payrolls correct a past pay period; bonus payrolls pay forward.
  // The SDK validates this server-side ("Start date cannot be in the future for
  // correction payrolls") so we straddle today.
  const periodOffset = opts.reason === 'Bonus' ? 1 : -7
  const paymentOffset = opts.reason === 'Bonus' ? 7 : 7
  await fillDate(page, 'Start date', dateOffsetFromToday(periodOffset))
  await fillDate(page, 'End date', dateOffsetFromToday(periodOffset))
  await fillDate(page, 'Payment date', dateOffsetFromToday(paymentOffset))

  const includeAllSwitch = page.getByRole('switch', {
    name: /include all employees in this payroll/i,
  })
  if (await includeAllSwitch.isVisible({ timeout: 5_000 }).catch(() => false)) {
    if (!(await includeAllSwitch.isChecked())) {
      await includeAllSwitch.click({ force: true })
    }
  }

  await page
    .getByRole('radio', { name: /make all the regular deductions and contributions/i })
    .check()

  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)

  // Corrections on a freshly-provisioned demo company have no historical
  // employee pay to actually correct, so the backend rejects the submit with
  // a generic "There was an error submitting payroll" alert on Review Payroll.
  // The SDK-side flow under test ends at Review Payroll either way, so we
  // stop there for corrections instead of forcing a backend submission that
  // is structurally impossible on a fresh demo. Bonus payrolls still submit
  // (backend accepts $0 forward payrolls) and continue to receipt.
  if (opts.reason === 'Correction payment') {
    await calculateAndReachReview(page)
    return
  }

  await calculateAndSubmit(page)
  await openReceipt(page)
}

/**
 * Change the company's pay schedule frequency via API, then drive the
 * Transition Payroll flow that the SDK surfaces as an alert on the payroll
 * landing page. Real users hit this path when their company moves from
 * (say) every-other-week to weekly — the SDK detects the gap between the old
 * and new schedules and surfaces a "Run Transition Payroll" CTA so workdays
 * in the gap can still be paid.
 *
 * Precondition: at least one regular payroll has been processed on the old
 * schedule so the backend has something to anchor the gap against. The caller
 * is responsible for that (typically via runNextRegularPayroll first).
 */
export async function changeScheduleAndRunTransitionPayroll(
  page: Page,
  scenario: ScenarioContext,
  opts: { newFrequency?: string } = {},
): Promise<void> {
  if (!scenario.flowToken || !scenario.companyId || !scenario.paySchedule?.uuid) {
    throw new Error('changeScheduleAndRunTransitionPayroll requires a provisioned scenario')
  }

  const gwsFlowsHost = process.env.E2E_GWS_FLOWS_HOST ?? DEMO_GWS_FLOWS_HOST
  const apiBase = `${gwsFlowsHost}/fe_sdk/${scenario.flowToken}/v1`

  type ExistingSchedule = { uuid: string; version?: string; frequency?: string }
  const existing = (await fetch(`${apiBase}/companies/${scenario.companyId}/pay_schedules`).then(
    r => (r.ok ? r.json() : []),
  )) as ExistingSchedule[]
  const current = existing.find(s => s.uuid === scenario.paySchedule?.uuid) ?? existing[0]
  if (!current) {
    throw new Error('No pay schedule found on company; cannot trigger a transition')
  }

  const newFrequency = opts.newFrequency ?? 'Every week'
  if (current.frequency !== newFrequency) {
    // The backend rejects an anchor_end_of_pay_period that falls before the
    // end of the schedule's last processed period (error_key:
    // anchor_end_of_pay_period, "New pay period must end on or after MM/DD").
    // After runNextRegularPayroll has consumed the current open biweekly
    // period, the next legal anchor lands ~2-3 weeks out, not today+7. We
    // push to today+35 so the new anchor clears the just-processed period
    // plus a margin for any biweekly/semi-monthly cadence variations.
    const anchor = new Date()
    anchor.setDate(anchor.getDate() + 35)
    const updateResponse = await fetch(
      `${apiBase}/companies/${scenario.companyId}/pay_schedules/${current.uuid}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frequency: newFrequency,
          anchor_pay_date: anchor.toISOString().slice(0, 10),
          anchor_end_of_pay_period: anchor.toISOString().slice(0, 10),
          ...(current.version ? { version: current.version } : {}),
        }),
      },
    )
    if (!updateResponse.ok) {
      throw new Error(
        `Failed to change pay schedule frequency (${updateResponse.status}): ${await updateResponse.text().catch(() => '')}`,
      )
    }
  }

  await landOnPayrollHome(page)
  await ensureCompanyIsPayrollReady(page, scenario)
  await page.reload()
  await waitForLoadingComplete(page, LONG_WAIT)

  await page.getByRole('button', { name: /run transition payroll/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)

  // The SDK auto-skips the Transition Creation screen and lands directly on
  // Edit Payroll when the backend has already created an unprocessed transition
  // payroll for this period (it usually has, post-schedule-change). Drive
  // creation only if we actually land on it.
  const creationHeading = page.getByRole('heading', { name: /^transition payroll$/i, level: 2 })
  if (await creationHeading.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await page
      .getByRole('radio', { name: /make all the regular deductions and contributions/i })
      .check()
    await page.getByRole('button', { name: /^continue$/i }).click()
    await waitForLoadingComplete(page, LONG_WAIT)
  }

  await calculateAndSubmit(page)
  await openReceipt(page)
}

/**
 * Pick an employee from the demo company who is actually onboarded (and
 * therefore eligible for termination + dismissal payroll). The scenario's
 * decorator-added employees (Alice/Bob/Carol on the canary) fail their
 * `onboarding_status -> completed` step because they don't have SSN/DOB/W-4/
 * state-tax — so we fall back to the demo's seed employees, which are
 * already onboarded.
 */
async function pickOnboardedEmployeeId(scenario: ScenarioContext): Promise<string | undefined> {
  if (!scenario.flowToken || !scenario.companyId) return undefined
  const gwsFlowsHost = process.env.E2E_GWS_FLOWS_HOST ?? DEMO_GWS_FLOWS_HOST
  const apiBase = `${gwsFlowsHost}/fe_sdk/${scenario.flowToken}/v1`

  type EmployeeSummary = {
    uuid: string
    onboarded?: boolean
    onboarding_status?: string
    terminated?: boolean
  }
  const employees = (await fetch(`${apiBase}/companies/${scenario.companyId}/employees`).then(r =>
    r.ok ? r.json() : [],
  )) as EmployeeSummary[]

  const scenarioIds = new Set(Object.values(scenario.employeeIds))
  return employees.find(
    e =>
      !scenarioIds.has(e.uuid) &&
      !e.terminated &&
      (e.onboarded === true || e.onboarding_status === 'onboarding_completed'),
  )?.uuid
}

export async function terminateAndRunDismissalPayroll(
  page: Page,
  scenario: ScenarioContext,
  opts: {
    employeeId?: string
    lastDayOfWork: { month: number; day: number; year: number }
  },
): Promise<void> {
  await landOnPayrollHome(page)
  await ensureCompanyIsPayrollReady(page, scenario)

  const targetEmployeeId = opts.employeeId ?? (await pickOnboardedEmployeeId(scenario))
  if (!targetEmployeeId) {
    throw new Error(
      'No onboarded employee found to terminate; scenario decorations may not have onboarded any employees',
    )
  }

  await page.goto(`/?flow=termination&employeeId=${encodeURIComponent(targetEmployeeId)}`)
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(page.getByRole('heading', { name: /^terminate /i, level: 2 })).toBeVisible({
    timeout: 30_000,
  })

  await fillDate(page, 'Last day of work', opts.lastDayOfWork)

  await page.getByLabel(/^dismissal payroll$/i).check()
  await page.getByRole('button', { name: /terminate employee/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(page.getByRole('heading', { name: /termination summary/i, level: 2 })).toBeVisible({
    timeout: LONG_WAIT,
  })

  await page.getByRole('button', { name: /run termination payroll/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)

  const payPeriodSelect = page.getByLabel(/^pay period$/i)
  if (await payPeriodSelect.isVisible({ timeout: 10_000 }).catch(() => false)) {
    await payPeriodSelect.click()
    await page.getByRole('option').first().click()
    await page.getByRole('button', { name: /^continue$/i }).click()
    await waitForLoadingComplete(page, LONG_WAIT)
  }

  await calculateAndSubmit(page)
  await openReceipt(page)
}
