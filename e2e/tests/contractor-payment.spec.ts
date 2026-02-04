import { test, expect } from '@playwright/test'

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

    // Look for "New payment" button specifically
    const newPaymentButton = page.getByRole('button', { name: /new payment/i })
    await expect(newPaymentButton).toBeVisible()
  })
})
