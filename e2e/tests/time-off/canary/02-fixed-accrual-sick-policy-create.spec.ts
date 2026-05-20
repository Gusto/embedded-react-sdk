import { test, expect } from '../../../utils/localTestFixture'
import { runFixedAccrualSickPolicyCreate } from '../../../utils/timeOffFlowDrivers'

test.describe.serial('TimeOffCanary 02 — fixed-accrual sick policy create end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'time-off/full-flow-canary',
    })
  })

  test('creates a fixed-amount-per-year sick policy through details + settings + add employees', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(8 * 60_000)

    const policyName = `Canary Sick Fixed ${Date.now()}`

    await runFixedAccrualSickPolicyCreate(page, scenario, { policyName })

    await expect(page.getByRole('heading', { name: new RegExp(policyName, 'i') })).toBeVisible({
      timeout: 60_000,
    })
    await expect(page.getByRole('button', { name: /edit policy/i })).toBeVisible()
  })
})
