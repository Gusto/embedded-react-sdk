import { test, expect } from '@playwright/test'

test.describe('CompanyOnboardingFlow', () => {
  test('displays the onboarding overview with all steps', async ({ page }) => {
    await page.goto('/?flow=company-onboarding&companyId=123')

    // Page - Onboarding Overview - should show the list of steps
    await page.getByRole('heading', { name: /get started|let's get started/i }).waitFor()
    await expect(
      page.getByRole('heading', { name: /get started|let's get started/i }),
    ).toBeVisible()

    // Verify steps are displayed (using headings to be more specific)
    await expect(
      page.getByRole('heading', { name: /company addresses|add company/i }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: /federal tax/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /industry/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /payroll account|bank/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /employees/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /pay schedule/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /state tax/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /sign documents/i })).toBeVisible()

    // Verify the start button exists
    await expect(page.getByRole('button', { name: /start onboarding/i })).toBeVisible()
  })

  test('can navigate to first step (Company addresses)', async ({ page }) => {
    await page.goto('/?flow=company-onboarding&companyId=123')

    // Page - Onboarding Overview
    await page.getByRole('button', { name: /start onboarding/i }).waitFor()
    await page.getByRole('button', { name: /start onboarding/i }).click()

    // Page - Locations (Company addresses)
    await page.getByRole('heading', { name: /address/i }).waitFor()
    await expect(page.getByRole('heading', { name: /address/i })).toBeVisible()

    // Verify the progress bar shows step 1
    await expect(page.getByRole('progressbar')).toBeVisible()
  })

  test('can continue through locations to federal taxes', async ({ page }) => {
    await page.goto('/?flow=company-onboarding&companyId=123')

    // Page - Onboarding Overview
    await page.getByRole('button', { name: /start onboarding/i }).waitFor()
    await page.getByRole('button', { name: /start onboarding/i }).click()

    // Page - Locations (Company addresses)
    await page.getByRole('heading', { name: /address/i }).waitFor()
    await page.getByRole('button', { name: /continue/i }).click()

    // Page - Federal Taxes
    await page.getByRole('heading', { name: /federal tax/i }).waitFor()
    await expect(page.getByRole('heading', { name: /federal tax/i })).toBeVisible()
  })

  test('can navigate through federal taxes to industry', async ({ page }) => {
    await page.goto('/?flow=company-onboarding&companyId=123')

    // Navigate through to Federal Taxes
    await page.getByRole('button', { name: /start onboarding/i }).waitFor()
    await page.getByRole('button', { name: /start onboarding/i }).click()
    await page.getByRole('heading', { name: /address/i }).waitFor()
    await page.getByRole('button', { name: /continue/i }).click()
    await page.getByRole('heading', { name: /federal tax/i }).waitFor()
    await page.getByRole('button', { name: /continue/i }).click()

    // Page - Industry
    await page.getByRole('heading', { name: /industry/i }).waitFor()
    await expect(page.getByRole('heading', { name: /industry/i })).toBeVisible()
  })
})
