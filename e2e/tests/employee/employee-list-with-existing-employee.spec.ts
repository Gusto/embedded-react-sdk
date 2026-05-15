import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('EmployeeOnboarding — list with existing onboarded employee', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'employee/employee-onboarding-with-existing-employee',
    })
  })

  test('renders existing employee row alongside the Add CTA', async ({ page, scenario }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

    await page.goto('/?flow=employee-onboarding')
    await waitForLoadingComplete(page, 30000)

    await expect(page.getByRole('button', { name: /Add/i })).toBeVisible({ timeout: 30000 })

    await expect(page.getByText(/Alice/).first()).toBeVisible({ timeout: 15000 })
  })
})
