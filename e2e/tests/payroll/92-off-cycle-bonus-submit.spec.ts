import { test, expect } from '../../utils/localTestFixture'
import { createAndSubmitOffCycleBonus } from '../../utils/payrollFlowDrivers'
import { CANARY_TEST_TIMEOUT_MS, PAYROLL_CALCULATION_DEADLINE } from '../../utils/timeouts'

test.describe.serial('PayrollCanary 02 — off-cycle bonus end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test('creates a bonus off-cycle payroll from landing and submits through to receipt', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(CANARY_TEST_TIMEOUT_MS)

    await createAndSubmitOffCycleBonus(page, scenario, { reason: 'Bonus' })

    await expect(page.getByText(/^total$/i).first()).toBeVisible({
      timeout: PAYROLL_CALCULATION_DEADLINE,
    })
  })
})
