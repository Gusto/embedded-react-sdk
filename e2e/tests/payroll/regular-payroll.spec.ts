import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('PayrollFlow — regular biweekly', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'payroll/standard-biweekly-2-employees',
    })
  })

  test('displays the payroll landing page with both tabs', async ({ page }) => {
    await page.goto('/?flow=payroll')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('tab', { name: /run payroll/i })).toBeVisible({ timeout: 30000 })
    await expect(page.getByRole('tab', { name: /payroll history/i })).toBeVisible()

    const tabpanel = page.getByRole('tabpanel')
    await expect(tabpanel).toBeVisible({ timeout: 15000 })
  })

  test('payroll history tab toggles aria-selected and reveals its panel', async ({ page }) => {
    await page.goto('/?flow=payroll')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('tab', { name: /run payroll/i })).toBeVisible({ timeout: 30000 })

    const historyTab = page.getByRole('tab', { name: /payroll history/i })
    await historyTab.click()
    await waitForLoadingComplete(page)

    await expect(historyTab).toHaveAttribute('aria-selected', 'true')
    const tabpanel = page.getByRole('tabpanel', { name: /payroll history/i })
    await expect(tabpanel).toBeVisible({ timeout: 15000 })
  })

  test('renders run-payroll panel content (pay period column or blocker surface)', async ({
    page,
  }) => {
    await page.goto('/?flow=payroll')
    await waitForLoadingComplete(page, 60000)

    await expect(page.getByRole('tab', { name: /run payroll/i })).toBeVisible({ timeout: 30000 })

    const tabpanel = page.getByRole('tabpanel')
    await expect(tabpanel).toBeVisible()

    const payPeriodHeader = page.getByRole('columnheader', { name: /pay period/i })
    const blockerSurface = page
      .getByText(/blocker|action.*required|complete.*setup|view.*blocker/i)
      .first()

    await expect(payPeriodHeader.or(blockerSurface)).toBeVisible({ timeout: 30000 })
  })
})
