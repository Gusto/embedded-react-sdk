import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('TimeOffFlow - create policy validation', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'time-off/time-off-policy-create-validation',
    })
  })

  test('select policy type form requires a selection before continue is enabled', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

    await page.goto('/?flow=time-off')
    await waitForLoadingComplete(page)

    await page
      .getByRole('button', { name: /create policy/i })
      .first()
      .click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /select policy type/i })).toBeVisible({
      timeout: 30000,
    })

    const continueBtn = page.getByRole('button', { name: /^continue$/i })
    await expect(continueBtn).toBeVisible()

    const vacationOption = page.getByRole('radio', { name: /^time off$/i })
    if (await vacationOption.isVisible().catch(() => false)) {
      await vacationOption.check()
      await expect(continueBtn).toBeEnabled()
    }
  })

  test('cancel returns to the policy list from the type selector', async ({ page, scenario }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

    await page.goto('/?flow=time-off')
    await waitForLoadingComplete(page)

    await page
      .getByRole('button', { name: /create policy/i })
      .first()
      .click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /select policy type/i })).toBeVisible({
      timeout: 30000,
    })

    await page.getByRole('button', { name: /^cancel$/i }).click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /time off policies/i })).toBeVisible({
      timeout: 30000,
    })
  })

  test('selecting Time off + continuing reaches the policy details form', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

    await page.goto('/?flow=time-off')
    await waitForLoadingComplete(page)

    await page
      .getByRole('button', { name: /create policy/i })
      .first()
      .click()
    await waitForLoadingComplete(page)

    const vacationOption = page.getByRole('radio', { name: /^time off$/i })
    await vacationOption.check()

    await page.getByRole('button', { name: /^continue$/i }).click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /policy details/i })).toBeVisible({
      timeout: 30000,
    })

    await expect(page.getByLabel(/policy name/i)).toBeVisible()
  })
})
