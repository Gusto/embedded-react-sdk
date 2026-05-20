import { test, expect } from '../../../utils/localTestFixture'
import {
  changeScheduleAndRunTransitionPayroll,
  runNextRegularPayroll,
} from '../../../utils/payrollFlowDrivers'

test.describe.serial('PayrollCanary 04 — transition payroll end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'payroll/full-flow-canary',
    })
  })

  test('runs a regular payroll, then drives the post-schedule-change transition payroll', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.skip(!scenario.paySchedule?.uuid, 'Requires pay schedule from the scenario')
    test.setTimeout(12 * 60_000)

    // Backend produces transition pay periods only after at least one regular
    // payroll has been processed on the old schedule.
    await runNextRegularPayroll(page, scenario)

    await changeScheduleAndRunTransitionPayroll(page, scenario, { newFrequency: 'Every week' })

    await expect(page.getByText(/^total$/i).first()).toBeVisible({ timeout: 60_000 })
  })
})
