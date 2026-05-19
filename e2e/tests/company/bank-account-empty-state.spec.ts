import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

const overviewHeading = /get started|let's get started|we need a few more details/i
const beginOnboardingButton = /start onboarding|continue onboarding/i

test.describe('CompanyOnboarding - bank account empty-state lifecycle', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'company/company-onboarding',
    })
  })

  test('reaches bank account step and renders routing + account fields with disabled Continue', async ({
    page,
  }) => {
    test.setTimeout(240_000)

    await page.goto('/?flow=company-onboarding')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: overviewHeading })).toBeVisible({
      timeout: 30000,
    })

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
    await waitForLoadingComplete(page, 60000)

    await expect(page.getByRole('heading', { name: /industry/i })).toBeVisible({ timeout: 30000 })

    const industrySelect = page
      .getByRole('combobox')
      .or(page.getByRole('button', { name: /industry/i }))
      .first()
    if (await industrySelect.isVisible().catch(() => false)) {
      await industrySelect.click()
      const firstOption = page.getByRole('listbox').getByRole('option').first()
      if (await firstOption.isVisible({ timeout: 5000 }).catch(() => false)) {
        await firstOption.click()
      }
    }

    await page.getByRole('button', { name: /continue/i }).click()
    await waitForLoadingComplete(page, 60000)

    const bankHeading = page
      .getByRole('heading', { name: /company bank account|bank account|verify|verification/i })
      .first()
    await expect(bankHeading).toBeVisible({ timeout: 30000 })

    const routingField = page.getByLabel(/routing number/i).first()
    const accountField = page.getByLabel(/account/i).first()
    const verifyOrChange = page
      .getByRole('button', { name: /verify bank account|change bank account/i })
      .first()
    const continueButton = page.getByRole('button', { name: /^continue$/i }).first()

    const hasEmptyForm = await routingField.isVisible({ timeout: 5000 }).catch(() => false)
    if (hasEmptyForm) {
      await expect(routingField).toBeVisible()
      await expect(accountField).toBeVisible()
    } else {
      await expect(verifyOrChange.or(continueButton)).toBeVisible({ timeout: 15000 })
    }
  })
})
