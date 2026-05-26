import { expect, type Page } from '@playwright/test'
import type { ScenarioContext } from '../scenario/context'
import { fillDate, waitForLoadingComplete } from './helpers'

const LONG_WAIT = 90_000
const MEDIUM_WAIT = 60_000
const SHORT_WAIT = 5_000

export const OVERVIEW_HEADING = /get started|let's get started|we need a few more details/i
export const BEGIN_ONBOARDING_BUTTON = /start onboarding|continue onboarding/i

/**
 * Land on the company-onboarding entry screen — the overview that shows
 * either "Let's get started" (fresh company) or "We need a few more
 * details" (mid-flow) or "Nice! We'll take it from here." (completed).
 */
export async function landOnCompanyOnboarding(page: Page): Promise<void> {
  await page.goto('/?flow=company-onboarding')
  await waitForLoadingComplete(page, MEDIUM_WAIT)

  const initialOrResume = page.getByRole('heading', {
    name: /let['’]s get started|we need a few more details/i,
  })
  const completed = page.getByRole('heading', {
    name: /nice! we['’]ll take it from here/i,
  })
  await expect(initialOrResume.or(completed).first()).toBeVisible({ timeout: MEDIUM_WAIT })
}

/**
 * Click the overview's primary CTA (Start onboarding / Continue onboarding)
 * to enter the wizard. No-op if already inside the wizard.
 */
export async function clickStartOrContinueOnboarding(page: Page): Promise<void> {
  const cta = page.getByRole('button', { name: /^(start|continue) onboarding$/i })
  if (await cta.isVisible({ timeout: SHORT_WAIT }).catch(() => false)) {
    await cta.click()
    await waitForLoadingComplete(page, MEDIUM_WAIT)
  }
}

/** Wait for the wizard's first screen (Company addresses) to render. */
export async function expectOnLocationsList(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: /company addresses/i })).toBeVisible({
    timeout: MEDIUM_WAIT,
  })
  await expect(page.getByRole('progressbar')).toBeVisible()
}

/** From the Locations list, advance to Federal Tax Information. */
export async function advancePastLocations(page: Page): Promise<void> {
  await expectOnLocationsList(page)
  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, MEDIUM_WAIT)
  await expect(page.getByRole('heading', { name: /federal tax information/i })).toBeVisible({
    timeout: MEDIUM_WAIT,
  })
}

/**
 * Add a second location via the Locations list "+ Add another address"
 * sub-form, save, and return to the list. The HQ scenario address must
 * already be present.
 */
export async function addAnotherLocation(
  page: Page,
  loc: { street1: string; city: string; state: string; zip: string; phone: string },
): Promise<void> {
  await expectOnLocationsList(page)

  await page
    .getByRole('button', { name: /\+\s*add (another|an) address/i })
    .first()
    .click()
  await waitForLoadingComplete(page, MEDIUM_WAIT)

  await page.getByLabel(/^street 1$/i).fill(loc.street1)
  await page.getByLabel(/^city$/i).fill(loc.city)

  const stateButton = page.getByRole('button', { name: /select state/i }).first()
  await stateButton.click()
  await page.getByRole('option', { name: new RegExp(`^${loc.state}$`, 'i') }).click()

  await page.getByLabel(/^zip$/i).fill(loc.zip)
  await page.getByLabel(/^phone number$/i).fill(loc.phone)

  await page.getByRole('button', { name: /^save$/i }).click()
  await waitForLoadingComplete(page, MEDIUM_WAIT)

  await expectOnLocationsList(page)
}

/**
 * Fill the Federal Tax Information form with reasonable defaults
 * (random EIN if the demo didn't supply one, LLC taxpayer type, 941
 * filing form, "Canary Test Co LLC" legal name) and advance to Industry.
 *
 * Each field is filled conditionally — if the demo pre-populated a
 * value the field may not be empty/visible and we skip it.
 */
export async function advancePastFederalTaxes(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: /federal tax information/i })).toBeVisible({
    timeout: MEDIUM_WAIT,
  })

  const einField = page.getByLabel(/federal ein/i)
  if (await einField.isVisible({ timeout: SHORT_WAIT }).catch(() => false)) {
    const uniqueEIN = `${Math.floor(Math.random() * 89 + 10)}-${Math.floor(Math.random() * 8999999 + 1000000)}` // noboost
    await einField.clear()
    await einField.fill(uniqueEIN)
  }

  const taxpayerButton = page.getByRole('button', { name: /taxpayer type/i })
  if (await taxpayerButton.isVisible({ timeout: SHORT_WAIT }).catch(() => false)) {
    const buttonText = await taxpayerButton.textContent()
    if (!buttonText || buttonText.includes('Select') || buttonText.trim() === 'Taxpayer type') {
      await taxpayerButton.click()
      await page.getByRole('option', { name: /^LLC$/ }).click()
    }
  }

  const filingFormButton = page.getByRole('button', { name: /federal filing form/i })
  if (await filingFormButton.isVisible({ timeout: SHORT_WAIT }).catch(() => false)) {
    const buttonText = await filingFormButton.textContent()
    if (
      !buttonText ||
      buttonText.includes('Select') ||
      buttonText.trim() === 'Federal filing form'
    ) {
      await filingFormButton.click()
      await page.getByRole('option', { name: /^941/i }).first().click()
    }
  }

  const legalNameField = page.getByLabel(/legal entity name/i)
  if (await legalNameField.isVisible({ timeout: SHORT_WAIT }).catch(() => false)) {
    const currentValue = await legalNameField.inputValue()
    if (!currentValue) {
      await legalNameField.fill('Canary Test Co LLC')
    }
  }

  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)
  await expect(page.getByRole('heading', { name: /^industry$/i })).toBeVisible({
    timeout: MEDIUM_WAIT,
  })
}

/**
 * Pick the first available industry option and advance to Bank account.
 */
export async function advancePastIndustry(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: /^industry$/i })).toBeVisible({
    timeout: MEDIUM_WAIT,
  })

  const industryCombo = page
    .getByRole('combobox', { name: /select your company['’]s industry|industry/i })
    .first()
  if (await industryCombo.isVisible({ timeout: SHORT_WAIT }).catch(() => false)) {
    await industryCombo.click()
    await industryCombo.fill('software')
    const firstOption = page.getByRole('option').first()
    if (await firstOption.isVisible({ timeout: SHORT_WAIT }).catch(() => false)) {
      await firstOption.click()
    }
  }

  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)
  await expect(
    page.getByRole('heading', { name: /company bank account|bank account/i }).first(),
  ).toBeVisible({ timeout: MEDIUM_WAIT })
}

/**
 * Create a bank account via the SDK UI if no account exists, or just
 * Continue past the list view if one is already present. Lands on the
 * Employees step.
 */
export async function advancePastBankAccount(page: Page): Promise<void> {
  await expect(
    page.getByRole('heading', { name: /company bank account|bank account/i }).first(),
  ).toBeVisible({ timeout: MEDIUM_WAIT })

  const routingField = page.getByLabel(/routing number/i).first()
  const hasAddForm = await routingField.isVisible({ timeout: SHORT_WAIT }).catch(() => false)
  if (hasAddForm) {
    await routingField.fill('123456780')
    await page.getByLabel(/^account number$/i).fill('123456789012')
    await page
      .getByRole('button', { name: /^continue$/i })
      .first()
      .click()
    await waitForLoadingComplete(page, LONG_WAIT)
    // After create, we're on the list view (still step 4). Need a second
    // Continue to advance to the Employees step.
    await expect(page.getByRole('button', { name: /change bank account/i }).first()).toBeVisible({
      timeout: MEDIUM_WAIT,
    })
  }

  await page
    .getByRole('button', { name: /^continue$/i })
    .first()
    .click()
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(page.getByRole('heading', { name: /your employees/i })).toBeVisible({
    timeout: MEDIUM_WAIT,
  })
}

/**
 * Skip the employee step ("I'll do this later") and land on the pay
 * schedule step.
 */
export async function skipEmployeesStep(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: /your employees/i })).toBeVisible({
    timeout: MEDIUM_WAIT,
  })

  const skipButton = page.getByRole('button', { name: /i['’]ll do this later/i })
  const continueButton = page.getByRole('button', { name: /^continue$/i })

  if (await skipButton.isVisible({ timeout: SHORT_WAIT }).catch(() => false)) {
    await skipButton.click()
  } else {
    await continueButton.first().click()
  }
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(
    page.getByRole('heading', { name: /set up pay schedule|add pay schedule/i }).first(),
  ).toBeVisible({ timeout: MEDIUM_WAIT })
}

/**
 * Create a "Every other week" pay schedule via the SDK UI if no
 * schedule exists, or just Continue past the list view otherwise. Lands
 * on the State tax step.
 *
 * The pay schedule form uses ComboBox/Select widgets for frequency and
 * three date pickers (first pay date, first pay period end date). We
 * pick dates 14 / 13 days from today.
 */
export async function advancePastPaySchedule(page: Page): Promise<void> {
  await expect(
    page.getByRole('heading', { name: /set up pay schedule|add pay schedule/i }).first(),
  ).toBeVisible({ timeout: MEDIUM_WAIT })

  const continueButton = page.getByRole('button', { name: /^continue$/i }).first()
  const addAnotherButton = page.getByRole('button', { name: /\+\s*add another pay schedule/i })

  // List view shows when at least one pay schedule already exists. The "Add
  // another pay schedule" button is the unambiguous signal — Continue alone
  // is ambiguous because some other buttons share that label across the SDK.
  const isListView = await addAnotherButton.isVisible({ timeout: SHORT_WAIT }).catch(() => false)

  if (!isListView) {
    const saveButton = page.getByRole('button', { name: /^save$/i })

    const nameField = page.getByLabel(/^name$/i).first()
    if (await nameField.isVisible({ timeout: SHORT_WAIT }).catch(() => false)) {
      await nameField.fill('Biweekly Canary')
    }

    const freqButton = page.getByRole('button', { name: /pay frequency|^frequency$/i }).first()
    if (await freqButton.isVisible({ timeout: SHORT_WAIT }).catch(() => false)) {
      await freqButton.click()
      await page.getByRole('option', { name: /every other week/i }).click()
    }

    const today = new Date()
    const firstPayDate = new Date(today)
    firstPayDate.setDate(today.getDate() + 14)
    const firstPeriodEnd = new Date(today)
    firstPeriodEnd.setDate(today.getDate() + 13)

    await fillDate(page, 'First pay date', {
      month: firstPayDate.getMonth() + 1,
      day: firstPayDate.getDate(),
      year: firstPayDate.getFullYear(),
    })
    await fillDate(page, 'First pay period end date', {
      month: firstPeriodEnd.getMonth() + 1,
      day: firstPeriodEnd.getDate(),
      year: firstPeriodEnd.getFullYear(),
    })

    await saveButton.click()
    await waitForLoadingComplete(page, LONG_WAIT)
    // After save we're on the pay schedule list view (still step 6). Need
    // one more Continue to advance to State tax (step 7).
    await expect(addAnotherButton).toBeVisible({ timeout: MEDIUM_WAIT })
  }

  await continueButton.click()
  await waitForLoadingComplete(page, LONG_WAIT)

  // Land on State tax — page renders an alert warning + a grid/table.
  const stateTaxWarning = page.getByText(
    /self[- ]onboarding employees can change your company tax requirements/i,
  )
  const stateTaxGrid = page.getByRole('grid', { name: /state tax requirements/i })
  const stateTaxTable = page.getByRole('table', { name: /state tax requirements/i })
  const emptyStateTax = page.getByText(/no state tax requirements/i)
  await expect(
    stateTaxWarning.or(stateTaxGrid).or(stateTaxTable).or(emptyStateTax).first(),
  ).toBeVisible({
    timeout: MEDIUM_WAIT,
  })
}

/**
 * Click Continue on the State tax list to advance to Documents.
 */
export async function advancePastStateTaxes(page: Page): Promise<void> {
  await page
    .getByRole('button', { name: /^continue$/i })
    .first()
    .click()
  await waitForLoadingComplete(page, LONG_WAIT)

  // Documents step renders either the document list or the assign
  // signatory form depending on whether a signatory is set.
  await expect(
    page
      .getByRole('heading', { name: /^documents$/i })
      .or(page.getByRole('heading', { name: /assign a company signatory/i }))
      .first(),
  ).toBeVisible({ timeout: MEDIUM_WAIT })
}

/**
 * Drive each company onboarding wizard step in order:
 * overview → locations → federal taxes → industry → bank → employees
 * (skip) → pay schedule → state taxes → documents. Stops once the
 * Documents step renders (sign-off requires PDF signature interaction
 * which is brittle for canary).
 */
export async function runFullOnboardingThroughDocuments(page: Page): Promise<void> {
  await landOnCompanyOnboarding(page)
  await clickStartOrContinueOnboarding(page)
  await advancePastLocations(page)
  await advancePastFederalTaxes(page)
  await advancePastIndustry(page)
  await advancePastBankAccount(page)
  await skipEmployeesStep(page)
  await advancePastPaySchedule(page)
  await advancePastStateTaxes(page)
}

/**
 * Sanity-check that an already-onboarded company demo lands the
 * /?flow=company-onboarding entry on the completed terminal state.
 * Used by the onboarded-completion canary.
 */
export async function assertCompletedOverview(page: Page): Promise<void> {
  await expect(
    page.getByRole('heading', { name: /nice! we['’]ll take it from here/i }),
  ).toBeVisible({ timeout: LONG_WAIT })
  await expect(page.getByRole('button', { name: /^done$/i })).toBeVisible({ timeout: MEDIUM_WAIT })
}
