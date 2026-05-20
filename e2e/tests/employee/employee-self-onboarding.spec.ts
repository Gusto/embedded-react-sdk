import { test, expect } from '../../utils/localTestFixture'
import { generateUniqueSSN, waitForLoadingComplete } from '../../utils/helpers'

test.describe('EmployeeSelfOnboardingFlow', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'employee/employee-self-onboarding',
    })
  })

  test('completes the happy path successfully', async ({ page, scenario }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(180_000)

    await page.goto('/?flow=employee-self-onboarding')
    await waitForLoadingComplete(page, 45000)

    const getStartedButton = page.getByRole('button', { name: /started/i })
    await expect(getStartedButton).toBeVisible({ timeout: 30000 })

    await getStartedButton.click()
    await waitForLoadingComplete(page)

    await page.getByRole('button', { name: 'Continue' }).waitFor()

    const ssnField = page.getByLabel(/social security/i)
    if (await ssnField.isVisible().catch(() => false)) {
      const ssnValue = await ssnField.inputValue()
      if (!ssnValue) {
        await ssnField.fill(generateUniqueSSN())
      }
    }

    const monthSpinner = page.getByRole('spinbutton', { name: /month.*date of birth/i })
    const monthVisible = await monthSpinner.isVisible().catch(() => false)
    if (monthVisible) {
      const monthValue = await monthSpinner.inputValue().catch(() => '')
      if (!monthValue || monthValue === 'mm' || monthValue === '') {
        await monthSpinner.click()
        await monthSpinner.fill('01')
        await page.getByRole('spinbutton', { name: /day.*date of birth/i }).fill('15')
        await page.getByRole('spinbutton', { name: /year.*date of birth/i }).fill('1990')
      }
    }

    const streetField = page.getByLabel('Street 1')
    if (await streetField.isVisible().catch(() => false)) {
      const streetValue = await streetField.inputValue()
      if (!streetValue) {
        await streetField.fill('123 Test Street')
        await page.getByLabel(/city/i).fill('San Francisco')
        await page.getByRole('button', { name: /state/i }).click()
        await page.getByRole('listbox').getByRole('option').first().click()
        await page.getByLabel(/zip/i).fill('94105')
      }
    }

    const continueButton = page.getByRole('button', { name: 'Continue' })
    await continueButton.click()
    await waitForLoadingComplete(page, 30000)

    await expect(page.getByRole('heading', { name: /completed|that's it/i })).toBeVisible({
      timeout: 60_000,
    })
  })
})
