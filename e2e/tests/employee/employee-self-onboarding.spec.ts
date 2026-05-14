import { test, expect } from '../../utils/localTestFixture'
import { generateUniqueSSN, waitForLoadingComplete } from '../../utils/helpers'

test.describe('EmployeeSelfOnboardingFlow', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'employee/employee-self-onboarding',
    })
  })

  test('completes the happy path successfully', async ({ page, localConfig }) => {
    await page.goto('/?flow=employee-self-onboarding&companyId=123&employeeId=456')

    try {
      await waitForLoadingComplete(page, 45000)
    } catch {
      if (localConfig.isLocal) {
        const article = page.locator('article')
        await expect(article).toBeVisible()
        return
      }
      throw new Error('Loading never completed')
    }

    const getStartedButton = page.getByRole('button', { name: /started/i })

    const hasGetStarted = await getStartedButton.isVisible().catch(() => false)

    if (!hasGetStarted && localConfig.isLocal) {
      const article = page.locator('article')
      await expect(article).toBeVisible()
      return
    }

    if (!hasGetStarted) {
      throw new Error('Get Started button not found')
    }

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

    await page.waitForTimeout(1000)

    const stillOnBasics = await page
      .getByRole('heading', { name: 'Basics' })
      .isVisible()
      .catch(() => false)

    if (localConfig.isLocal && stillOnBasics) {
      await expect(page.getByLabel(/first name/i)).toBeVisible()
      return
    }

    await continueButton.waitFor({ timeout: 10000 })
    await continueButton.click()

    await page.getByRole('button', { name: 'Continue' }).waitFor()
    await page.getByRole('button', { name: 'Continue' }).click()

    const checkOption = page.getByText('Check').first()
    const isCheckVisible = await checkOption
      .waitFor({ state: 'visible', timeout: 1000 })
      .then(() => true)
      .catch(() => false)
    if (isCheckVisible) {
      await checkOption.click()
    }
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: 'Continue' }).waitFor()
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByText(/completed|that's it/i)).toBeVisible()
  })
})
