import { test, expect } from '../../../utils/localTestFixture'
import { runNextRegularPayroll } from '../../../utils/payrollFlowDrivers'

test.describe.serial('PayrollCanary 01 — regular payroll end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'payroll/full-flow-canary',
    })
  })

  test('runs the next scheduled biweekly payroll from landing through receipt', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(8 * 60_000)

    await runNextRegularPayroll(page, scenario)

    await expect(page.getByText(/^total$/i).first()).toBeVisible({ timeout: 60_000 })
  })
})
