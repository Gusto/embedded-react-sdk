import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('ContractorOnboardingFlow - edit re-entry from list lifecycle', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test('opens edit on the existing Business contractor and pre-fills the profile form', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(180_000)

    await page.goto('/?flow=contractor-onboarding')
    await waitForLoadingComplete(page, 30000)

    await expect(page.getByRole('heading', { name: /^contractors$/i })).toBeVisible({
      timeout: 30000,
    })

    const businessRow = page
      .getByRole('row')
      .filter({ has: page.getByText(/Acme Consulting/i) })
      .first()
    await expect(businessRow).toBeVisible({ timeout: 15000 })

    const menuTrigger = businessRow.getByRole('button', { name: /open menu/i }).first()
    await expect(menuTrigger).toBeVisible()
    await menuTrigger.click()

    await page
      .getByRole('menuitem', { name: /^edit$/i })
      .first()
      .click()
    await waitForLoadingComplete(page, 30000)

    await expect(page.getByRole('heading', { name: /contractor profile/i })).toBeVisible({
      timeout: 30000,
    })

    await expect(page.getByRole('radio', { name: /^business$/i })).toBeChecked()
    await expect(page.getByLabel(/business name/i)).toHaveValue(/Acme Consulting/i)
    await expect(page.getByRole('button', { name: /^continue$/i })).toBeVisible()
  })
})
