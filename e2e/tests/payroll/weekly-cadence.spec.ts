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

    // Previously this asserted payPeriodHeader.or(blockerSurface) — meaning a
    // blocker screen ("Action required", "Complete setup") would *pass* the
    // test. That masked the day-one failure mode where the weekly schedule
    // wasn't actually provisioned and the test landed on a blocker. With
    // commit 2's loud provisioning errors a blocker here would itself be a
    // bug, so assert the pay period column directly and let any blocker
    // surface fail the test on its own merits.
    await expect(page.getByRole('columnheader', { name: /pay period/i })).toBeVisible({
      timeout: 30000,
    })
  })
})
