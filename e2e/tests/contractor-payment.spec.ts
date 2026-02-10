import { test, expect } from '../utils/localTestFixture'

test.describe('ContractorPaymentFlow', () => {
  test('loads the payment flow page', async ({ page }) => {
    await page.goto('/?flow=contractor-payment&companyId=123')

    // The page should show either:
    // - A heading with "payment"
    // - A create button
    // - An error (which we can report)
    // - A table/grid
    const pageContent = page.locator('article')
    await expect(pageContent).toBeVisible()
  })

  test('shows create payment button', async ({ page }) => {
    await page.goto('/?flow=contractor-payment&companyId=123')

    // Wait for loading to complete
    await page.waitForLoadState('networkidle')

    // Look for "New payment" button - use first() since there may be multiple in different UI states
    const newPaymentButton = page.getByRole('button', { name: /new payment/i }).first()
    await expect(newPaymentButton).toBeVisible({ timeout: 15000 })
  })
})
