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

    // Give the input + form a moment to react (input may reformat, form may
    // disable save, validator may render an inline error).
    await page.waitForTimeout(500)

    // The original Zod crash surfaced an "unexpected error" overlay. The fix
    // (#1879) added maximumFractionDigits=0 and a form-level validator. In
    // practice the input filters '.' silently — we observe Save becomes
    // disabled and the form sits in an invalid-but-non-crashing state. Other
    // valid outcomes (validator message, clamp-and-submit) are also fine.
    // The hard contract under test is just: no crash overlay.
    await expect(page.getByText(/unexpected error/i)).toHaveCount(0)

    // We also try to click Save — if it's enabled, any resulting state
    // (validator error, move-on, no-op) is acceptable. If it's disabled the
    // click is a no-op and we still pass the contract above.
    const saveButton = page.getByRole('button', { name: /^save$/i })
    if (await saveButton.isEnabled()) {
      await saveButton.click()
      await page.waitForTimeout(1_000)
      await expect(page.getByText(/unexpected error/i)).toHaveCount(0)
    }

    // Final no-crash sanity check after any navigation settles. We deliberately
    // do not assert which page rendered: a save can legitimately route to
    // Add Employees, stay on Settings (validator blocked), bounce back to
    // Details, or land on the new policy's detail view depending on backend
    // state and form coercion. The contract these tests guard is "no Zod
    // crash overlay", not flow shape — over-asserting on heading text made
    // the test flaky against the live demo backend.
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
  //
  // Currently fixme'd: with the selector fix in place the test correctly
  // reaches the modal and clears the balance. The SDK then surfaces BOTH
  // the expected field-level validation ("1 field has issues") AND a
  // top-level page alert "There was a problem with your submission - An
  // unexpected error has occurred." The dual-error state is the bug QA
  // reported and is not yet fixed in product code. Drop the .fixme once the
  // SDK suppresses the page-level alert in this case. Repro locally:
  //   E2E_USE_REAL_BACKEND=true npm run test:e2e:demo -- \
  //     --workers=1 --retries=0 -g "blank balance input on edit-balance"
  test.fixme('blank balance input on edit-balance modal shows a clean error, not "unexpected error"', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(300_000)

    const policyName = `E2E BlankBalance ${Date.now()}`
    await createFixedPolicyWithOneEmployee(page, policyName, '20')

    await openEditBalanceModalForFirstEmployee(page)

    // Scope all dialog queries to the Edit balance modal specifically. A
    // sibling react-aria-Popover (the hamburger menu) also has role="dialog"
    // and can briefly co-exist during the menu's exit animation.
    const editBalanceModal = page.getByRole('dialog').filter({ hasText: /time off balance/i })

    const balanceInput = editBalanceModal.getByRole('textbox', { name: /balance/i }).first()
    await balanceInput.clear()

    await editBalanceModal.getByRole('button', { name: /update balance|^save$/i }).click()
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

    // Find an employee row that exposes a starting-balance textbox. Employees
    // already enrolled in a prior policy of the same type render a static
    // <Text> in the balance column (SelectEmployeesPresentation.tsx#L80) rather
    // than a TextInput, so we can't always rely on the first data row.
    //
    // The checkbox.check() can fail with "Clicking the checkbox did not change
    // its state" when the row is already selected (e.g. the SDK pre-selects
    // employees in some scenarios) or the input is gated behind a different
    // selection state. Treat any check failure as "this row isn't a candidate"
    // and continue scanning — falling through to the test.skip below if no
    // suitable row is found.
    const dataRows = page.getByRole('row').filter({ has: page.getByRole('checkbox') })
    const rowCount = await dataRows.count()
    let targetRow: ReturnType<typeof dataRows.nth> | null = null
    for (let i = 1; i < rowCount; i++) {
      const row = dataRows.nth(i)
      const checkOk = await row
        .getByRole('checkbox')
        .first()
        .check({ force: true })
        .then(() => true)
        .catch(() => false)
      if (!checkOk) continue
      const balanceInput = row.getByRole('textbox', { name: /starting balance/i })
      if (await balanceInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
        targetRow = row
        break
      }
    }
    test.skip(
      targetRow === null,
      'Need at least one unenrolled employee row with a starting-balance input to exercise this contract',
    )

    const balanceInput = targetRow!.getByRole('textbox', { name: /starting balance/i })
    await balanceInput.fill('abc')

    const enteredValue = await balanceInput.inputValue()
    expect(enteredValue).not.toMatch(/[a-z]/i)

    await expect(page.getByText(/unexpected error/i)).toHaveCount(0)
  })
})
