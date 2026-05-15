import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('DismissalFlow — scenario-backed termination', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'dismissal/employee-terminated',
    })
  })

  test('loads dismissal flow with the scenario-provisioned terminated employee', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

    const employeeId = Object.values(scenario.employeeIds)[0]
    expect(employeeId).toBeTruthy()

    await page.goto(`/?flow=dismissal&employeeId=${employeeId}`)
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /run dismissal payroll/i })).toBeVisible({
      timeout: 30000,
    })

    const payPeriodSelect = page.getByRole('button', { name: /pay period/i })
    await expect(payPeriodSelect).toBeVisible()
  })
})

test.describe('DismissalFlow — hourly terminated employee', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'dismissal/employee-terminated-hourly',
    })
  })

  test('loads dismissal flow for an hourly terminated employee', async ({ page, scenario }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

    const employeeId = Object.values(scenario.employeeIds)[0]
    expect(employeeId).toBeTruthy()

    await page.goto(`/?flow=dismissal&employeeId=${employeeId}`)
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /run dismissal payroll/i })).toBeVisible({
      timeout: 30000,
    })
  })
})

test.describe('DismissalFlow — terminated without termination payroll', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'dismissal/employee-terminated-no-payroll',
    })
  })

  test('renders empty state or pay-period selector for no-payroll termination', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

    const employeeId = Object.values(scenario.employeeIds)[0]
    expect(employeeId).toBeTruthy()

    await page.goto(`/?flow=dismissal&employeeId=${employeeId}`)
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /run dismissal payroll/i })).toBeVisible({
      timeout: 30000,
    })

    const emptyState = page.getByText(/no unprocessed termination pay periods/i)
    const payPeriodSelect = page.getByRole('button', { name: /pay period/i })

    const hasEmpty = await emptyState.isVisible().catch(() => false)
    const hasPicker = await payPeriodSelect.isVisible().catch(() => false)

    expect(hasEmpty || hasPicker).toBeTruthy()
  })
})
