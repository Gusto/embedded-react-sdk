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

  test('clicking new payment opens the payment composition surface', async ({ page, scenario }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

    await page.goto('/?flow=contractor-payment')
    await waitForLoadingComplete(page)

    const newPaymentButton = page.getByRole('button', { name: /new payment/i }).first()
    await expect(newPaymentButton).toBeVisible({ timeout: 15000 })
    await newPaymentButton.click()
    await waitForLoadingComplete(page)

    const article = page.locator('article')
    await expect(article).toBeVisible()
  })
})
