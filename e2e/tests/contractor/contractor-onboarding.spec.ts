import { test, expect } from '../../utils/localTestFixture'
import { fillDate, generateUniqueSSN, waitForLoadingComplete } from '../../utils/helpers'

test.describe('ContractorOnboardingFlow', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'contractor/contractor-onboarding',
    })
  })

  test('displays the contractor list and can navigate to add contractor', async ({ page }) => {
    await page.goto('/?flow=contractor-onboarding')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /contractor/i })).toBeVisible({ timeout: 30000 })

    const addButton = page.getByRole('button', { name: /add.*contractor|^add$/i })
    await addButton.click()

    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /profile|contractor/i })).toBeVisible({
      timeout: 30000,
    })
  })

  test('can fill out the contractor profile form', async ({ page }) => {
    await page.goto('/?flow=contractor-onboarding')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /contractor/i })).toBeVisible({ timeout: 30000 })
    await page.getByRole('button', { name: /add/i }).click()

    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /profile|contractor/i })).toBeVisible({
      timeout: 30000,
    })

    const individualRadio = page.getByRole('radio', { name: /individual/i })
    if (await individualRadio.isVisible().catch(() => false)) {
      await individualRadio.click()
    }

    const uniqueSuffix = Date.now().toString().slice(-6)
    const firstNameField = page.getByLabel(/first name/i)
    await firstNameField.fill(`Jane${uniqueSuffix}`)
    await page.getByLabel(/last name/i).fill('TestContractor')

    const ssnField = page.getByLabel(/social security/i)
    if (await ssnField.isVisible().catch(() => false)) {
      await ssnField.fill(generateUniqueSSN())
    }

    await fillDate(page, 'Start Date', { month: 1, day: 15, year: 2025 })

    await expect(firstNameField).toHaveValue(`Jane${uniqueSuffix}`)
    await expect(page.getByLabel(/last name/i)).toHaveValue('TestContractor')

    const createButton = page.getByRole('button', { name: /create contractor/i })
    await createButton.click()

    await waitForLoadingComplete(page)

    const article = page.locator('article')
    await expect(article).toBeVisible()
  })

  test('can navigate back to contractor list from profile', async ({ page }) => {
    await page.goto('/?flow=contractor-onboarding')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /contractor/i })).toBeVisible({ timeout: 30000 })
    await page.getByRole('button', { name: /add/i }).click()

    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /profile|contractor/i })).toBeVisible({
      timeout: 30000,
    })

    const backButton = page.getByRole('button', { name: /back/i })
    if (await backButton.isVisible().catch(() => false)) {
      await backButton.click()

      await waitForLoadingComplete(page)

      await expect(page.getByRole('heading', { name: /contractor/i })).toBeVisible({
        timeout: 30000,
      })
    }
  })
})
