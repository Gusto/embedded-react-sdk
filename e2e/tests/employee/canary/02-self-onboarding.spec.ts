import { test, expect } from '../../../utils/localTestFixture'
import { runEmployeeSelfOnboarding } from '../../../utils/employeeFlowDrivers'

test.describe.serial('EmployeeCanary 02 — employee self-onboarding end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'employee/full-flow-canary',
    })
  })

  test('drives the seeded employee through self-onboarding to "You\'ve completed setup!"', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(8 * 60_000)

    await runEmployeeSelfOnboarding(page, scenario)

    await expect(page.getByRole('heading', { name: /you've completed setup/i })).toBeVisible({
      timeout: 60_000,
    })
  })
})
