import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('PayrollFlow — weekly cadence', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'payroll/weekly-schedule',
    })
  })

  test('payroll landing loads under weekly schedule with provisioned context', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

    expect(scenario.companyId).toBeTruthy()
    expect(scenario.paySchedule?.uuid).toBeTruthy()

    await page.goto('/?flow=payroll')
    await waitForLoadingComplete(page, {
      timeout: 60000,
      anchor: page.getByRole('tab', { name: /run payroll/i }),
    })

    await expect(page.getByRole('tab', { name: /payroll history/i })).toBeVisible()

    const payPeriodHeader = page.getByRole('columnheader', { name: /pay period/i })
    const blockerSurface = page.getByText(/blocker|action.*required|complete.*setup/i).first()
    await expect(payPeriodHeader.or(blockerSurface)).toBeVisible({ timeout: 30000 })
  })
})
