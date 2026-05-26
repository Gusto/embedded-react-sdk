import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'
import { PAYROLL_CALCULATION_DEADLINE, SDK_NAVIGATION_DEADLINE } from '../../utils/timeouts'

test.describe('PayrollFlow — landing', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test('payroll landing renders run-payroll + history tabs with the pay period column', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

    expect(scenario.companyId).toBeTruthy()
    expect(scenario.paySchedule?.uuid).toBeTruthy()

    await page.goto('/?flow=payroll')
    await waitForLoadingComplete(page, {
      timeout: PAYROLL_CALCULATION_DEADLINE,
      anchor: page.getByRole('tab', { name: /run payroll/i }),
    })

    await expect(page.getByRole('tab', { name: /payroll history/i })).toBeVisible()

    // Assert the pay period column directly rather than allowing a blocker
    // surface ("Action required", "Complete setup") as a fallback. The
    // e2e-setup health gate guarantees this company has zero blockers when
    // the test runs; if a blocker surface appears, that's a real regression
    // worth failing on, not a degraded-but-acceptable state to accept via `.or()`.
    await expect(page.getByRole('columnheader', { name: /pay period/i })).toBeVisible({
      timeout: SDK_NAVIGATION_DEADLINE,
    })
  })
})
