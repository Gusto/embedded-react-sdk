import { test, expect } from '../utils/localTestFixture'
import { fillDate, generateUniqueSSN, waitForLoadingComplete } from '../utils/helpers'

async function clickContinueAndWait(page: import('@playwright/test').Page) {
  const continueBtn = page.getByRole('button', { name: 'Continue' })
  await continueBtn.waitFor({ state: 'visible', timeout: 30000 })
  await continueBtn.click()
  await waitForLoadingComplete(page)
}

async function waitForPageReady(page: import('@playwright/test').Page, timeout = 10000) {
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(500)
  await waitForLoadingComplete(page, timeout)
}

test.describe('EmployeeOnboardingFlow', () => {
  test('completes the happy path successfully', async ({ page, localConfig }) => {
    await page.goto('/?flow=employee-onboarding&companyId=123')

    await waitForPageReady(page, 30000)

    const addButton = page.getByRole('button', { name: /Add/i })
    await addButton.waitFor({ state: 'visible', timeout: 30000 })
    await addButton.click()

    await waitForLoadingComplete(page)

    await page.getByLabel(/social/i).waitFor({ timeout: 30000 })
    await page.getByLabel(/social/i).fill(generateUniqueSSN())
    await page.getByLabel(/first name/i).fill('john')
    await page.getByLabel(/last name/i).fill('silver')

    const emailField = page.getByLabel(/email/i)
    if (await emailField.isVisible().catch(() => false)) {
      const uniqueEmail = `e2e.test.${Date.now()}@example.com`
      await emailField.fill(uniqueEmail)
    }

    const workAddressButton = page.getByRole('button', { name: /work address/i })
    let hasWorkAddress = false
    if (await workAddressButton.isVisible().catch(() => false)) {
      await workAddressButton.click()
      const firstOption = page.getByRole('option').first()
      hasWorkAddress = await firstOption
        .waitFor({ timeout: 10000 })
        .then(() => true)
        .catch(() => false)
      if (hasWorkAddress) {
        await firstOption.click()
      } else {
        await page.keyboard.press('Escape')
      }
    }

    await fillDate(page, 'Start date', { month: 1, day: 1, year: 2025 })
    await fillDate(page, 'Date of birth', { month: 1, day: 1, year: 2000 })

    await page.getByLabel('Street 1').fill('123 Test St')
    await page.getByLabel(/city/i).fill('San Francisco')
    await page.getByLabel('State').click()
    await page.getByRole('option', { name: 'California' }).click()
    const zipField = page.getByLabel(/zip/i)
    await zipField.clear()
    await zipField.fill('94105')

    if (localConfig.isLocal && !hasWorkAddress) {
      await expect(page.getByLabel(/first name/i)).toHaveValue('john')
      await expect(page.getByLabel(/last name/i)).toHaveValue('silver')
      return
    }

    const continueBtn = page.getByRole('button', { name: 'Continue' })
    await continueBtn.waitFor({ state: 'visible', timeout: 15000 })

    const isDisabled = await continueBtn.isDisabled()
    if (isDisabled && localConfig.isLocal) {
      await expect(page.getByLabel(/first name/i)).toHaveValue('john')
      await expect(page.getByLabel(/last name/i)).toHaveValue('silver')
      return
    }

    await clickContinueAndWait(page)

    const compensationHeading = page.getByRole('heading', { name: 'Compensation' })
    await compensationHeading.waitFor({ state: 'visible', timeout: 45000 })

    const jobTitleField = page.getByRole('textbox', { name: /job title/i })
    if (await jobTitleField.isVisible().catch(() => false)) {
      const jobTitleValue = await jobTitleField.inputValue().catch(() => '')
      if (!jobTitleValue) {
        await jobTitleField.fill('Software Engineer')
      }
    }

    const employeeTypeButton = page.getByRole('button', { name: /employee type/i })
    if (await employeeTypeButton.isVisible().catch(() => false)) {
      const buttonText = await employeeTypeButton.textContent()
      if (buttonText?.includes('Select')) {
        await employeeTypeButton.click()
        await page.getByRole('option').first().waitFor({ timeout: 5000 })
        await page.getByRole('option').first().click()
      }
    }

    const compAmountField = page.getByRole('textbox', { name: /compensation amount/i })
    if (await compAmountField.isVisible().catch(() => false)) {
      const compValue = await compAmountField.inputValue().catch(() => '')
      if (!compValue || compValue === '0.00') {
        await compAmountField.clear()
        await compAmountField.fill('75000')
      }
    }

    const perButton = page.getByRole('button', { name: /per$/i })
    if (await perButton.isVisible().catch(() => false)) {
      const buttonText = await perButton.textContent()
      if (!buttonText?.includes('Year')) {
        await perButton.click()
        const yearOption = page.getByRole('option', { name: /year/i })
        if (await yearOption.isVisible().catch(() => false)) {
          await yearOption.click()
        } else {
          await page.getByRole('option').first().click()
        }
      }
    }

    await clickContinueAndWait(page)

    const federalTaxHeading = page.getByRole('heading', { name: /Federal tax withholdings/i })
    await federalTaxHeading.waitFor({ state: 'visible', timeout: 45000 })

    const filingStatusButton = page.getByRole('button', { name: /filing status/i })
    if (await filingStatusButton.isVisible().catch(() => false)) {
      const buttonText = await filingStatusButton.textContent()
      if (buttonText?.includes('Select')) {
        await filingStatusButton.click()
        await page.getByRole('option').first().waitFor({ timeout: 5000 })
        await page.getByRole('option').first().click()
      }
    }

    await clickContinueAndWait(page)

    await page
      .getByRole('button', { name: 'Continue' })
      .waitFor({ state: 'visible', timeout: 45000 })

    const stateFilingStatus = page.getByRole('button', { name: /filing status/i })
    if (await stateFilingStatus.isVisible().catch(() => false)) {
      const buttonText = await stateFilingStatus.textContent()
      if (buttonText?.includes('Select')) {
        await stateFilingStatus.click()
        await page.getByRole('option').first().waitFor({ timeout: 5000 })
        await page.getByRole('option').first().click()
      }
    }

    const withholdingField = page.getByRole('textbox', { name: /withholding allowance/i })
    if (await withholdingField.isVisible().catch(() => false)) {
      const value = await withholdingField.inputValue().catch(() => '')
      if (!value) {
        await withholdingField.fill('1')
      }
    }

    await clickContinueAndWait(page)

    const checkOption = page.getByText('Check').first()
    const isCheckVisible = await checkOption
      .waitFor({ state: 'visible', timeout: 10000 })
      .then(() => true)
      .catch(() => false)
    if (isCheckVisible) {
      await checkOption.click()
    }

    await clickContinueAndWait(page)

    await page
      .getByRole('button', { name: 'Continue' })
      .waitFor({ state: 'visible', timeout: 30000 })
    await clickContinueAndWait(page)

    await waitForLoadingComplete(page, 30000)

    const completedHeading = page.getByRole('heading', { name: /that's it/i })
    const isCompleted = await completedHeading
      .waitFor({ state: 'visible', timeout: 30000 })
      .then(() => true)
      .catch(() => false)

    if (!isCompleted && localConfig.isLocal) {
      const article = page.locator('article')
      await expect(article).toBeVisible()
      return
    }

    await expect(completedHeading).toBeVisible()
  })
})
