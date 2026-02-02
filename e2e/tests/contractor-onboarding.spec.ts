import { test, expect } from '@playwright/test'

async function fillDate(
  page: import('@playwright/test').Page,
  name: string,
  date: { month: number; day: number; year: number },
) {
  const dateGroup = page.getByRole('group', { name })
  await dateGroup.getByRole('spinbutton', { name: /month/i }).fill(String(date.month))
  await dateGroup.getByRole('spinbutton', { name: /day/i }).fill(String(date.day))
  await dateGroup.getByRole('spinbutton', { name: /year/i }).fill(String(date.year))
}

test.describe('ContractorOnboardingFlow', () => {
  test('displays the contractor list and can navigate to add contractor', async ({ page }) => {
    await page.goto('/?flow=contractor-onboarding&companyId=123')

    // Page - Contractor List
    await page.getByRole('heading', { name: /contractor/i }).waitFor()

    // Verify list is visible
    await expect(page.getByRole('heading', { name: /contractor/i })).toBeVisible()

    // Click Add Contractor button
    const addButton = page.getByRole('button', { name: /add/i })
    await addButton.waitFor()
    await addButton.click()

    // Page - Profile
    await page.getByRole('heading', { name: /profile|contractor/i }).waitFor()
    await expect(page.getByRole('heading', { name: /profile|contractor/i })).toBeVisible()
  })

  test('can fill out the contractor profile form', async ({ page }) => {
    await page.goto('/?flow=contractor-onboarding&companyId=123')

    // Page - Contractor List
    await page.getByRole('heading', { name: /contractor/i }).waitFor()
    await page.getByRole('button', { name: /add/i }).click()

    // Page - Profile
    await page.getByRole('heading', { name: /profile|contractor/i }).waitFor()

    // Select contractor type - Individual
    const individualRadio = page.getByRole('radio', { name: /individual/i })
    if (await individualRadio.isVisible().catch(() => false)) {
      await individualRadio.click()
    }

    // Fill profile information
    await page.getByLabel(/first name/i).fill('Jane')
    await page.getByLabel(/last name/i).fill('Contractor')

    // SSN field
    const ssnField = page.getByLabel(/social security/i)
    if (await ssnField.isVisible().catch(() => false)) {
      await ssnField.fill('456789012')
    }

    // Start date
    await fillDate(page, 'Start Date', { month: 1, day: 15, year: 2025 })

    // Verify form is filled
    await expect(page.getByLabel(/first name/i)).toHaveValue('Jane')
    await expect(page.getByLabel(/last name/i)).toHaveValue('Contractor')

    // Create contractor
    await page.getByRole('button', { name: /create contractor/i }).click()

    // Should proceed to next step (Address)
    await expect(page.getByRole('heading', { name: /address/i })).toBeVisible({ timeout: 10000 })
  })

  test('can navigate back to contractor list from profile', async ({ page }) => {
    await page.goto('/?flow=contractor-onboarding&companyId=123')

    // Page - Contractor List
    await page.getByRole('heading', { name: /contractor/i }).waitFor()
    await page.getByRole('button', { name: /add/i }).click()

    // Page - Profile
    await page.getByRole('heading', { name: /profile|contractor/i }).waitFor()

    // Click back button
    const backButton = page.getByRole('button', { name: /back/i })
    if (await backButton.isVisible().catch(() => false)) {
      await backButton.click()

      // Should return to contractor list
      await expect(page.getByRole('heading', { name: /contractor/i })).toBeVisible({
        timeout: 5000,
      })
    }
  })
})
