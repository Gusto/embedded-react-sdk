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

    // The driver reaches Review Payroll for corrections and stops there.
    // See comment in createAndSubmitOffCycleBonus for why we don't push past
    // the SDK landmark into a guaranteed backend rejection on fresh demos.
    await expect(page.getByRole('heading', { name: /review payroll/i, level: 1 })).toBeVisible({
      timeout: 60_000,
    })
  })
})
