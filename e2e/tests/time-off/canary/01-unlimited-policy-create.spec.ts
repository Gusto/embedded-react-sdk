import { test, expect } from '../../../utils/localTestFixture'
import { runUnlimitedTimeOffPolicyCreate } from '../../../utils/timeOffFlowDrivers'

test.describe.serial('TimeOffCanary 01 — unlimited policy create end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'time-off/full-flow-canary',
    })
  })

  test('creates an unlimited time-off policy with 2 selected employees and lands on the detail view', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(5 * 60_000)

    const policyName = `Canary Unlimited ${Date.now()}`

    await runUnlimitedTimeOffPolicyCreate(page, scenario, { policyName, employeesToSelect: 2 })

    await expect(page.getByRole('heading', { name: new RegExp(policyName, 'i') })).toBeVisible({
      timeout: 60_000,
    })
    await expect(page.getByRole('button', { name: /edit policy/i })).toBeVisible()
  })
})
