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
})
