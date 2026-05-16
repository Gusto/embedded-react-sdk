import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('TimeOffFlow - fixed accrual policy lifecycle (settings step covered)', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'time-off/time-off-policy-create-validation',
    })
  })

  test('creates a fixed-per-year policy through details + settings + add employees', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(240_000)

    const policyName = `E2E Fixed ${Date.now()}`

    await page.goto('/?flow=time-off')
    await waitForLoadingComplete(page)

    await page
      .getByRole('button', { name: /create policy/i })
      .first()
      .click()
    await waitForLoadingComplete(page)

    await page.getByRole('radio', { name: /^sick leave$/i }).check()
    await page.getByRole('button', { name: /^continue$/i }).click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /policy details/i })).toBeVisible({
      timeout: 30000,
    })

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
    await expect(page.getByRole('button', { name: /edit policy/i })).toBeVisible()
  })
})
