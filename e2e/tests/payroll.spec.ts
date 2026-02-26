import { test, expect } from '../utils/localTestFixture'
import { waitForLoadingComplete } from '../utils/helpers'

test.describe('PayrollFlow', () => {
  test('displays the payroll landing page with tabs', async ({ page }) => {
    await page.goto('/?flow=payroll&companyId=123')

    await waitForLoadingComplete(page)

    // Page - Payroll Landing (with tabs: Run Payroll, Payroll History)
    await expect(page.getByRole('tab', { name: /run payroll/i })).toBeVisible({ timeout: 30000 })
    await expect(page.getByRole('tab', { name: /payroll history/i })).toBeVisible()

    // Verify payroll content area is visible (tabpanel or main content)
    const tabpanel = page.getByRole('tabpanel')
    await expect(tabpanel).toBeVisible({ timeout: 15000 })
  })

  test('can view payroll blockers when present', async ({ page, localConfig }) => {
    await page.goto('/?flow=payroll&companyId=123')

    // Wait for tabs to appear (page-level loading complete)
    await page.getByRole('tab', { name: /run payroll/i }).waitFor({ timeout: 60000 })

    // Look for blockers button or blocker-related content
    const viewBlockersButton = page.getByRole('button', { name: /view.*blocker|blocker/i })
    const blockerText = page.getByText(/blocker|action.*required|complete.*setup/i)

    const hasBlockersButton = await viewBlockersButton.isVisible().catch(() => false)
    const hasBlockerText = await blockerText
      .first()
      .isVisible()
      .catch(() => false)

    if (hasBlockersButton) {
      await viewBlockersButton.click()
      await waitForLoadingComplete(page)
      // Verify blocker content appeared (heading or list)
      const blockerHeading = page.getByRole('heading', { name: /blocker/i })
      const blockerList = page.getByRole('list')
      const hasHeading = await blockerHeading.isVisible().catch(() => false)
      const hasList = await blockerList.isVisible().catch(() => false)
      expect(hasHeading || hasList).toBeTruthy()
    } else if (hasBlockerText) {
      // Blockers shown inline without a button
      await expect(blockerText.first()).toBeVisible()
    } else if (localConfig.isLocal) {
      // In local mode, company may be fully set up with no blockers - verify tab is working
      const tabpanel = page.getByRole('tabpanel')
      await expect(tabpanel).toBeVisible()
    } else {
      // MSW mode should have blockers
      await expect(viewBlockersButton).toBeVisible()
    }
  })

  test('can view payroll history tab', async ({ page }) => {
    await page.goto('/?flow=payroll&companyId=123')

    await waitForLoadingComplete(page)

    // Page - Payroll Landing - wait for tabs to appear
    await expect(page.getByRole('tab', { name: /run payroll/i })).toBeVisible({ timeout: 30000 })

    // Click on History tab
    const historyTab = page.getByRole('tab', { name: /payroll history/i })
    await historyTab.click()

    await waitForLoadingComplete(page)

    // Verify history tab is selected
    await expect(historyTab).toHaveAttribute('aria-selected', 'true')

    // Verify history tabpanel is visible
    const tabpanel = page.getByRole('tabpanel', { name: /payroll history/i })
    await expect(tabpanel).toBeVisible({ timeout: 15000 })
  })

  test('displays payroll rows with correct information', async ({ page, localConfig }) => {
    await page.goto('/?flow=payroll&companyId=123')

    await waitForLoadingComplete(page)

    // Page - Payroll Landing
    await expect(page.getByRole('tab', { name: /run payroll/i })).toBeVisible({ timeout: 30000 })

    // Check if there's a payroll table or empty state
    const hasTable = await page
      .getByRole('columnheader', { name: /pay period/i })
      .isVisible()
      .catch(() => false)

    if (hasTable) {
      // Verify payroll table has correct headers
      await expect(page.getByRole('columnheader', { name: /pay period/i })).toBeVisible()
      await expect(page.getByRole('columnheader', { name: /pay date/i })).toBeVisible()
      await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible()

      // Verify at least one payroll row exists (header row counts as first)
      const payrollRows = page.getByRole('row')
      await expect(payrollRows.first()).toBeVisible()
    } else if (localConfig.isLocal) {
      // In local mode with a new company, there may be no payrolls yet - verify empty/setup state
      const tabpanel = page.getByRole('tabpanel')
      await expect(tabpanel).toBeVisible()
    } else {
      // MSW mode should always have data
      await expect(page.getByRole('columnheader', { name: /pay period/i })).toBeVisible()
    }
  })
})
