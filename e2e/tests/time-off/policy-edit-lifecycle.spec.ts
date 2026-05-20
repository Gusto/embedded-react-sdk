import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

// NOTE: This test intentionally creates a *fixed-per-year* policy rather than an
// unlimited one. Updating an unlimited policy via PUT /v1/time_off_policies/:uuid
// currently fails on the demo backend with
//   "Policy accrual date by anniversary: Please make a selection"
// even though the SDK request body and Rails facade both null out the field
// for unlimited policies. The fixed-per-year update path is unaffected and
// still exercises the same Edit -> rename -> Save & continue -> detail loop.
async function createFixedPolicy(
  page: import('@playwright/test').Page,
  policyName: string,
): Promise<void> {
  await page.goto('/?flow=time-off')
  await waitForLoadingComplete(page)

  await expect(page.getByRole('heading', { name: /time off policies/i })).toBeVisible({
    timeout: 30000,
  })

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
  await waitForLoadingComplete(page, 60000)

  await expect(page.getByRole('heading', { name: /policy settings/i })).toBeVisible({
    timeout: 30000,
  })

  await page.getByRole('button', { name: /^save$/i }).click()
  await waitForLoadingComplete(page, 60000)

  await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
    timeout: 30000,
  })
  await page.getByRole('button', { name: /^continue$/i }).click()
  await waitForLoadingComplete(page, 60000)

  await expect(page.getByRole('heading', { name: new RegExp(policyName, 'i') })).toBeVisible({
    timeout: 30000,
  })
}

test.describe('TimeOffFlow - edit policy lifecycle', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'time-off/time-off-policy-create-validation',
    })
  })

  test('renames a policy via the edit flow and returns to the detail view with the new name', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(240_000)

    const originalName = `E2E Edit ${Date.now()}`
    const renamed = `${originalName} Renamed`

    await createFixedPolicy(page, originalName)

    await page.getByRole('button', { name: /edit policy/i }).click()
    await waitForLoadingComplete(page)

    await expect(
      page.getByRole('heading', { name: new RegExp(`Edit ${originalName}`, 'i') }),
    ).toBeVisible({ timeout: 30000 })

    const nameField = page.getByLabel(/policy name/i)
    await nameField.fill(renamed)

    await page.getByRole('button', { name: /save.*continue|^continue$/i }).click()
    await waitForLoadingComplete(page, 60000)

    await expect(page.getByRole('heading', { name: new RegExp(renamed, 'i') })).toBeVisible({
      timeout: 30000,
    })
    await expect(page.getByRole('button', { name: /edit policy/i })).toBeVisible()
  })
})
