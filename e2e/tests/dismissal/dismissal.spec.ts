import { test, expect } from '../../utils/localTestFixture'
import type { Page } from '@playwright/test'
import { waitForLoadingComplete } from '../../utils/helpers'

async function chooseFirstPayPeriod(page: Page) {
  const payPeriodSelect = page.getByRole('button', { name: /pay period/i })
  await payPeriodSelect.click()

  const listbox = page.getByRole('listbox')
  const hasListbox = await listbox.isVisible().catch(() => false)
  if (!hasListbox) return

  const firstOption = listbox.getByRole('option').first()
  if (await firstOption.isVisible().catch(() => false)) {
    await firstOption.click()
  }
}

test.describe('DismissalFlow', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'dismissal/employee-terminated',
    })
  })

  test.describe('pay period selection', () => {
    test('displays the pay period selection page with options and breadcrumb', async ({
      page,
      scenario,
    }) => {
      test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

      const employeeId = Object.values(scenario.employeeIds)[0]
      await page.goto(`/?flow=dismissal&employeeId=${employeeId}`)

      await waitForLoadingComplete(page)

      await expect(page.getByRole('heading', { name: /run dismissal payroll/i })).toBeVisible({
        timeout: 30000,
      })

      await expect(
        page.getByText(/select the pay period for the terminated employee/i),
      ).toBeVisible()

      const payPeriodSelect = page.getByRole('button', { name: /pay period/i })
      await expect(payPeriodSelect).toBeVisible()

      const continueButton = page.getByRole('button', { name: /continue/i })
      await expect(continueButton).toBeVisible()
    })

    test('continue button enables after selecting a pay period', async ({ page, scenario }) => {
      test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

      const employeeId = Object.values(scenario.employeeIds)[0]
      await page.goto(`/?flow=dismissal&employeeId=${employeeId}`)

      await waitForLoadingComplete(page)

      await expect(page.getByRole('heading', { name: /run dismissal payroll/i })).toBeVisible({
        timeout: 30000,
      })

      await chooseFirstPayPeriod(page)

      const continueButton = page.getByRole('button', { name: /continue/i })
      await expect(continueButton).toBeEnabled()
    })

    test('pay period dropdown contains date ranges', async ({ page, scenario }) => {
      test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

      const employeeId = Object.values(scenario.employeeIds)[0]
      await page.goto(`/?flow=dismissal&employeeId=${employeeId}`)

      await waitForLoadingComplete(page)

      await expect(page.getByRole('heading', { name: /run dismissal payroll/i })).toBeVisible({
        timeout: 30000,
      })

      await chooseFirstPayPeriod(page)

      const payPeriodButton = page.getByRole('button', { name: /pay period/i })
      await expect(payPeriodButton).toBeVisible()
      const selectedText = await payPeriodButton.textContent()
      expect(selectedText).toMatch(/\d/)
    })

    test('shows empty state when no termination pay periods exist', async ({ page, scenario }) => {
      test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

      await page.goto('/?flow=dismissal&employeeId=non-existent-employee')

      await waitForLoadingComplete(page)

      await expect(page.getByRole('heading', { name: /run dismissal payroll/i })).toBeVisible({
        timeout: 30000,
      })

      await expect(page.getByText(/no unprocessed termination pay periods/i)).toBeVisible()
    })
  })

  test.describe('full payroll execution', () => {
    test('transitions from pay period selection to edit payroll', async ({ page, scenario }) => {
      test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')

      const employeeId = Object.values(scenario.employeeIds)[0]
      await page.goto(`/?flow=dismissal&employeeId=${employeeId}`)
      await waitForLoadingComplete(page)

      await expect(page.getByRole('heading', { name: /run dismissal payroll/i })).toBeVisible({
        timeout: 30000,
      })

      await chooseFirstPayPeriod(page)

      await page.getByRole('button', { name: /continue/i }).click()
      await waitForLoadingComplete(page)

      const payrollExecutionHeading = page.getByRole('heading', {
        name: /edit payroll|preparing payroll|calculating payroll|run dismissal payroll/i,
      })
      await expect(payrollExecutionHeading.first()).toBeVisible({ timeout: 60000 })
    })
  })
})
