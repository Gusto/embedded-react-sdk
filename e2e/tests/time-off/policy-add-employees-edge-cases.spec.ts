import { test, expect } from '../../utils/localTestFixture'
import {
  createFixedPolicyWithOneEmployee,
  enableBalanceMaximumWithValue,
  openAddEmployeesFromDetail,
  openPolicySettingsFromDetail,
} from '../../utils/timeOffFlowDrivers'

// Extracted from QA-fest issues surfaced in PR #1879 (Kristine White).
// These guard contracts on the add-employees + edit-balance flows that the
// QA fest specifically called out.
test.describe('TimeOffFlow - add employees edge cases', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'time-off/time-off-policy-create-validation',
    })
  })

  // QA issue reporter: Wil Alvarez
  // Adding employees to an already-populated policy must surface a
  // confirmation dialog so the partner can review before committing.
  test('confirmation dialog appears when adding employees to an existing populated policy', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(300_000)

    const policyName = `E2E AddExisting ${Date.now()}`
    await createFixedPolicyWithOneEmployee(page, policyName, '20')

    await openAddEmployeesFromDetail(page)

    const dataRows = page.getByRole('row').filter({ has: page.getByRole('checkbox') })
    const rowCount = await dataRows.count()
    if (rowCount < 2) {
      test.skip(true, 'Need at least one additional unenrolled employee in the seeded company')
    }

    // Pick the first selectable unenrolled row.
    let selected = false
    for (let i = 1; i < rowCount; i++) {
      const rowCheckbox = dataRows.nth(i).getByRole('checkbox').first()
      if (!(await rowCheckbox.isChecked())) {
        await rowCheckbox.check({ force: true })
        selected = true
        break
      }
    }
    expect(selected, 'expected at least one unenrolled employee to select').toBe(true)

    await page.getByRole('button', { name: /^continue$/i }).click()

    const dialog = page.getByRole('dialog').filter({ hasText: /add.*to this policy/i })
    await expect(dialog).toBeVisible({ timeout: 10_000 })
    await expect(dialog.getByRole('button', { name: /add and save/i })).toBeVisible()
  })

  // QA issue reporter: Aaron Rosen
  // API error messages on form submit must surface humanized field names
  // (e.g. "Starting balance"), never raw snake_case identifiers
  // (e.g. "starting_balance").
  test('error messages use humanized field names, not snake_case', async ({ page, scenario }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(300_000)

    const policyName = `E2E Humanized ${Date.now()}`
    await createFixedPolicyWithOneEmployee(page, policyName, '5')

    await openPolicySettingsFromDetail(page)

    // Force an API-side error: set balance maximum below the existing employee
    // balance of 5 hours. The resulting error must come back humanized.
    await enableBalanceMaximumWithValue(page, '1')

    await page.getByRole('button', { name: /^save$/i }).click()

    const alert = page.getByRole('alert').first()
    await expect(alert).toBeVisible({ timeout: 10_000 })
    const alertText = (await alert.textContent()) ?? ''
    expect(alertText).not.toMatch(/[a-z]+_[a-z]+/)
  })

  // QA issue reporters: Kevin Bartels / Jeff Stephens
  // Lowering the max balance below existing employee balances must surface
  // descriptive error context (balance/employee), not a generic "unexpected
  // error".
  test('lowering max balance below existing balances surfaces descriptive error', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(300_000)

    const policyName = `E2E LowMax ${Date.now()}`
    await createFixedPolicyWithOneEmployee(page, policyName, '40')

    await openPolicySettingsFromDetail(page)
    await enableBalanceMaximumWithValue(page, '1')

    await page.getByRole('button', { name: /^save$/i }).click()

    await expect(page.getByText(/unexpected error/i)).toHaveCount(0)

    const alert = page.getByRole('alert').first()
    await expect(alert).toBeVisible({ timeout: 10_000 })
    const alertText = ((await alert.textContent()) ?? '').toLowerCase()
    expect(alertText).toMatch(/balance|employee/)
  })
})
