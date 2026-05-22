import { test, expect } from '../../../utils/localTestFixture'
import { runEmployeeTermination } from '../../../utils/employeeFlowDrivers'

test.describe.serial('EmployeeCanary 03 — employee termination end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'employee/full-flow-canary',
    })
  })

  test('terminates a seed-onboarded employee and lands on the termination summary', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(6 * 60_000)

    await runEmployeeTermination(page, scenario)

    await expect(page.getByRole('heading', { name: /^termination summary$/i })).toBeVisible({
      timeout: 60_000,
    })
    await expect(page.getByText(/has been successfully terminated/i)).toBeVisible({
      timeout: 60_000,
    })
  })
})
