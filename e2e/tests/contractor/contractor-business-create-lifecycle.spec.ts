import { test, expect } from '../../utils/localTestFixture'
import { fillDate, waitForLoadingComplete } from '../../utils/helpers'

test.describe('ContractorOnboardingFlow - Business contractor create lifecycle', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'contractor/contractor-onboarding',
    })
  })

  test('creates a Business contractor and advances to the address step', async ({ page }) => {
    test.setTimeout(180_000)

    await page.goto('/?flow=contractor-onboarding')
    await waitForLoadingComplete(page, 30000)

    await page.getByRole('button', { name: /add.*contractor|^add$/i }).click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /contractor profile/i })).toBeVisible({
      timeout: 30000,
    })

    await page.getByRole('radio', { name: /^business$/i }).check()

    await page.getByLabel(/business name/i).fill('Bright Acme E2E LLC')

    const einField = page.getByLabel(/^ein$/i)
    if (await einField.isVisible().catch(() => false)) {
      const { generateUniqueEIN } = await import('../../utils/helpers')
      await einField.fill(generateUniqueEIN())
    }

    await page.getByRole('radio', { name: /^fixed$/i }).check()

    await fillDate(page, 'Start Date', { month: 1, day: 15, year: 2025 })

    await page.getByRole('button', { name: /create contractor/i }).click()
    await waitForLoadingComplete(page, 60000)

    await expect(
      page
        .getByRole('heading', { name: /address/i })
        .or(page.getByRole('heading', { name: /new hire/i })),
    ).toBeVisible({ timeout: 30000 })
  })
})
