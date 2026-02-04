import { test, expect } from '@playwright/test'
import { fillDate } from '../utils/helpers'

test.describe('EmployeeOnboardingFlow', () => {
  test('completes the happy path successfully', async ({ page }) => {
    await page.goto('/?flow=employee-onboarding&companyId=123')

    // Page - Add employee
    await page.getByRole('button', { name: /Add/i }).waitFor()
    await page.getByRole('button', { name: /Add/i }).click()

    // Page - Personal Details (Admin)
    await page.getByLabel(/social/i).waitFor()
    await page.getByLabel(/social/i).fill('456789012')
    await page.getByLabel(/first name/i).fill('john')
    await page.getByLabel(/last name/i).fill('silver')

    const emailField = page.getByLabel(/email/i)
    if (await emailField.isVisible()) {
      await emailField.fill('someone@definitely-not-gusto.com')
    }

    // Work address (required for admin profile)
    const workAddressField = page.getByLabel(/work address/i)
    if (await workAddressField.isVisible()) {
      await workAddressField.click()
      await page.getByRole('option', { name: /123 Main St/i }).click()
    }

    // Dates
    await fillDate(page, 'Start date', { month: 1, day: 1, year: 2025 })
    await fillDate(page, 'Date of birth', { month: 1, day: 1, year: 2000 })

    // Home address
    await page.getByLabel('Street 1').fill('123 Any St')
    await page.getByLabel(/city/i).fill('Redmond')
    await page.getByLabel('State').click()
    await page.getByRole('option', { name: 'Washington' }).click()
    const zipField = page.getByLabel(/zip/i)
    await zipField.clear()
    await zipField.fill('98074')

    await page.getByRole('button', { name: 'Continue' }).click()

    // Page - Compensation (pre-filled from fixture)
    await page.getByRole('heading', { name: 'Compensation' }).waitFor()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Page - Federal Taxes (pre-filled from fixture)
    await page.getByRole('heading', { name: /Federal tax withholdings/i }).waitFor()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Page - State Taxes (pre-filled)
    await page.getByRole('button', { name: 'Continue' }).click()

    // Page - Payment method
    const checkOption = page.getByText('Check').first()
    const isCheckVisible = await checkOption
      .waitFor({ state: 'visible', timeout: 1000 })
      .then(() => true)
      .catch(() => false)
    if (isCheckVisible) {
      await checkOption.click()
    }
    await page.getByRole('button', { name: 'Continue' }).click()

    // Final pages - click through remaining steps (deductions/summary)
    await page.getByRole('button', { name: 'Continue' }).waitFor({ timeout: 5000 })
    await page.getByRole('button', { name: 'Continue' }).click()

    // Page - Completed
    await expect(page.getByText(/that's it/i)).toBeVisible({ timeout: 15000 })
  })
})
