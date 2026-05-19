import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('ContractorPaymentFlow - create payment full lifecycle through summary', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'contractor/contractor-payment',
    })
  })

  test('enters payment date, edits one contractor with a wage, submits, reaches payment summary', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(240_000)

    await page.goto('/?flow=contractor-payment')
    await waitForLoadingComplete(page, 60000)

    await page
      .getByRole('button', { name: /new payment/i })
      .first()
      .click()
    await waitForLoadingComplete(page, 60000)

    const composition = page.getByRole('heading', { name: /pay contractors/i })
    const empty = page.getByRole('heading', { name: /no contractors available/i })
    await expect(composition.or(empty)).toBeVisible({ timeout: 30000 })

    if (await empty.isVisible().catch(() => false)) {
      await expect(empty).toBeVisible()
      return
    }

    const dateInput = page.getByLabel(/payment date/i)
    await expect(dateInput).toBeVisible()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)
    await dateInput.fill(futureDate.toISOString().slice(0, 10))

    const editTrigger = page.getByRole('button', { name: /edit contractor payment/i }).first()
    await expect(editTrigger).toBeVisible({ timeout: 15000 })
    await editTrigger.click()

    await page
      .getByRole('menuitem', { name: /edit contractor payment/i })
      .first()
      .click()

    const editModal = page.getByRole('heading', { name: /edit contractor pay/i })
    await expect(editModal).toBeVisible({ timeout: 10000 })

    const wageField = page.getByLabel(/^wage$/i)
    const hoursField = page.getByLabel(/^hours$/i)

    if (await wageField.isVisible().catch(() => false)) {
      await wageField.fill('100')
    } else if (await hoursField.isVisible().catch(() => false)) {
      await hoursField.fill('8')
    }

    await page.getByRole('button', { name: /^done$/i }).click()

    await expect(editModal).not.toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: /^continue$/i }).click()
    await waitForLoadingComplete(page, 120_000)

    const summaryHeading = page
      .getByRole('heading', { name: /payment summary|contractor payments/i })
      .first()
    const successAlert = page.getByText(/successfully created/i).first()
    await expect(summaryHeading.or(successAlert)).toBeVisible({ timeout: 60000 })
  })
})
