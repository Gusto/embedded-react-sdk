import { test, expect } from '../../../utils/localTestFixture'
import { runHolidayPayPolicyCreate } from '../../../utils/timeOffFlowDrivers'

test.describe.serial('TimeOffCanary 03 — holiday pay policy create end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'time-off/full-flow-canary',
    })
  })

  test('creates a holiday pay policy with selected holidays and lands on the holiday detail view', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(8 * 60_000)

    await runHolidayPayPolicyCreate(page, scenario)

    await expect(page.getByRole('heading', { name: /holiday pay policy/i })).toBeVisible({
      timeout: 60_000,
    })
  })
})
