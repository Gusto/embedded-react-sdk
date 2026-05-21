import { test, expect } from '../../utils/localTestFixture'
import {
  OVERVIEW_HEADING,
  BEGIN_ONBOARDING_BUTTON,
  landOnCompanyOnboarding,
} from '../../utils/companyFlowDrivers'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('CompanyOnboarding — step navigation', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'company/fresh-with-hq-location',
    })
  })

  test('shows progress bar after entering first onboarding step', async ({ page }) => {
    await landOnCompanyOnboarding(page)

    await page.getByRole('button', { name: BEGIN_ONBOARDING_BUTTON }).click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /address/i })).toBeVisible({
      timeout: 30000,
    })
    await expect(page.getByRole('progressbar')).toBeVisible()
  })

  test('back button on first step returns to onboarding overview when present', async ({
    page,
  }) => {
    await landOnCompanyOnboarding(page)

    await page.getByRole('button', { name: BEGIN_ONBOARDING_BUTTON }).click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /address/i })).toBeVisible({
      timeout: 30000,
    })

    const backButton = page.getByRole('button', { name: /^back$/i })
    if (await backButton.isVisible().catch(() => false)) {
      await backButton.click()
      await waitForLoadingComplete(page)
      await expect(page.getByRole('heading', { name: OVERVIEW_HEADING })).toBeVisible({
        timeout: 30000,
      })
    }
  })
})
