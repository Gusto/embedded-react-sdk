import { test, expect } from '../../../utils/localTestFixture'
import { runFixedAccrualSickPolicyCreate } from '../../../utils/timeOffFlowDrivers'

test.describe.serial('TimeOffCanary 02 — fixed-accrual sick policy create end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded-canary',
    })
  })

  test('creates a fixed-amount-per-year sick policy with custom settings + per-employee balances', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(6 * 60_000)

    const policyName = `Canary Sick Fixed ${Date.now()}`

    await runFixedAccrualSickPolicyCreate(page, scenario, {
      policyName,
      balanceMaximumHours: 240,
      carryOverLimitHours: 40,
      employeeBalances: ['8', '16', '24'],
    })

    await expect(page.getByRole('heading', { name: new RegExp(policyName, 'i') })).toBeVisible({
      timeout: 60_000,
    })
    await expect(page.getByRole('button', { name: /edit policy/i })).toBeVisible()
  })
})
