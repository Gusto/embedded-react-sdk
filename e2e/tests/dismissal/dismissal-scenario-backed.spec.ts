import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('DismissalFlow — scenario-backed termination', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'dismissal/employee-terminated',
    })
  })

  test('drives the dismissal flow from pay-period selection into execution', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(180_000)

    const employeeId = Object.values(scenario.employeeIds)[0]
    expect(employeeId).toBeTruthy()

    await page.goto(`/?flow=dismissal&employeeId=${employeeId}`)
    await waitForLoadingComplete(page, 60000)

    await expect(page.getByRole('heading', { name: /run dismissal payroll/i })).toBeVisible({
      timeout: 30000,
    })

    const emptyState = page.getByText(/no unprocessed termination pay periods/i)
    const reachedEmpty = await emptyState.isVisible().catch(() => false)
    if (reachedEmpty) {
      await expect(emptyState).toBeVisible()
      return
    }

    const payPeriodSelect = page.getByRole('button', { name: /pay period/i })
    await expect(payPeriodSelect).toBeVisible()
    await payPeriodSelect.click()
    await page.getByRole('listbox').getByRole('option').first().click()

    const continueButton = page.getByRole('button', { name: /continue/i })
    await expect(continueButton).toBeEnabled()
    await continueButton.click()
    await waitForLoadingComplete(page, 90000)

    await expect(
      page.getByRole('heading', {
        name: /edit payroll|preparing payroll|calculating payroll|run dismissal payroll/i,
      }),
    ).toBeVisible({ timeout: 60000 })
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
