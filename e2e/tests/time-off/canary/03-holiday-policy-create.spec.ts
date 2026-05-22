import { test, expect } from '../../../utils/localTestFixture'
import { runHolidayPayPolicyCreate } from '../../../utils/timeOffFlowDrivers'

test.describe.serial('TimeOffCanary 03 — holiday pay policy create end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'time-off/full-flow-canary',
    })
  })

  test('creates a holiday pay policy with all holidays + all employees selected', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(6 * 60_000)

    await runHolidayPayPolicyCreate(page, scenario)

    await expect(page.getByRole('heading', { name: /holiday pay policy/i })).toBeVisible({
      timeout: 60_000,
    })
  })
})
