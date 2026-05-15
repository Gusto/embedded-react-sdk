import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('ContractorPaymentFlow', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'contractor/contractor-payment',
    })
  })

  test('loads the payment flow page', async ({ page }) => {
    await page.goto('/?flow=contractor-payment')
    await waitForLoadingComplete(page)

    const pageContent = page.locator('article')
    await expect(pageContent).toBeVisible()
  })

  test('shows create payment button', async ({ page }) => {
    await page.goto('/?flow=contractor-payment')
    await waitForLoadingComplete(page)

    const newPaymentButton = page.getByRole('button', { name: /new payment/i }).first()
    await expect(newPaymentButton).toBeVisible({ timeout: 15000 })
  })

  test('clicking new payment opens the Pay contractors composition page', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

    await page.goto('/?flow=contractor-payment')
    await waitForLoadingComplete(page)

    const newPaymentButton = page.getByRole('button', { name: /new payment/i }).first()
    await expect(newPaymentButton).toBeVisible({ timeout: 15000 })
    await newPaymentButton.click()
    await waitForLoadingComplete(page, 60000)

    await expect(
      page
        .getByRole('heading', { name: /pay contractors/i })
        .or(page.getByRole('heading', { name: /no contractors available/i })),
    ).toBeVisible({ timeout: 30000 })

    await expect(page.getByLabel(/payment date/i)).toBeVisible()
  })
})
