import { test, expect } from '../utils/localTestFixture'
import { waitForLoadingComplete } from '../utils/helpers'

test.describe('DismissalFlow', () => {
  test.describe('pay period selection', () => {
    test('displays the pay period selection page with options and breadcrumb', async ({
      page,
      localConfig,
    }) => {
      await page.goto(
        `/?flow=dismissal&companyId=123&employeeId=${localConfig.terminatedEmployeeId}`,
      )

      await waitForLoadingComplete(page)

      await expect(page.getByRole('heading', { name: /run dismissal payroll/i })).toBeVisible({
        timeout: 30000,
      })

      await expect(
        page.getByText(/select the pay period for the terminated employee/i),
      ).toBeVisible()

      await expect(page.getByText(/select pay period/i)).toBeVisible()

      const payPeriodSelect = page.getByRole('button', { name: /pay period/i })
      await expect(payPeriodSelect).toBeVisible()

      const continueButton = page.getByRole('button', { name: /continue/i })
      await expect(continueButton).toBeVisible()
    })

    test('continue button enables after selecting a pay period', async ({ page, localConfig }) => {
      await page.goto(
        `/?flow=dismissal&companyId=123&employeeId=${localConfig.terminatedEmployeeId}`,
      )

      await waitForLoadingComplete(page)

      await expect(page.getByRole('heading', { name: /run dismissal payroll/i })).toBeVisible({
        timeout: 30000,
      })

      const payPeriodSelect = page.getByRole('button', { name: /pay period/i })
      await payPeriodSelect.click()
      await page.getByRole('option').first().click()

      const continueButton = page.getByRole('button', { name: /continue/i })
      await expect(continueButton).toBeEnabled()
    })

    test('pay period dropdown contains date ranges', async ({ page, localConfig }) => {
      await page.goto(
        `/?flow=dismissal&companyId=123&employeeId=${localConfig.terminatedEmployeeId}`,
      )

      await waitForLoadingComplete(page)

      await expect(page.getByRole('heading', { name: /run dismissal payroll/i })).toBeVisible({
        timeout: 30000,
      })

      const payPeriodSelect = page.getByRole('button', { name: /pay period/i })
      await payPeriodSelect.click()

      const options = page.getByRole('option')
      const optionCount = await options.count()
      expect(optionCount).toBeGreaterThan(0)

      const firstOptionText = await options.first().textContent()
      expect(firstOptionText).toMatch(/\d/)
    })

    test('shows empty state when no termination pay periods exist', async ({
      page,
      localConfig,
    }) => {
      const nonTerminatedEmployeeId = localConfig.isLocal
        ? localConfig.employeeId
        : 'non-existent-employee'

      await page.goto(`/?flow=dismissal&companyId=123&employeeId=${nonTerminatedEmployeeId}`)

      await waitForLoadingComplete(page)

      await expect(page.getByRole('heading', { name: /run dismissal payroll/i })).toBeVisible({
        timeout: 30000,
      })

      await expect(page.getByText(/no unprocessed termination pay periods/i)).toBeVisible()
    })
  })

  test.describe('full payroll execution', () => {
    test('completes the entire dismissal payroll flow from pay period selection to submission', async ({
      page,
      localConfig,
    }) => {
      const isRealApi = localConfig.isLocal
      test.setTimeout(isRealApi ? 600_000 : 120_000)
      const stepTimeout = isRealApi ? 300_000 : 30_000

      if (isRealApi) {
        await skipPendingPayrolls({
          flowToken: localConfig.dismissalFlowToken || localConfig.flowToken,
          companyId: localConfig.dismissalCompanyId || localConfig.companyId,
        })
      }

      await page.goto(
        `/?flow=dismissal&companyId=123&employeeId=${localConfig.terminatedEmployeeId}`,
      )
      await waitForLoadingComplete(page)

      if (!localConfig.isLocal) {
        await page.evaluate(() => {
          const w = window as Record<string, unknown>
          const worker = w.__mswWorker as { use: (handler: unknown) => void } | undefined
          const msw = w.__msw as
            | {
                http: { get: (path: string, handler: () => unknown) => unknown }
                HttpResponse: { json: (data: unknown) => unknown }
              }
            | undefined
          if (worker && msw) {
            worker.use(msw.http.get('*/payrolls/blockers', () => msw.HttpResponse.json([])))
          }
        })
      }

      // Step 1: Pay Period Selection
      await expect(page.getByRole('heading', { name: /run dismissal payroll/i })).toBeVisible({
        timeout: 30000,
      })

      const payPeriodSelect = page.getByRole('button', { name: /pay period/i })
      await payPeriodSelect.click()
      await page.getByRole('option').first().click()

      await page.getByRole('button', { name: /continue/i }).click()
      await waitForLoadingComplete(page)

      const submissionError = page.getByRole('alert').filter({ hasText: /there was a problem/i })
      const hasSubmissionError = await submissionError.isVisible().catch(() => false)
      if (hasSubmissionError) {
        const errorText = await submissionError.textContent()
        throw new Error(`Off-cycle payroll creation failed: ${errorText}`)
      }

      // Step 2: Edit Payroll (Configuration)
      await expect(page.getByRole('heading', { name: /edit payroll/i }).first()).toBeVisible({
        timeout: stepTimeout,
      })

      const calculateButton = page.getByRole('button', { name: /calculate and review/i })
      await expect(calculateButton).toBeVisible({ timeout: stepTimeout })
      await calculateButton.click()

      // Step 3: Review Payroll (Overview)
      await expect(page.getByRole('heading', { name: /review payroll/i }).first()).toBeVisible({
        timeout: stepTimeout,
      })

      const submitButton = page.getByRole('button', { name: /^submit$/i })
      await expect(submitButton).toBeVisible({ timeout: stepTimeout })
      await submitButton.click()

      // Step 4: Payroll Submitted confirmation
      await expect(page.getByText(/payroll submitted/i).first()).toBeVisible({
        timeout: stepTimeout,
      })

      // Step 5: View Payroll Receipt
      const receiptButton = page.getByRole('button', { name: /view payroll receipt/i })
      await expect(receiptButton).toBeVisible({ timeout: stepTimeout })
      await receiptButton.click()

      await expect(page.getByText(/receipt/i).first()).toBeVisible({ timeout: stepTimeout })
    })

    test('transitions from pay period selection to edit payroll', async ({ page, localConfig }) => {
      test.skip(
        localConfig.isLocal,
        'Covered by the full execution test; real API has limited pay periods',
      )

      await page.goto(
        `/?flow=dismissal&companyId=123&employeeId=${localConfig.terminatedEmployeeId}`,
      )
      await waitForLoadingComplete(page)

      await expect(page.getByRole('heading', { name: /run dismissal payroll/i })).toBeVisible({
        timeout: 30000,
      })

      const payPeriodSelect = page.getByRole('button', { name: /pay period/i })
      await payPeriodSelect.click()
      await page.getByRole('option').first().click()

      await page.getByRole('button', { name: /continue/i }).click()
      await waitForLoadingComplete(page)

      const payrollExecutionHeading = page.getByRole('heading', {
        name: /edit payroll|preparing payroll|calculating payroll/i,
      })
      await expect(payrollExecutionHeading.first()).toBeVisible({ timeout: 60000 })
    })
  })
})

async function skipPendingPayrolls(localConfig: { flowToken: string; companyId: string }) {
  const gwsFlowsHost = process.env.E2E_GWS_FLOWS_HOST || 'https://flows.gusto-demo.com'
  const skipUrl = `${gwsFlowsHost}/fe_sdk/${localConfig.flowToken}/v1/companies/${localConfig.companyId}/payrolls/skip`

  for (const payrollType of ['Transition from old pay schedule', 'Regular']) {
    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch(skipUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payroll_type: payrollType }),
        })
        if (!response.ok) break
      } catch {
        break
      }
    }
  }
}
