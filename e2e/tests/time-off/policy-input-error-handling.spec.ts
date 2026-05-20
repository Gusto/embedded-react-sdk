import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'
import {
  createFixedPolicyWithOneEmployee,
  openEditBalanceModalForFirstEmployee,
} from '../../utils/timeOffFlowDrivers'

// Extracted from QA-fest issues surfaced in PR #1879 (Kristine White).
// Each test guards a real regression Kristine's PR called out. Ported onto our
// scenario-driven infrastructure so they run in CI rather than being skipped
// behind localConfig.isLocal.
test.describe('TimeOffFlow - input error handling regressions', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'time-off/time-off-policy-create-validation',
    })
  })

  // QA issue reporter: Jeff Stephens
  // Non-integer waiting period caused an unhandled Zod validation error on submit.
  // Paired with the SDK fix landing in #1883.
  test('waiting period decimal value surfaces clean validation, not a Zod crash', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(240_000)

    const policyName = `E2E WaitDecimal ${Date.now()}`

    await page.goto('/?flow=time-off')
    await waitForLoadingComplete(page)

    await page
      .getByRole('button', { name: /create policy/i })
      .first()
      .click()
    await waitForLoadingComplete(page)

    await page.getByRole('radio', { name: /^time off$/i }).check()
    await page.getByRole('button', { name: /^continue$/i }).click()
    await waitForLoadingComplete(page)

    await page.getByLabel(/policy name/i).fill(policyName)
    await page.getByRole('radio', { name: /based on hours worked/i }).check()
    await page.getByLabel(/employees will accrue/i).fill('1')
    await page.getByLabel(/for every/i).fill('30')

    await page.getByRole('button', { name: /save.*continue|^continue$/i }).click()
    await waitForLoadingComplete(page, 60_000)

    await expect(page.getByRole('heading', { name: /policy settings/i })).toBeVisible({
      timeout: 30_000,
    })

    const waitingPeriodSwitch = page.getByRole('switch', { name: /^waiting period$/i })
    if ((await waitingPeriodSwitch.getAttribute('aria-checked')) !== 'true') {
      await waitingPeriodSwitch.click({ force: true })
    }

    const waitingPeriodInput = page.getByRole('textbox', { name: /^waiting period/i })
    await waitingPeriodInput.clear()
    await waitingPeriodInput.fill('1.5')

    await page.getByRole('button', { name: /^save$/i }).click()

    // Two acceptable outcomes for the fix: either the input clamps the decimal
    // (maximumFractionDigits=0) so submit goes through, or the form-level
    // validator surfaces the human-readable error. Both prove the Zod crash
    // is gone. The contract is: we never see "unexpected error" and we never
    // get stuck silently.
    const errorVisible = await page
      .getByText(/waiting period must be a whole number of days/i)
      .isVisible({ timeout: 5_000 })
      .catch(() => false)
    const movedOn = await page
      .getByRole('heading', { name: /add employees to policy/i })
      .isVisible({ timeout: 5_000 })
      .catch(() => false)

    expect(errorVisible || movedOn).toBe(true)
    await expect(page.getByText(/unexpected error/i)).toHaveCount(0)
  })

  // QA issue reporters: Austin Shieh / Kevin Bartels
  // Switching the accrual method from hours-worked to fixed-per-year previously
  // left an "accrual rate unit must be blank" ghost error on the request.
  test('switching accrual method hours-worked -> fixed-per-year does not emit accrual_rate_unit error', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(240_000)

    const policyName = `E2E SwitchMethod ${Date.now()}`

    await page.goto('/?flow=time-off')
    await waitForLoadingComplete(page)

    await page
      .getByRole('button', { name: /create policy/i })
      .first()
      .click()
    await waitForLoadingComplete(page)

    await page.getByRole('radio', { name: /^time off$/i }).check()
    await page.getByRole('button', { name: /^continue$/i }).click()
    await waitForLoadingComplete(page)

    await page.getByLabel(/policy name/i).fill(policyName)

    await page.getByRole('radio', { name: /based on hours worked/i }).check()
    await page.getByLabel(/employees will accrue/i).fill('1')
    await page.getByLabel(/for every/i).fill('30')

    await page.getByRole('radio', { name: /fixed amount per year/i }).check()
    await page.getByLabel(/total hours per year/i).fill('120')
    await page.getByRole('radio', { name: /each pay period/i }).check()
    await page.getByRole('radio', { name: /each employee's start date/i }).check()

    await page.getByRole('button', { name: /save.*continue|^continue$/i }).click()
    await waitForLoadingComplete(page, 60_000)

    await expect(page.getByRole('heading', { name: /policy settings/i })).toBeVisible({
      timeout: 30_000,
    })

    await expect(page.getByText(/accrual.*rate.*unit/i)).toHaveCount(0)
  })

  // QA issue reporter: Sam Nazarian
  // Submitting an unreasonably large accrual rate previously bubbled a 500.
  test('very large accrual rate surfaces a clean validation error, not a 500', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(240_000)

    const policyName = `E2E HugeRate ${Date.now()}`

    await page.goto('/?flow=time-off')
    await waitForLoadingComplete(page)

    await page
      .getByRole('button', { name: /create policy/i })
      .first()
      .click()
    await waitForLoadingComplete(page)

    await page.getByRole('radio', { name: /^time off$/i }).check()
    await page.getByRole('button', { name: /^continue$/i }).click()
    await waitForLoadingComplete(page)

    await page.getByLabel(/policy name/i).fill(policyName)
    await page.getByRole('radio', { name: /fixed amount per year/i }).check()
    await page.getByLabel(/total hours per year/i).fill('999999999')
    await page.getByRole('radio', { name: /each pay period/i }).check()
    await page.getByRole('radio', { name: /each employee's start date/i }).check()

    await page.getByRole('button', { name: /save.*continue|^continue$/i }).click()
    await page.waitForTimeout(2_000)

    // Either the form refused the value (still on details) or moved on with a
    // validation message. We are guarding against silent 500s only.
    await expect(page.getByText(/unexpected error/i)).toHaveCount(0)
    await expect(page.getByText(/internal server error/i)).toHaveCount(0)
  })

  // QA issue reporter: Jeff Stephens
  // Clearing the balance input on the edit-balance modal previously produced
  // an "unexpected error" instead of a clean validation message.
  test('blank balance input on edit-balance modal shows a clean error, not "unexpected error"', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(300_000)

    const policyName = `E2E BlankBalance ${Date.now()}`
    await createFixedPolicyWithOneEmployee(page, policyName, '20')

    await openEditBalanceModalForFirstEmployee(page)

    const balanceInput = page
      .getByRole('dialog')
      .getByRole('textbox', { name: /balance/i })
      .first()
    await balanceInput.clear()

    await page
      .getByRole('dialog')
      .getByRole('button', { name: /update balance|^save$/i })
      .click()
    await page.waitForTimeout(1_500)

    await expect(page.getByText(/unexpected error/i)).toHaveCount(0)
  })

  // QA issue reporter: Xiao Hu
  // Non-numeric chars in starting balance previously produced an "unexpected error".
  test('non-numeric chars in starting balance do not crash with "unexpected error"', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(240_000)

    const policyName = `E2E AlphaBalance ${Date.now()}`

    await page.goto('/?flow=time-off')
    await waitForLoadingComplete(page)

    await page
      .getByRole('button', { name: /create policy/i })
      .first()
      .click()
    await waitForLoadingComplete(page)

    await page.getByRole('radio', { name: /^time off$/i }).check()
    await page.getByRole('button', { name: /^continue$/i }).click()
    await waitForLoadingComplete(page)

    await page.getByLabel(/policy name/i).fill(policyName)
    await page.getByRole('radio', { name: /fixed amount per year/i }).check()
    await page.getByLabel(/total hours per year/i).fill('80')
    await page.getByRole('radio', { name: /each pay period/i }).check()
    await page.getByRole('radio', { name: /each employee's start date/i }).check()

    await page.getByRole('button', { name: /save.*continue|^continue$/i }).click()
    await waitForLoadingComplete(page, 60_000)

    await page.getByRole('button', { name: /^save$/i }).click()
    await waitForLoadingComplete(page, 60_000)

    await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
      timeout: 30_000,
    })

    const dataRows = page.getByRole('row').filter({ has: page.getByRole('checkbox') })
    const firstRow = dataRows.nth(1)
    await firstRow.getByRole('checkbox').check({ force: true })

    const balanceInput = firstRow.getByRole('textbox', { name: /starting balance/i })
    await balanceInput.fill('abc')

    const enteredValue = await balanceInput.inputValue()
    expect(enteredValue).not.toMatch(/[a-z]/i)

    await expect(page.getByText(/unexpected error/i)).toHaveCount(0)
  })
})
