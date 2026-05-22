import { test, expect } from '../../../utils/localTestFixture'
import { runDeletePolicyFromList } from '../../../utils/timeOffFlowDrivers'

test.describe.serial('TimeOffCanary 05 — delete policy from list end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'time-off/full-flow-canary',
    })
  })

  test('creates an unlimited policy and deletes it from the list with the confirmation dialog', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(10 * 60_000)

    const policyName = `Canary Delete ${Date.now()}`

    await runDeletePolicyFromList(page, scenario, { policyName })

    await expect(
      page.getByText(new RegExp(`Policy "${policyName}" deleted successfully`, 'i')),
    ).toBeVisible({ timeout: 60_000 })
  })
})
