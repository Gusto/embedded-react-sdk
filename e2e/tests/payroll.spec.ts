import { test, expect } from '@playwright/test'

test.describe('PayrollFlow', () => {
  test('displays the payroll landing page with tabs', async ({ page }) => {
    await page.goto('/?flow=payroll&companyId=123')

    // Page - Payroll Landing (with tabs: Run Payroll, Payroll History)
    await page.getByRole('tab', { name: /run payroll/i }).waitFor()
    await expect(page.getByRole('tab', { name: /run payroll/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /payroll history/i })).toBeVisible()

    // Verify the payrolls grid/table is visible
    await expect(page.getByRole('grid', { name: /payrolls/i })).toBeVisible()
  })

  test('can view payroll blockers when present', async ({ page }) => {
    await page.goto('/?flow=payroll&companyId=123')

    // Page - Payroll Landing
    await page.getByRole('tab', { name: /run payroll/i }).waitFor()

    // Check for blockers alert
    const blockersAlert = page.getByRole('alert')
    const alertVisible = await blockersAlert.isVisible().catch(() => false)

    if (alertVisible) {
      // Click "View All Blockers" if available
      const viewBlockersButton = page.getByRole('button', { name: /view all blockers/i })
      const buttonVisible = await viewBlockersButton.isVisible().catch(() => false)

      if (buttonVisible) {
        await viewBlockersButton.click()

        // Should navigate to blockers page and show heading
        await expect(page.getByRole('heading', { name: /payroll blocker/i })).toBeVisible({
          timeout: 10000,
        })
      }
    } else {
      // Skip test if no blockers alert is present
      test.skip()
    }
  })

  test('can view payroll history tab', async ({ page }) => {
    await page.goto('/?flow=payroll&companyId=123')

    // Page - Payroll Landing
    await page.getByRole('tab', { name: /run payroll/i }).waitFor()

    // Click on History tab
    const historyTab = page.getByRole('tab', { name: /payroll history/i })
    await historyTab.click()

    // Verify history tab is selected
    await expect(historyTab).toHaveAttribute('aria-selected', 'true')

    // Verify history tab is active
    await page.waitForTimeout(500)
    const historyHeading = page.getByRole('heading', { name: /payroll history/i })
    await expect(historyHeading).toBeVisible({ timeout: 10000 })
  })

  test('displays payroll rows with correct information', async ({ page }) => {
    await page.goto('/?flow=payroll&companyId=123')

    // Page - Payroll Landing
    await page.getByRole('tab', { name: /run payroll/i }).waitFor()

    // Verify payroll table has correct headers
    await expect(page.getByRole('columnheader', { name: /pay period/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /type/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /pay date/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible()

    // Verify at least one payroll row exists
    const payrollRows = page.getByRole('row')
    await expect(payrollRows.first()).toBeVisible()
  })
})
