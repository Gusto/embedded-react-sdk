import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('TimeOffFlow - policy details form UI validation lifecycle', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'time-off/time-off-policy-create-validation',
    })
  })

  test('Save & continue is disabled until name + accrual method are present', async ({
    page,
    scenario,
  }) => {
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

    const continueBtn = page
      .getByRole('button', { name: /save.*continue|^continue$/i })
      .filter({ hasNotText: /cancel/i })
      .last()
    await expect(continueBtn).toBeDisabled()

    await page.getByLabel(/policy name/i).fill('E2E Validation Test')
    await expect(continueBtn).toBeDisabled()

    await page.getByRole('radio', { name: /unlimited/i }).check()
    await expect(continueBtn).toBeEnabled()
  })
})
