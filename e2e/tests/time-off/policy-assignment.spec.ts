import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('TimeOffFlow - assignment with multi-location workforce', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'time-off/time-off-policy-assignment-multi-location',
    })
  })

  test('provisions multi-location workforce so the policy list can render', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

    expect(scenario.companyId).toBeTruthy()
    expect(Object.keys(scenario.locationIds)).toEqual(expect.arrayContaining(['hq', 'south-bay']))
    expect(Object.keys(scenario.employeeIds)).toEqual(expect.arrayContaining(['alice', 'bob']))

    await page.goto('/?flow=time-off')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /time off policies/i })).toBeVisible({
      timeout: 30000,
    })
  })
})
