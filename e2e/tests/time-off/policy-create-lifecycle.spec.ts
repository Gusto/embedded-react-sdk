import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('TimeOffFlow - create policy lifecycle', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'time-off/time-off-policy-create-validation',
    })
  })

  test('creates an unlimited policy end-to-end and lands on the policy detail view', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(180_000)

    const policyName = `E2E Vacation ${Date.now()}`

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

    await expect(page.getByRole('heading', { name: /select policy type/i })).toBeVisible({
      timeout: 30000,
    })
    await page.getByRole('radio', { name: /^time off$/i }).check()
    await page.getByRole('button', { name: /^continue$/i }).click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /policy details/i })).toBeVisible({
      timeout: 30000,
    })
    await page.getByLabel(/policy name/i).fill(policyName)

    await page.getByRole('radio', { name: /unlimited/i }).check()

    await page.getByRole('button', { name: /save.*continue|^continue$/i }).click()
    await waitForLoadingComplete(page, 60000)

    await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
      timeout: 30000,
    })

    await page.getByRole('button', { name: /^continue$/i }).click()
    await waitForLoadingComplete(page, 60000)

    await expect(page.getByRole('heading', { name: new RegExp(policyName, 'i') })).toBeVisible({
      timeout: 30000,
    })
    await expect(page.getByRole('button', { name: /time off policies/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /edit policy/i })).toBeVisible()
  })
})
