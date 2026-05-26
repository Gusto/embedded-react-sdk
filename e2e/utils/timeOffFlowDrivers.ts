import { expect, type Page } from '@playwright/test'
import type { ScenarioContext } from '../scenario/context'
import { waitForLoadingComplete } from './helpers'

const LONG_WAIT = 90_000

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

async function selectAllEmployeesOnAddStep(page: Page): Promise<number> {
  const selectAll = page.getByRole('checkbox', { name: /select all/i }).first()
  await expect(selectAll).toBeVisible({ timeout: 15_000 })
  if (!(await selectAll.isChecked())) {
    await selectAll.check({ force: true })
  }

  const dataRows = page.getByRole('row').filter({ has: page.getByRole('checkbox') })
  return dataRows.count().then(n => Math.max(0, n - 1))
}

async function selectFirstNEmployeesOnAddStep(page: Page, count: number): Promise<void> {
  await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
    timeout: LONG_WAIT,
  })

  const dataRows = page.getByRole('row').filter({ has: page.getByRole('checkbox') })
  await expect(dataRows.first()).toBeVisible({ timeout: 15_000 })

  for (let i = 1; i <= count; i++) {
    const rowCheckbox = dataRows.nth(i).getByRole('checkbox').first()
    if (!(await rowCheckbox.isChecked())) {
      await rowCheckbox.check({ force: true })
    }
  }
}

async function fillStartingBalanceForRow(
  page: Page,
  rowIndex: number,
  balance: string,
): Promise<void> {
  const dataRows = page.getByRole('row').filter({ has: page.getByRole('checkbox') })
  const balanceInput = dataRows.nth(rowIndex).getByRole('textbox', {
    name: /starting balance/i,
  })
  if (await balanceInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await balanceInput.fill(balance)
  }
}

async function continueThroughAddConfirm(page: Page): Promise<void> {
  await page.getByRole('button', { name: /^continue$/i }).click()

  const addDialog = page.getByRole('dialog').filter({ hasText: /add.*to this policy/i })
  if (await addDialog.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await addDialog.getByRole('button', { name: /add and save/i }).click()
  }

  await waitForLoadingComplete(page, LONG_WAIT)
}

export async function runUnlimitedTimeOffPolicyCreate(
  page: Page,
  _scenario: ScenarioContext,
  opts: { policyName: string; employeesToSelect?: number },
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

  await selectFirstNEmployeesOnAddStep(page, opts.employeesToSelect ?? 2)
  await continueThroughAddConfirm(page)

  await expect(page.getByRole('heading', { name: new RegExp(opts.policyName, 'i') })).toBeVisible({
    timeout: LONG_WAIT,
  })
}

export async function runFixedAccrualSickPolicyCreate(
  page: Page,
  _scenario: ScenarioContext,
  opts: {
    policyName: string
    balanceMaximumHours: number
    carryOverLimitHours: number
    employeeBalances: string[]
  },
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

  const balanceMaxSwitch = page.getByRole('switch', { name: /^balance maximum$/i })
  await balanceMaxSwitch.click({ force: true })
  await page
    .getByRole('textbox', { name: /^balance maximum/i })
    .fill(String(opts.balanceMaximumHours))

  const carryOverSwitch = page.getByRole('switch', { name: /^carry over limit$/i })
  await carryOverSwitch.click({ force: true })
  await page
    .getByRole('textbox', { name: /^carry over limit/i })
    .fill(String(opts.carryOverLimitHours))

  const payoutSwitch = page.getByRole('switch', { name: /payout on dismissal/i })
  await payoutSwitch.click({ force: true })

  await page.getByRole('button', { name: /^save$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
    timeout: LONG_WAIT,
  })

  await selectFirstNEmployeesOnAddStep(page, opts.employeeBalances.length)
  for (let i = 0; i < opts.employeeBalances.length; i++) {
    await fillStartingBalanceForRow(page, i + 1, opts.employeeBalances[i]!)
  }

  await continueThroughAddConfirm(page)

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

  const holidaySelectAll = page.getByRole('checkbox', { name: /select all/i }).first()
  if (await holidaySelectAll.isVisible().catch(() => false)) {
    await holidaySelectAll.check({ force: true })
  } else {
    await page.getByRole('row').nth(1).getByRole('checkbox').check({ force: true })
  }

  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, LONG_WAIT)

  await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
    timeout: LONG_WAIT,
  })

  const selectedEmployeeCount = await selectAllEmployeesOnAddStep(page)
  expect(selectedEmployeeCount).toBeGreaterThan(0)

  await continueThroughAddConfirm(page)

  await expect(page.getByRole('heading', { name: /holiday pay policy/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
}

export async function createFixedPolicyWithOneEmployee(
  page: Page,
  policyName: string,
  startingBalance: string = '12',
): Promise<void> {
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

  await selectFirstNEmployeesOnAddStep(page, 1)
  await fillStartingBalanceForRow(page, 1, startingBalance)

  await continueThroughAddConfirm(page)

  await expect(page.getByRole('heading', { name: new RegExp(policyName, 'i') })).toBeVisible({
    timeout: LONG_WAIT,
  })
}

export async function openPolicySettingsFromDetail(page: Page): Promise<void> {
  const changeButton = page.getByRole('button', { name: /^change$/i }).first()
  await expect(changeButton).toBeVisible({ timeout: LONG_WAIT })
  await changeButton.click()
  await waitForLoadingComplete(page)

  await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
}

export async function openAddEmployeesFromDetail(page: Page): Promise<void> {
  await page.getByRole('tab', { name: /employees/i }).click()
  await waitForLoadingComplete(page)

  const addButton = page.getByRole('button', { name: /add employee/i }).first()
  await expect(addButton).toBeVisible({ timeout: LONG_WAIT })
  await addButton.click()
  await waitForLoadingComplete(page)

  await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
    timeout: LONG_WAIT,
  })
}

export async function openEditBalanceModalForFirstEmployee(page: Page): Promise<void> {
  await page.getByRole('tab', { name: /employees/i }).click()
  await waitForLoadingComplete(page)

  // The employee row exposes a HamburgerMenu trigger labelled
  // "Actions <Employee Name>" (TimeOffPolicyDetail.tsx#L288). "Edit balance"
  // is a menu item inside that menu, not a top-level button.
  const actionsTrigger = page.getByRole('button', { name: /^actions\b/i }).first()
  await expect(actionsTrigger).toBeVisible({ timeout: LONG_WAIT })
  await actionsTrigger.click()

  await page.getByRole('menuitem', { name: /edit balance/i }).click()

  // The hamburger menu uses react-aria-Popover which also has role="dialog",
  // and it briefly overlaps the real Edit balance modal during the exit
  // animation (strict-mode collision). Scope to the dialog whose title text
  // matches editBalanceModal.title ("Edit {name} time off balance").
  await expect(page.getByRole('dialog').filter({ hasText: /time off balance/i })).toBeVisible({
    timeout: 10_000,
  })
}

export async function enableBalanceMaximumWithValue(page: Page, hours: string): Promise<void> {
  const balanceMaxSwitch = page.getByRole('switch', { name: /^balance maximum$/i })
  const isChecked = await balanceMaxSwitch.getAttribute('aria-checked')
  if (isChecked !== 'true') {
    await balanceMaxSwitch.click({ force: true })
  }

  const balanceMaxInput = page.getByRole('textbox', { name: /^balance maximum/i })
  await balanceMaxInput.clear()
  await balanceMaxInput.fill(hours)
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

  await selectFirstNEmployeesOnAddStep(page, 1)
  await fillStartingBalanceForRow(page, 1, '12')

  await continueThroughAddConfirm(page)

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
  scenario: ScenarioContext,
  opts: { policyName: string },
): Promise<void> {
  // Delete spec uses an empty policy on purpose. Deleting a policy with
  // enrolled employees on the demo backend is blocked by the
  // "pending or approved time off requests must be declined first" rule
  // — the seed employees on react_sdk_demo_company_onboarded carry
  // pre-existing requests that surface as a UX blocker, not a real
  // product regression. Specs 01-04 already exercise the populated-
  // policy path. Spec 05 is the one whose contract is "delete-from-list
  // confirmation flow", which is unaffected by enrollment count.
  await runUnlimitedTimeOffPolicyCreate(page, scenario, {
    policyName: opts.policyName,
    employeesToSelect: 0,
  })

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
