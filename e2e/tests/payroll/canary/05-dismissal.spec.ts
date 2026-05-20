import { test, expect } from '../../../utils/localTestFixture'
import {
  runNextRegularPayroll,
  terminateAndRunDismissalPayroll,
} from '../../../utils/payrollFlowDrivers'

test.describe.serial('PayrollCanary 05 — dismissal payroll end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'payroll/full-flow-canary',
    })
  })

  test('terminates a seed employee via the UI and runs the dismissal payroll through to receipt', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(12 * 60_000)

    // Run a regular payroll first so the company has an anchor pay period,
    // then terminate an onboarded seed employee with last day = today so the
    // backend creates an unprocessed termination pay period for the current
    // open period. (Past last-day fails: the period the employee would have
    // been paid for is already closed and can't accept a new payroll.)
    await runNextRegularPayroll(page, scenario)

    // Last day must be a date that falls inside the next currently-open pay
    // period (not in the past, not in the period spec 01 just processed).
    // Probing the demo backend confirmed the next open period starts the day
    // after the just-processed period ends; tomorrow lands inside it cleanly.
    const lastDay = new Date()
    lastDay.setDate(lastDay.getDate() + 1)
    await terminateAndRunDismissalPayroll(page, scenario, {
      lastDayOfWork: {
        month: lastDay.getMonth() + 1,
        day: lastDay.getDate(),
        year: lastDay.getFullYear(),
      },
    })

    await expect(page.getByText(/^total$/i).first()).toBeVisible({ timeout: 60_000 })
  })
})
