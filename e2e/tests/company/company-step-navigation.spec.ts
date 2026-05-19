import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

const overviewHeading = /get started|let's get started|we need a few more details/i
const beginOnboardingButton = /start onboarding|continue onboarding/i

test.describe('CompanyOnboarding — step navigation', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'company/company-onboarding',
    })
  })

  test('shows progress bar after entering first onboarding step', async ({ page }) => {
    await page.goto('/?flow=company-onboarding')
    await waitForLoadingComplete(page)

    await page.getByRole('button', { name: beginOnboardingButton }).click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /address/i })).toBeVisible({
      timeout: 30000,
    })
    await expect(page.getByRole('progressbar')).toBeVisible()
  })

  test('back button on first step returns to onboarding overview when present', async ({
    page,
  }) => {
    await page.goto('/?flow=company-onboarding')
    await waitForLoadingComplete(page)

    await page.getByRole('button', { name: beginOnboardingButton }).click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /address/i })).toBeVisible({
      timeout: 30000,
    })

    const backButton = page.getByRole('button', { name: /^back$/i })
    if (await backButton.isVisible().catch(() => false)) {
      await backButton.click()
      await waitForLoadingComplete(page)
      await expect(page.getByRole('heading', { name: overviewHeading })).toBeVisible({
        timeout: 30000,
      })
    }
  })
})
