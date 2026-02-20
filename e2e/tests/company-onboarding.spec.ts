import { test, expect } from '../utils/localTestFixture'
import { waitForLoadingComplete, waitForContentOrLoading } from '../utils/helpers'

test.describe('CompanyOnboardingFlow', () => {
  test('displays the onboarding overview with all steps', async ({ page }) => {
    await page.goto('/?flow=company-onboarding&companyId=123')

    await waitForLoadingComplete(page)

    // Page - Onboarding Overview - should show the list of steps
    await expect(page.getByRole('heading', { name: /get started|let's get started/i })).toBeVisible(
      { timeout: 30000 },
    )

    // Verify key steps are displayed (using first() to handle multiple matches)
    await expect(
      page.getByRole('heading', { name: /company addresses|add company/i }).first(),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: /federal tax/i }).first()).toBeVisible()
    await expect(page.getByRole('heading', { name: /industry/i }).first()).toBeVisible()
    await expect(page.getByRole('heading', { name: /employees/i }).first()).toBeVisible()

    // Verify the start button exists
    await expect(page.getByRole('button', { name: /start onboarding/i })).toBeVisible()
  })

  test('can navigate to first step (Company addresses)', async ({ page }) => {
    await page.goto('/?flow=company-onboarding&companyId=123')

    await waitForLoadingComplete(page)

    // Page - Onboarding Overview
    await page.getByRole('button', { name: /start onboarding/i }).click()

    await waitForLoadingComplete(page)

    // Page - Locations (Company addresses)
    await expect(page.getByRole('heading', { name: /address/i })).toBeVisible({ timeout: 30000 })

    // Verify the progress bar shows step 1
    await expect(page.getByRole('progressbar')).toBeVisible()
  })

  test('can continue through locations to federal taxes', async ({ page }) => {
    await page.goto('/?flow=company-onboarding&companyId=123')

    await waitForLoadingComplete(page)

    // Page - Onboarding Overview
    await page.getByRole('button', { name: /start onboarding/i }).click()

    await waitForLoadingComplete(page)

    // Page - Locations (Company addresses)
    await expect(page.getByRole('heading', { name: /address/i })).toBeVisible({ timeout: 30000 })
    await page.getByRole('button', { name: /continue/i }).click()

    await waitForLoadingComplete(page)

    // Page - Federal Taxes
    await expect(page.getByRole('heading', { name: /federal tax/i })).toBeVisible({
      timeout: 30000,
    })
  })

  test('can navigate through federal taxes to industry', async ({ page }) => {
    await page.goto('/?flow=company-onboarding&companyId=123')

    await waitForLoadingComplete(page)

    // Navigate through to Federal Taxes
    await page.getByRole('button', { name: /start onboarding/i }).click()
    await waitForLoadingComplete(page)
    await expect(page.getByRole('heading', { name: /address/i })).toBeVisible({ timeout: 30000 })
    await page.getByRole('button', { name: /continue/i }).click()
    await waitForLoadingComplete(page)
    await expect(page.getByRole('heading', { name: /federal tax/i })).toBeVisible({
      timeout: 30000,
    })

    // Fill required Federal EIN - generate a unique one to avoid "already in use" errors
    const einField = page.getByLabel(/federal ein/i)
    if (await einField.isVisible().catch(() => false)) {
      const uniqueEIN = `${Math.floor(Math.random() * 89 + 10)}-${Math.floor(Math.random() * 8999999 + 1000000)}`
      await einField.clear()
      await einField.fill(uniqueEIN)
    }

    // Select taxpayer type if dropdown is present and empty
    const taxpayerButton = page.getByRole('button', { name: /taxpayer type/i })
    if (await taxpayerButton.isVisible().catch(() => false)) {
      const buttonText = await taxpayerButton.textContent()
      if (buttonText?.includes('Select')) {
        await taxpayerButton.click()
        await page.getByRole('option').first().click()
      }
    }

    // Fill legal entity name if empty
    const legalNameField = page.getByLabel(/legal entity name/i)
    if (await legalNameField.isVisible().catch(() => false)) {
      const currentValue = await legalNameField.inputValue()
      if (!currentValue) {
        await legalNameField.fill('E2E Test Company LLC')
      }
    }

    await page.getByRole('button', { name: /continue/i }).click()

    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /industry/i })).toBeVisible({ timeout: 30000 })
  })
})
