import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('CompanyOnboardingFlow', () => {
  const overviewHeading = /get started|let's get started|we need a few more details/i
  const beginOnboardingButton = /start onboarding|continue onboarding/i

  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'company/company-onboarding',
    })
  })

  test('displays the onboarding overview with all steps', async ({ page }) => {
    await page.goto('/?flow=company-onboarding')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: overviewHeading })).toBeVisible({
      timeout: 30000,
    })

    await expect(page.getByText(/company addresses/i).first()).toBeVisible()
    await expect(page.getByText(/federal tax/i).first()).toBeVisible()
    await expect(page.getByText(/industry/i).first()).toBeVisible()
    await expect(page.getByText(/employees/i).first()).toBeVisible()

    await expect(page.getByRole('button', { name: beginOnboardingButton })).toBeVisible()
  })

  test('can navigate to first step (Company addresses)', async ({ page }) => {
    await page.goto('/?flow=company-onboarding')
    await waitForLoadingComplete(page)

    await page.getByRole('button', { name: beginOnboardingButton }).click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /address/i })).toBeVisible({ timeout: 30000 })
    await expect(page.getByRole('progressbar')).toBeVisible()
  })

  test('can continue through locations to federal taxes', async ({ page }) => {
    await page.goto('/?flow=company-onboarding')
    await waitForLoadingComplete(page)

    await page.getByRole('button', { name: beginOnboardingButton }).click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /address/i })).toBeVisible({ timeout: 30000 })
    await page.getByRole('button', { name: /continue/i }).click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /federal tax/i })).toBeVisible({
      timeout: 30000,
    })
  })

  test('can navigate through federal taxes to industry', async ({ page }) => {
    await page.goto('/?flow=company-onboarding')
    await waitForLoadingComplete(page)

    await page.getByRole('button', { name: beginOnboardingButton }).click()
    await waitForLoadingComplete(page)
    await expect(page.getByRole('heading', { name: /address/i })).toBeVisible({ timeout: 30000 })
    await page.getByRole('button', { name: /continue/i }).click()
    await waitForLoadingComplete(page)
    await expect(page.getByRole('heading', { name: /federal tax/i })).toBeVisible({
      timeout: 30000,
    })

    const einField = page.getByLabel(/federal ein/i)
    if (await einField.isVisible().catch(() => false)) {
      const uniqueEIN = `${Math.floor(Math.random() * 89 + 10)}-${Math.floor(Math.random() * 8999999 + 1000000)}`
      await einField.clear()
      await einField.fill(uniqueEIN)
    }

    const taxpayerButton = page.getByRole('button', { name: /taxpayer type/i })
    if (await taxpayerButton.isVisible().catch(() => false)) {
      const buttonText = await taxpayerButton.textContent()
      if (buttonText?.includes('Select')) {
        await taxpayerButton.click()
        await page.getByRole('listbox').getByRole('option').first().click()
      }
    }

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
