import { test, expect } from '@playwright/test'

test.describe('EmployeeSelfOnboardingFlow', () => {
  test('completes the happy path successfully', async ({ page }) => {
    await page.goto('/?flow=employee-self-onboarding&companyId=123&employeeId=456')

    // Page 1 - Get Started
    await page.getByRole('button', { name: /started/i }).waitFor()
    await page.getByRole('button', { name: /started/i }).click()

    // Page 2 - Personal Details (mostly pre-filled, but SSN may be required)
    await page.getByRole('button', { name: 'Continue' }).waitFor()
    const ssnField = page.getByLabel(/social/i)
    if (await ssnField.isVisible().catch(() => false)) {
      const ssnValue = await ssnField.inputValue()
      if (!ssnValue) {
        await ssnField.fill('456789012')
      }
    }
    await page.getByRole('button', { name: 'Continue' }).click()

    // Page 3 - Federal Taxes (pre-filled from fixture)
    await page.getByRole('heading', { name: /Federal tax withholdings/i }).waitFor()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Page 4 - State Taxes
    await page.getByRole('button', { name: 'Continue' }).waitFor()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Page 5 - Payment method
    const checkOption = page.getByText('Check').first()
    const isCheckVisible = await checkOption
      .waitFor({ state: 'visible', timeout: 1000 })
      .then(() => true)
      .catch(() => false)
    if (isCheckVisible) {
      await checkOption.click()
    }
    await page.getByRole('button', { name: 'Continue' }).click()

    // Page 6 - Sign documents / remaining steps
    await page.getByRole('button', { name: 'Continue' }).waitFor({ timeout: 5000 })
    await page.getByRole('button', { name: 'Continue' }).click()

    // Page 7 - Completed
    await expect(page.getByText(/completed|that's it/i)).toBeVisible()
  })
})
