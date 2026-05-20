import { test, expect } from '../../../utils/localTestFixture'
import { createAndSubmitOffCycleBonus } from '../../../utils/payrollFlowDrivers'

test.describe.serial('PayrollCanary 02 — off-cycle bonus end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'payroll/full-flow-canary',
    })
  })

  test('creates a bonus off-cycle payroll from landing and submits through to receipt', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(8 * 60_000)

    await createAndSubmitOffCycleBonus(page, scenario, { reason: 'Bonus' })

    await expect(page.getByText(/^total$/i).first()).toBeVisible({ timeout: 60_000 })
  })
})
