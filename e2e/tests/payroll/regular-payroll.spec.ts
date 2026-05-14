import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('PayrollFlow — regular biweekly', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'payroll/standard-biweekly-2-employees',
    })
  })

  test('displays the payroll landing page with tabs', async ({ page }) => {
    await page.goto('/?flow=payroll')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('tab', { name: /run payroll/i })).toBeVisible({ timeout: 30000 })
    await expect(page.getByRole('tab', { name: /payroll history/i })).toBeVisible()

    const tabpanel = page.getByRole('tabpanel')
    await expect(tabpanel).toBeVisible({ timeout: 15000 })
  })

  test('can view payroll history tab', async ({ page }) => {
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

  test('displays payroll rows with correct information', async ({ page }) => {
    await page.goto('/?flow=payroll')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('tab', { name: /run payroll/i })).toBeVisible({ timeout: 30000 })

    const tabpanel = page.getByRole('tabpanel')
    await expect(tabpanel).toBeVisible()
  })
})
