import { test, expect } from '@playwright/test'

test.describe('ContractorPaymentFlow', () => {
  test('loads the payment flow page', async ({ page }) => {
    await page.goto('/?flow=contractor-payment&companyId=123')

    // Wait for the page to load - check for any content
    await page.waitForTimeout(2000)

    // The page should show either:
    // - A heading with "payment"
    // - A create button
    // - An error (which we can report)
    // - A table/grid
    const pageContent = page.locator('article')
    await expect(pageContent).toBeVisible({ timeout: 30000 })
  })

  test('shows create payment button', async ({ page }) => {
    await page.goto('/?flow=contractor-payment&companyId=123')

    // Wait for initial load
    await page.waitForTimeout(2000)

    // Look for "New payment" button specifically
    const newPaymentButton = page.getByRole('button', { name: /new payment/i })
    await expect(newPaymentButton).toBeVisible({ timeout: 30000 })
  })
})
