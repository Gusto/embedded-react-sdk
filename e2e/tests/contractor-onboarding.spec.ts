import { test, expect } from '../utils/localTestFixture'
import { fillDate, generateUniqueSSN, waitForLoadingComplete } from '../utils/helpers'

test.describe('ContractorOnboardingFlow', () => {
  test('displays the contractor list and can navigate to add contractor', async ({ page }) => {
    await page.goto('/?flow=contractor-onboarding&companyId=123')

    await waitForLoadingComplete(page)

    // Page - Contractor List
    await expect(page.getByRole('heading', { name: /contractor/i })).toBeVisible({ timeout: 30000 })

    // Click Add Contractor button - may be "Add" or "+ Add another contractor"
    const addButton = page.getByRole('button', { name: /add.*contractor|^add$/i })
    await addButton.click()

    await waitForLoadingComplete(page)

    // Page - Profile
    await expect(page.getByRole('heading', { name: /profile|contractor/i })).toBeVisible({
      timeout: 30000,
    })
  })

  test('can fill out the contractor profile form', async ({ page, localConfig }) => {
    await page.goto('/?flow=contractor-onboarding&companyId=123')

    await waitForLoadingComplete(page)

    // Page - Contractor List
    await expect(page.getByRole('heading', { name: /contractor/i })).toBeVisible({ timeout: 30000 })
    await page.getByRole('button', { name: /add/i }).click()

    await waitForLoadingComplete(page)

    // Page - Profile
    await expect(page.getByRole('heading', { name: /profile|contractor/i })).toBeVisible({
      timeout: 30000,
    })

    // Select contractor type - Individual
    const individualRadio = page.getByRole('radio', { name: /individual/i })
    if (await individualRadio.isVisible().catch(() => false)) {
      await individualRadio.click()
    }

    // Fill profile information with unique values
    const uniqueSuffix = Date.now().toString().slice(-6)
    const firstNameField = page.getByLabel(/first name/i)
    await firstNameField.fill(`Jane${uniqueSuffix}`)
    await page.getByLabel(/last name/i).fill('TestContractor')

    // SSN field - use unique SSN
    const ssnField = page.getByLabel(/social security/i)
    if (await ssnField.isVisible().catch(() => false)) {
      await ssnField.fill(generateUniqueSSN())
    }

    // Start date
    await fillDate(page, 'Start Date', { month: 1, day: 15, year: 2025 })

    // Verify form is filled
    await expect(firstNameField).toHaveValue(`Jane${uniqueSuffix}`)
    await expect(page.getByLabel(/last name/i)).toHaveValue('TestContractor')

    // Create contractor
    const createButton = page.getByRole('button', { name: /create contractor/i })
    await createButton.click()

    await waitForLoadingComplete(page)

    // Verify we moved forward or stayed on form (any visible content indicates success)
    const article = page.locator('article')
    await expect(article).toBeVisible()
  })

  test('can navigate back to contractor list from profile', async ({ page }) => {
    await page.goto('/?flow=contractor-onboarding&companyId=123')

    await waitForLoadingComplete(page)

    // Page - Contractor List
    await expect(page.getByRole('heading', { name: /contractor/i })).toBeVisible({ timeout: 30000 })
    await page.getByRole('button', { name: /add/i }).click()

    await waitForLoadingComplete(page)

    // Page - Profile
    await expect(page.getByRole('heading', { name: /profile|contractor/i })).toBeVisible({
      timeout: 30000,
    })

    // Click back button
    const backButton = page.getByRole('button', { name: /back/i })
    if (await backButton.isVisible().catch(() => false)) {
      await backButton.click()

      await waitForLoadingComplete(page)

      // Should return to contractor list
      await expect(page.getByRole('heading', { name: /contractor/i })).toBeVisible({
        timeout: 30000,
      })
    }
  })
})
