import { test, expect } from '../../../utils/localTestFixture'
import { runAdminEmployeeOnboarding } from '../../../utils/employeeFlowDrivers'

test.describe.serial('EmployeeCanary 01 — admin employee onboarding end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'employee/full-flow-canary',
    })
  })

  test('drives admin onboarding from the employee list through "That\'s it!"', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(6 * 60_000)

    await runAdminEmployeeOnboarding(page, scenario, {
      firstName: 'Canary',
      lastName: 'Admin',
    })

    await expect(
      page.getByRole('heading', { name: /that's it! .+ is ready to get paid/i }),
    ).toBeVisible({ timeout: 60_000 })
  })
})
