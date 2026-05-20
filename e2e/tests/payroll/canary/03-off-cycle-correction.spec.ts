import { test, expect } from '../../../utils/localTestFixture'
import { createAndSubmitOffCycleBonus } from '../../../utils/payrollFlowDrivers'

test.describe.serial('PayrollCanary 03 — off-cycle correction end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'payroll/full-flow-canary',
    })
  })

  test('creates a correction-payment off-cycle payroll and submits through to receipt', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(8 * 60_000)

    await createAndSubmitOffCycleBonus(page, scenario, { reason: 'Correction payment' })

    await expect(page.getByText(/^total$/i).first()).toBeVisible({ timeout: 60_000 })
  })
})
