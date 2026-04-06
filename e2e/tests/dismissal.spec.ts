import { test, expect } from '../utils/localTestFixture'
import { waitForLoadingComplete } from '../utils/helpers'

test.describe('DismissalFlow', () => {
  test.beforeEach(({ localConfig }) => {
    test.skip(
      localConfig.isLocal && !localConfig.terminatedEmployeeId,
      'Dismissal setup failed — no terminated employee available',
    )
  })

  test.describe('pay period selection', () => {
    test('displays the pay period selection page with options and breadcrumb', async ({
      page,
      localConfig,
    }) => {
      const companyId = localConfig.isLocal ? localConfig.dismissalCompanyId : '123'
      await page.goto(
        `/?flow=dismissal&companyId=${companyId}&employeeId=${localConfig.terminatedEmployeeId}`,
      )

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

    test('continue button enables after selecting a pay period', async ({ page, localConfig }) => {
      const companyId = localConfig.isLocal ? localConfig.dismissalCompanyId : '123'
      await page.goto(
        `/?flow=dismissal&companyId=${companyId}&employeeId=${localConfig.terminatedEmployeeId}`,
      )

      await waitForLoadingComplete(page)

      await expect(page.getByRole('heading', { name: /run dismissal payroll/i })).toBeVisible({
        timeout: 30000,
      })

      const payPeriodSelect = page.getByRole('button', { name: /pay period/i })
      await payPeriodSelect.click()
      await page.getByRole('listbox').getByRole('option').first().click()

      const continueButton = page.getByRole('button', { name: /continue/i })
      await expect(continueButton).toBeEnabled()
    })

    test('pay period dropdown contains date ranges', async ({ page, localConfig }) => {
      const companyId = localConfig.isLocal ? localConfig.dismissalCompanyId : '123'
      await page.goto(
        `/?flow=dismissal&companyId=${companyId}&employeeId=${localConfig.terminatedEmployeeId}`,
      )

      await waitForLoadingComplete(page)

      await expect(page.getByRole('heading', { name: /run dismissal payroll/i })).toBeVisible({
        timeout: 30000,
      })

      const payPeriodSelect = page.getByRole('button', { name: /pay period/i })
      await payPeriodSelect.click()

      const options = page.getByRole('listbox').getByRole('option')
      const optionCount = await options.count()
      expect(optionCount).toBeGreaterThan(0)

      const firstOptionText = await options.first().textContent()
      expect(firstOptionText).toMatch(/\d/)
    })

    test('shows empty state when no termination pay periods exist', async ({
      page,
      localConfig,
    }) => {
      const companyId = localConfig.isLocal ? localConfig.dismissalCompanyId : '123'
      // For real API: uses an employee from the primary company who has no termination pay
      // periods in the dismissal company, producing an empty filtered result.
      // For mocks: uses a nonexistent ID so the mock returns no matching periods.
      const nonTerminatedEmployeeId = localConfig.isLocal
        ? localConfig.employeeId
        : 'non-existent-employee'

      await page.goto(
        `/?flow=dismissal&companyId=${companyId}&employeeId=${nonTerminatedEmployeeId}`,
      )

      await waitForLoadingComplete(page)

      await expect(page.getByRole('heading', { name: /run dismissal payroll/i })).toBeVisible({
        timeout: 30000,
      })

      await expect(page.getByText(/no unprocessed termination pay periods/i)).toBeVisible()
    })
  })

  test.describe('full payroll execution', () => {
    test('transitions from pay period selection to edit payroll', async ({ page, localConfig }) => {
      test.skip(
        localConfig.isLocal,
        'Covered by the full execution test; real API has limited pay periods',
      )

      await page.goto(
        `/?flow=dismissal&companyId=123&employeeId=${localConfig.terminatedEmployeeId}`,
      )
      // This test is skipped for real API, so companyId=123 is fine (MSW only)
      await waitForLoadingComplete(page)

      await expect(page.getByRole('heading', { name: /run dismissal payroll/i })).toBeVisible({
        timeout: 30000,
      })

      const payPeriodSelect = page.getByRole('button', { name: /pay period/i })
      await payPeriodSelect.click()
      await page.getByRole('listbox').getByRole('option').first().click()

      await page.getByRole('button', { name: /continue/i }).click()
      await waitForLoadingComplete(page)

      const payrollExecutionHeading = page.getByRole('heading', {
        name: /edit payroll|preparing payroll|calculating payroll/i,
      })
      await expect(payrollExecutionHeading.first()).toBeVisible({ timeout: 60000 })
    })
  })
})
