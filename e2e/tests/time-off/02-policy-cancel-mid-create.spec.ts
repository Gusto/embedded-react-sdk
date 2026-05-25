import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('TimeOffFlow - cancel mid-create returns to list', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test('cancel from policy details form returns to the policy list', async ({ page, scenario }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(120_000)

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

    await expect(page.getByRole('heading', { name: /policy details/i })).toBeVisible({
      timeout: 30000,
    })

    await page.getByLabel(/policy name/i).fill('E2E Cancel Draft')
    await page.getByRole('button', { name: /^cancel$/i }).click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /time off policies/i })).toBeVisible({
      timeout: 30000,
    })

    await expect(
      page.getByRole('row').filter({ has: page.getByText('E2E Cancel Draft', { exact: true }) }),
    ).not.toBeVisible({ timeout: 5000 })
  })
})
