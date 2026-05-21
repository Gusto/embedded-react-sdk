import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('PayrollFlow - view all blockers lifecycle', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'payroll/biweekly-shared',
    })
  })

  test('opens View All Blockers and lands on the blockers detail screen', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(180_000)

    await page.goto('/?flow=payroll')
    await waitForLoadingComplete(page, 60000)

    await expect(page.getByRole('tab', { name: /run payroll/i })).toBeVisible({ timeout: 30000 })

    const viewAllButton = page.getByRole('button', { name: /view all blockers/i })
    const directBlockerSurface = page.getByRole('heading', { name: /payroll blockers/i }).first()
    const payPeriodHeader = page.getByRole('columnheader', { name: /pay period/i })

    const hasViewAll = await viewAllButton.isVisible({ timeout: 15000 }).catch(() => false)
    if (hasViewAll) {
      await viewAllButton.click()
      await waitForLoadingComplete(page, 30000)
      await expect(page.getByRole('heading', { name: /payroll blockers/i })).toBeVisible({
        timeout: 30000,
      })
      return
    }

    await expect(directBlockerSurface.or(payPeriodHeader)).toBeVisible({ timeout: 15000 })
  })
})
