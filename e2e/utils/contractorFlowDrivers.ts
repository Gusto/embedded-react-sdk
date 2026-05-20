import { expect, type Page } from '@playwright/test'
import type { ScenarioContext } from '../scenario/context'
import { fillDate, generateUniqueEIN, generateUniqueSSN, waitForLoadingComplete } from './helpers'

const LONG_WAIT = 60_000

export interface OnboardIndividualOptions {
  firstName: string
  lastName: string
  street1?: string
  city?: string
  state?: string
  zip?: string
}

export interface OnboardBusinessOptions {
  businessName: string
  street1?: string
  city?: string
  state?: string
  zip?: string
}

async function landOnContractorList(page: Page): Promise<void> {
  await page.goto('/?flow=contractor-onboarding')
  await waitForLoadingComplete(page, LONG_WAIT)
  await expect(page.getByRole('heading', { name: /^contractors$/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
}

async function openAddContractor(page: Page): Promise<void> {
  await page
    .getByRole('button', { name: /add.*contractor|^add$/i })
    .first()
    .click()
  await waitForLoadingComplete(page, LONG_WAIT)
  await expect(page.getByRole('heading', { name: /contractor profile/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
}

async function fillIndividualProfile(page: Page, opts: OnboardIndividualOptions): Promise<void> {
  await page.getByRole('radio', { name: /^individual$/i }).check()
  await page.getByLabel(/first name/i).fill(opts.firstName)
  await page.getByLabel(/last name/i).fill(opts.lastName)
  await page.getByLabel(/social security number/i).fill(generateUniqueSSN())
  await page.getByRole('radio', { name: /^hourly$/i }).check()
  await page.getByLabel(/hourly rate/i).fill('50')

  const today = new Date()
  await fillDate(page, 'Start Date', {
    month: today.getMonth() + 1,
    day: today.getDate(),
    year: today.getFullYear(),
  })

  await page.getByRole('button', { name: /create contractor/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)
}

async function fillBusinessProfile(page: Page, opts: OnboardBusinessOptions): Promise<void> {
  await page.getByRole('radio', { name: /^business$/i }).check()
  await page.getByLabel(/business name/i).fill(opts.businessName)

  await page.getByLabel(/^ein$/i).fill(generateUniqueEIN())

  await page.getByRole('radio', { name: /^fixed$/i }).check()

  const today = new Date()
  await fillDate(page, 'Start Date', {
    month: today.getMonth() + 1,
    day: today.getDate(),
    year: today.getFullYear(),
  })

  await page.getByRole('button', { name: /create contractor/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)
}

async function fillAddressStep(
  page: Page,
  opts: { street1?: string; city?: string; state?: string; zip?: string } = {},
): Promise<void> {
  await expect(
    page
      .getByRole('heading', { name: /^home address$/i })
      .or(page.getByRole('heading', { name: /^business address$/i })),
  ).toBeVisible({ timeout: LONG_WAIT })

  await page.getByLabel(/^street 1$/i).fill(opts.street1 ?? '548 Market St')
  await page.getByLabel(/^city$/i).fill(opts.city ?? 'San Francisco')

  // The State picker renders as a React Aria Select: a trigger button
  // ("Select state... State") opens a listbox of options. getByLabel(/state/i)
  // matches the hidden combobox element which can't be clicked directly, so
  // open the trigger by its accessible button name and then click the option.
  await page
    .getByRole('button', { name: /select state/i })
    .first()
    .click()
  await page
    .getByRole('option', { name: new RegExp(`^${opts.state ?? 'California'}$`, 'i') })
    .first()
    .click()

  await page.getByLabel(/^zip$/i).fill(opts.zip ?? '94104')

  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)
}

async function fillPaymentMethodStep(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: /contractor payment details/i })).toBeVisible({
    timeout: LONG_WAIT,
  })

  // Pick "Check" — no bank fields required, fastest path through the step
  await page.getByRole('radio', { name: /^check$/i }).check()

  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)
}

async function fillNewHireReportStep(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: /file new hire report\??/i })).toBeVisible({
    timeout: LONG_WAIT,
  })

  // Pick "No" — avoids needing to select a Work state and submitting a state filing
  await page
    .getByRole('radio', { name: /no, i have already filed|file the report myself/i })
    .check()

  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)
}

async function submitContractor(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: /^submit contractor$/i })).toBeVisible({
    timeout: LONG_WAIT,
  })

  await page.getByRole('button', { name: /submit and complete onboarding/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)
}

async function assertOnboardingSuccess(page: Page): Promise<void> {
  // Lands back on contractor list with a success alert.
  await expect(page.getByRole('heading', { name: /^contractors$/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: /contractor has been onboarded|successfully onboarded|invitation/i })
      .first(),
  ).toBeVisible({ timeout: LONG_WAIT })
}

export async function runIndividualContractorOnboarding(
  page: Page,
  _scenario: ScenarioContext,
  opts?: Partial<OnboardIndividualOptions>,
): Promise<void> {
  const profile: OnboardIndividualOptions = {
    firstName: opts?.firstName ?? 'Iris',
    lastName: opts?.lastName ?? 'Individual',
    ...opts,
  }

  await landOnContractorList(page)
  await openAddContractor(page)
  await fillIndividualProfile(page, profile)
  await fillAddressStep(page, {
    street1: profile.street1,
    city: profile.city,
    state: profile.state,
    zip: profile.zip,
  })
  await fillPaymentMethodStep(page)
  await fillNewHireReportStep(page)
  await submitContractor(page)
  await assertOnboardingSuccess(page)
}

export async function runBusinessContractorOnboarding(
  page: Page,
  _scenario: ScenarioContext,
  opts?: Partial<OnboardBusinessOptions>,
): Promise<void> {
  const profile: OnboardBusinessOptions = {
    businessName: opts?.businessName ?? `Bright Canary LLC ${Date.now()}`,
    ...opts,
  }

  await landOnContractorList(page)
  await openAddContractor(page)
  await fillBusinessProfile(page, profile)
  await fillAddressStep(page, {
    street1: profile.street1,
    city: profile.city,
    state: profile.state,
    zip: profile.zip,
  })
  await fillPaymentMethodStep(page)
  await fillNewHireReportStep(page)
  await submitContractor(page)
  await assertOnboardingSuccess(page)
}

async function landOnPaymentList(page: Page): Promise<void> {
  await page.goto('/?flow=contractor-payment')
  await waitForLoadingComplete(page, LONG_WAIT)
  await expect(page.getByRole('heading', { name: /^contractor payments$/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
}

async function startNewPayment(page: Page): Promise<void> {
  await page
    .getByRole('button', { name: /^new payment$/i })
    .first()
    .click()
  await waitForLoadingComplete(page, LONG_WAIT)
  await expect(page.getByRole('heading', { name: /^pay contractors$/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
}

async function setPaymentDate(page: Page): Promise<void> {
  const dateInput = page.getByLabel(/^payment date$/i)
  await expect(dateInput).toBeVisible({ timeout: LONG_WAIT })

  // Direct deposit needs a payment date several business days out. Pick +14d
  // to comfortably clear cutoff + weekend rules on the demo backend.
  const future = new Date()
  future.setDate(future.getDate() + 14)
  await dateInput.fill(future.toISOString().slice(0, 10))
}

async function editFirstContractorPayment(page: Page, opts: { hours: string }): Promise<void> {
  await page
    .getByRole('button', { name: /^edit contractor payment$/i })
    .first()
    .click()

  await page
    .getByRole('menuitem', { name: /^edit contractor payment$/i })
    .first()
    .click()

  await expect(page.getByRole('heading', { name: /^edit contractor pay$/i })).toBeVisible({
    timeout: LONG_WAIT,
  })

  // The decorated `payable` contractor is Hourly, so the modal renders Hours.
  // Fixed contractors would render Wage instead — guard for that just in case.
  const hoursField = page.getByLabel(/^hours$/i)
  const wageField = page.getByLabel(/^wage$/i)
  if (await hoursField.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await hoursField.fill(opts.hours)
  } else if (await wageField.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await wageField.fill('500')
  }

  // Force the Check payment method to skip any wire/funding submission blockers
  // tied to direct-deposit-only ACH thresholds on fresh demo companies.
  const checkRadio = page
    .getByRole('group', { name: /payment method/i })
    .getByRole('radio', { name: /^check$/i })
  if (await checkRadio.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await checkRadio.check({ force: true })
  }

  await page.getByRole('button', { name: /^done$/i }).click()
  await expect(page.getByRole('heading', { name: /^edit contractor pay$/i })).toBeHidden({
    timeout: LONG_WAIT,
  })
}

async function reviewAndSubmitPayment(page: Page): Promise<void> {
  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, 2 * LONG_WAIT)

  await expect(page.getByRole('heading', { name: /^review and submit$/i })).toBeVisible({
    timeout: LONG_WAIT,
  })

  await page.getByRole('button', { name: /^submit$/i }).click()
  await waitForLoadingComplete(page, 2 * LONG_WAIT)
}

async function assertPaymentSummary(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: /^payment summary$/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: /payment group created successfully/i })
      .first(),
  ).toBeVisible({ timeout: LONG_WAIT })
}

export async function runContractorPayment(page: Page, _scenario: ScenarioContext): Promise<void> {
  await landOnPaymentList(page)
  await startNewPayment(page)
  await setPaymentDate(page)
  await editFirstContractorPayment(page, { hours: '8' })
  await reviewAndSubmitPayment(page)
  await assertPaymentSummary(page)
}
