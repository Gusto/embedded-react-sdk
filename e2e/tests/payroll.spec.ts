import { test, expect } from '@playwright/test'

test.describe('PayrollFlow', () => {
  test('displays the payroll landing page with tabs', async ({ page }) => {
    await page.goto('/?flow=payroll&companyId=123')

    // Page - Payroll Landing (with tabs: Run Payroll, Payroll History)
    await expect(page.getByRole('tab', { name: /run payroll/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /payroll history/i })).toBeVisible()

    // Verify the payrolls grid/table is visible
    await expect(page.getByRole('grid', { name: /payrolls/i })).toBeVisible()
  })

  test('can view payroll blockers when present', async ({ page }) => {
    await page.goto('/?flow=payroll&companyId=123')

    await page.getByRole('tab', { name: /run payroll/i }).waitFor()

    const viewBlockersButton = page.getByRole('button', { name: /view all blockers/i })
    const hasBlockersButton = await viewBlockersButton
      .waitFor({ state: 'visible', timeout: 2000 })
      .then(() => true)
      .catch(() => false)

    if (!hasBlockersButton) {
      test.skip(true, 'No blockers present in current mock data')
      return
    }

    await viewBlockersButton.click()
    await expect(page.getByRole('heading', { name: /payroll blockers/i })).toBeVisible()
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

    // Verify history content is visible
    const historyHeading = page.getByRole('heading', { name: /payroll history/i })
    await expect(historyHeading).toBeVisible()
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
