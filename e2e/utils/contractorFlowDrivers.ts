import { expect, type Page } from '@playwright/test'
import type { ScenarioContext } from '../scenario/context'
import {
  fillDate,
  generateUniqueEIN,
  generateUniqueSSN,
  nextBusinessDay,
  waitForLoadingComplete,
} from './helpers'

const LONG_WAIT = 90_000

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

  const ssnField = page.getByLabel(/social security number/i)
  if (await ssnField.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await ssnField.fill(generateUniqueSSN())
  }

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

  const einField = page.getByLabel(/^ein$/i)
  if (await einField.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await einField.fill(generateUniqueEIN())
  }

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
      .or(page.getByRole('heading', { name: /^business address$/i }))
      .first(),
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
  const dateGroup = page.getByRole('group', { name: /^payment date$/i })
  await expect(dateGroup).toBeVisible({ timeout: LONG_WAIT })

  // Direct deposit needs a payment date several business days out. Pick the
  // next business day at least 21d ahead — generous so we clear cutoff,
  // weekends, ALL US federal holidays in the next 3 weeks, AND the demo
  // backend's own "next valid date" calculation which sometimes disagrees
  // with ours.
  const targetDate = nextBusinessDay(new Date(), 21)

  // The SDK's CreatePayment component has a useEffect that recomputes the
  // initial payment date once `paymentSpeed` resolves from the API and
  // overwrites whatever the user typed before that effect fired. Setting
  // the date once, then waiting on the read-back, lets us catch the
  // overwrite case and re-fill: poll the spinbutton values until they match
  // our target, retrying the fill if the SDK has overwritten it.
  const targetMonth = targetDate.getUTCMonth() + 1
  const targetDay = targetDate.getUTCDate()
  const targetYear = targetDate.getUTCFullYear()

  for (let attempt = 0; attempt < 5; attempt++) {
    await fillDate(page, 'Payment date', {
      month: targetMonth,
      day: targetDay,
      year: targetYear,
    })
    await page.waitForTimeout(500)

    const monthValue = await dateGroup.getByRole('spinbutton', { name: /^month/i }).textContent()
    const dayValue = await dateGroup.getByRole('spinbutton', { name: /^day/i }).textContent()
    const yearValue = await dateGroup.getByRole('spinbutton', { name: /^year/i }).textContent()

    if (
      monthValue === String(targetMonth) &&
      dayValue === String(targetDay) &&
      yearValue === String(targetYear)
    ) {
      return
    }
  }
  throw new Error(
    `Payment date input did not stick at ${targetYear}-${targetMonth}-${targetDay} after 5 fill attempts; SDK is overwriting via useEffect race`,
  )
}

async function editFirstContractorPayment(page: Page, opts: { hours: string }): Promise<void> {
  // Fast-fail the "no payable contractors" empty state. Without this, the
  // edit-button click below would silently sit at the spec's 8-min test
  // timeout waiting for a row that will never appear (e.g. when the demo
  // company was just provisioned and no contractor has completed onboarding
  // yet).
  const emptyState = page.getByText(/no contractors available for payment/i).first()
  if (await emptyState.isVisible({ timeout: 3_000 }).catch(() => false)) {
    throw new Error(
      'Pay contractors screen shows "No contractors available for payment" — demo company has no payment-ready contractors. ' +
        'Either the base demo did not seed payable contractors or the scenario decoration did not complete onboarding.',
    )
  }

  // Prefer a row whose payment method is already Check. Direct-deposit rows
  // impose an ACH cutoff constraint on the payment date that races the SDK's
  // own date-recompute useEffect; if we pay only check-method rows the
  // backend's date validation tolerates a wider window. Falls back to the
  // first row if no check-method row exists (then we'll try to switch via
  // the radio inside the edit modal).
  await expect(page.getByRole('grid', { name: /hours and payments/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
  const checkMethodRow = page
    .getByRole('row')
    .filter({ has: page.getByRole('gridcell', { name: /^check$/i }) })
    .first()
  const editButton = (await checkMethodRow.isVisible({ timeout: 3_000 }).catch(() => false))
    ? checkMethodRow.getByRole('button', { name: /^edit contractor payment$/i })
    : page.getByRole('button', { name: /^edit contractor payment$/i }).first()
  await expect(editButton).toBeVisible({ timeout: LONG_WAIT })
  await editButton.click()

  await page
    .getByRole('menuitem', { name: /^edit contractor payment$/i })
    .first()
    .click()

  await expect(page.getByRole('heading', { name: /^edit contractor pay$/i })).toBeVisible({
    timeout: LONG_WAIT,
  })

  // Demo's pre-existing payable contractors include both Hourly and Fixed
  // wage types. The first row could be either, so handle whichever field
  // the edit modal renders for the contractor we're paying.
  const hoursField = page.getByLabel(/^hours$/i)
  const wageField = page.getByLabel(/^wage$/i)
  if (await hoursField.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await hoursField.fill(opts.hours)
  } else if (await wageField.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await wageField.fill('500')
  }

  // Force the Check payment method to skip ACH cutoff validation. This is
  // belt-and-suspenders alongside the row-selection above: if the picked
  // row was already Check this is a no-op; if it was Direct Deposit (fallback
  // case) this switches it. Idempotent and harmless either way.
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
  await waitForLoadingComplete(page, {
    timeout: 2 * LONG_WAIT,
    anchor: page.getByRole('heading', { name: /^review and submit$/i }),
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

  // Edit the first row first, BEFORE setting the payment date. The SDK has a
  // useEffect that overwrites the date input once `paymentSpeed` resolves
  // from the API; opening + closing the edit modal gives that race time to
  // settle before we lock in the date. setPaymentDate then re-fills with
  // retry-on-overwrite to belt-and-suspenders the still-possible second
  // resolution race.
  await editFirstContractorPayment(page, { hours: '8' })
  await setPaymentDate(page)

  await reviewAndSubmitPayment(page)
  await assertPaymentSummary(page)
}
