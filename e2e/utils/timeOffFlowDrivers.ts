import { expect, type Page } from '@playwright/test'
import type { ScenarioContext } from '../scenario/context'
import { waitForLoadingComplete } from './helpers'

const LONG_WAIT = 60_000

async function landOnTimeOffPolicyList(page: Page): Promise<void> {
  await page.goto('/?flow=time-off')
  await waitForLoadingComplete(page)

  await expect(page.getByRole('heading', { name: /time off policies/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
}

async function clickCreatePolicy(page: Page): Promise<void> {
  await page
    .getByRole('button', { name: /create policy/i })
    .first()
    .click()
  await waitForLoadingComplete(page)

  await expect(page.getByRole('heading', { name: /select policy type/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
}

async function chooseSaveAndContinue(page: Page): Promise<void> {
  await page
    .getByRole('button', { name: /save.*continue|^continue$/i })
    .filter({ hasNotText: /cancel/i })
    .last()
    .click()
}

async function deleteHolidayPolicyIfPresent(page: Page): Promise<void> {
  const holidayRow = page.getByRole('row').filter({ has: page.getByText(/Holiday pay policy/i) })

  if (!(await holidayRow.isVisible({ timeout: 5_000 }).catch(() => false))) return

  await holidayRow.getByRole('button', { name: /actions for holiday pay policy/i }).click()
  await page.getByRole('menuitem', { name: /delete policy/i }).click()

  const dialog = page.getByRole('dialog').filter({ hasText: /holiday/i })
  await expect(dialog).toBeVisible({ timeout: 10_000 })
  await dialog.getByRole('button', { name: /^delete policy$/i }).click()

  await waitForLoadingComplete(page, LONG_WAIT)
}

export async function runUnlimitedTimeOffPolicyCreate(
  page: Page,
  _scenario: ScenarioContext,
  opts: { policyName: string },
): Promise<void> {
  await landOnTimeOffPolicyList(page)
  await clickCreatePolicy(page)

  await page.getByRole('radio', { name: /^time off$/i }).check()
  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page)

  await expect(page.getByRole('heading', { name: /policy details/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
  await page.getByLabel(/policy name/i).fill(opts.policyName)
  await page.getByRole('radio', { name: /unlimited/i }).check()

  await chooseSaveAndContinue(page)
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(page.getByRole('heading', { name: new RegExp(opts.policyName, 'i') })).toBeVisible({
    timeout: LONG_WAIT,
  })
}

export async function runFixedAccrualSickPolicyCreate(
  page: Page,
  _scenario: ScenarioContext,
  opts: { policyName: string },
): Promise<void> {
  await landOnTimeOffPolicyList(page)
  await clickCreatePolicy(page)

  await page.getByRole('radio', { name: /^sick leave$/i }).check()
  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page)

  await expect(page.getByRole('heading', { name: /policy details/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
  await page.getByLabel(/policy name/i).fill(opts.policyName)
  await page.getByRole('radio', { name: /fixed amount per year/i }).check()
  await page.getByLabel(/total hours per year/i).fill('80')
  await page.getByRole('radio', { name: /each pay period/i }).check()
  await page.getByRole('radio', { name: /each employee's start date/i }).check()

  await chooseSaveAndContinue(page)
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(page.getByRole('heading', { name: /policy settings/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
  await page.getByRole('button', { name: /^save$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(page.getByRole('heading', { name: new RegExp(opts.policyName, 'i') })).toBeVisible({
    timeout: LONG_WAIT,
  })
}

export async function runHolidayPayPolicyCreate(
  page: Page,
  _scenario: ScenarioContext,
): Promise<void> {
  await landOnTimeOffPolicyList(page)
  await deleteHolidayPolicyIfPresent(page)
  await clickCreatePolicy(page)

  await page.getByRole('radio', { name: /holiday pay/i }).check()
  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page)

  await expect(page.getByRole('heading', { name: /choose your company holidays/i })).toBeVisible({
    timeout: LONG_WAIT,
  })

  const newYearsCell = page.getByRole('gridcell', { name: /New Year's Day/i })
  await expect(newYearsCell).toBeVisible({ timeout: 15_000 })

  const headerCheckbox = page.getByRole('checkbox', { name: /select all/i }).first()
  if (await headerCheckbox.isVisible().catch(() => false)) {
    await headerCheckbox.check()
  } else {
    await page.getByRole('row').nth(1).getByRole('checkbox').check()
  }

  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(page.getByRole('heading', { name: /holiday pay policy/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
}

async function createFixedPolicyForRename(page: Page, policyName: string): Promise<void> {
  await landOnTimeOffPolicyList(page)
  await clickCreatePolicy(page)

  await page.getByRole('radio', { name: /^time off$/i }).check()
  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page)

  await page.getByLabel(/policy name/i).fill(policyName)
  await page.getByRole('radio', { name: /fixed amount per year/i }).check()
  await page.getByLabel(/total hours per year/i).fill('80')
  await page.getByRole('radio', { name: /each pay period/i }).check()
  await page.getByRole('radio', { name: /each employee's start date/i }).check()

  await chooseSaveAndContinue(page)
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(page.getByRole('heading', { name: /policy settings/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
  await page.getByRole('button', { name: /^save$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(page.getByRole('heading', { name: new RegExp(policyName, 'i') })).toBeVisible({
    timeout: LONG_WAIT,
  })
}

export async function runEditPolicyRename(
  page: Page,
  _scenario: ScenarioContext,
  opts: { originalName: string; renamedName: string },
): Promise<void> {
  await createFixedPolicyForRename(page, opts.originalName)

  await page.getByRole('button', { name: /edit policy/i }).click()
  await waitForLoadingComplete(page)

  await expect(
    page.getByRole('heading', { name: new RegExp(`Edit ${opts.originalName}`, 'i') }),
  ).toBeVisible({ timeout: LONG_WAIT })

  await page.getByLabel(/policy name/i).fill(opts.renamedName)

  await chooseSaveAndContinue(page)
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(page.getByRole('heading', { name: new RegExp(opts.renamedName, 'i') })).toBeVisible({
    timeout: LONG_WAIT,
  })
}

export async function runDeletePolicyFromList(
  page: Page,
  _scenario: ScenarioContext,
  opts: { policyName: string },
): Promise<void> {
  await runUnlimitedTimeOffPolicyCreate(page, _scenario, { policyName: opts.policyName })

  await page.getByRole('button', { name: /time off policies/i }).click()
  await waitForLoadingComplete(page)

  await expect(page.getByRole('heading', { name: /time off policies/i })).toBeVisible({
    timeout: LONG_WAIT,
  })

  const policyRow = page
    .getByRole('row')
    .filter({ has: page.getByText(opts.policyName, { exact: true }) })
  await expect(policyRow).toBeVisible({ timeout: LONG_WAIT })

  await policyRow
    .getByRole('button', { name: new RegExp(`actions for ${opts.policyName}`, 'i') })
    .click()
  await page.getByRole('menuitem', { name: /delete policy/i }).click()

  const dialog = page
    .getByRole('dialog')
    .filter({ hasText: new RegExp(`Are you sure.*${opts.policyName}`, 'i') })
  await expect(dialog).toBeVisible({ timeout: 10_000 })
  await dialog.getByRole('button', { name: /^delete policy$/i }).click()

  await expect(
    page.getByText(new RegExp(`Policy "${opts.policyName}" deleted successfully`, 'i')),
  ).toBeVisible({ timeout: LONG_WAIT })

  await expect(policyRow).not.toBeVisible({ timeout: 15_000 })
}
