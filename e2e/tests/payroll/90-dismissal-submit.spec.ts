import { test, expect } from '../../utils/localTestFixture'
import { terminateAndRunDismissalPayroll } from '../../utils/payrollFlowDrivers'
import {
  CANARY_TEST_TIMEOUT_WITH_PRECURSOR_MS,
  PAYROLL_CALCULATION_DEADLINE,
} from '../../utils/timeouts'

test.describe
  .serial('PayrollCanary 00 — dismissal payroll (runs first to keep open pay period intact)', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test('terminates a seed employee via the UI and runs the dismissal payroll through to receipt', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(CANARY_TEST_TIMEOUT_WITH_PRECURSOR_MS)

    // Do NOT run a regular payroll first: that consumes the company's current
    // open biweekly pay period, and the next open period doesn't start for
    // ~14 days, so any plausible lastDayOfWork lands in a closed period and
    // the backend renders "There are no unprocessed termination pay periods
    // available" on the Run Dismissal Payroll screen. Onboarded seed
    // companies already have an open pay period that the dismissal flow can
    // attach to without first running a regular payroll.
    //
    // lastDayOfWork = today + 7 keeps us comfortably inside the current open
    // biweekly window regardless of which day of the cycle the test starts
    // on, and is recent enough that the backend creates a termination pay
    // period for the just-ending open window.
    const lastDay = new Date()
    lastDay.setDate(lastDay.getDate() + 7)
    await terminateAndRunDismissalPayroll(page, scenario, {
      lastDayOfWork: {
        month: lastDay.getMonth() + 1,
        day: lastDay.getDate(),
        year: lastDay.getFullYear(),
      },
    })

    await expect(page.getByText(/^total$/i).first()).toBeVisible({
      timeout: PAYROLL_CALCULATION_DEADLINE,
    })
  })
})
