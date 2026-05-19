import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('PayrollFlow — off-cycle eligible', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'payroll/off-cycle-eligible',
    })
  })

  test('displays payroll landing with both tabs and a payroll row or blocker', async ({ page }) => {
    await page.goto('/?flow=payroll')
    await waitForLoadingComplete(page, 60000)

    await expect(page.getByRole('tab', { name: /run payroll/i })).toBeVisible({ timeout: 30000 })
    await expect(page.getByRole('tab', { name: /payroll history/i })).toBeVisible()

    const payPeriodHeader = page.getByRole('columnheader', { name: /pay period/i })
    const blockerSurface = page.getByText(/blocker|action.*required|complete.*setup/i).first()
    await expect(payPeriodHeader.or(blockerSurface)).toBeVisible({ timeout: 30000 })
  })

  test('history tab opens its panel after switching from run payroll', async ({ page }) => {
    await page.goto('/?flow=payroll')
    await waitForLoadingComplete(page)

    const historyTab = page.getByRole('tab', { name: /payroll history/i })
    await historyTab.click()
    await waitForLoadingComplete(page)

    await expect(historyTab).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('tabpanel', { name: /payroll history/i })).toBeVisible({
      timeout: 15000,
    })
  })
})
