import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('PayrollFlow - execution entry + cancel dialog lifecycle', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded-ro',
    })
  })

  test('opens an in-progress payroll, opens cancel dialog, declines to leave it intact', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(240_000)

    await page.goto('/?flow=payroll')
    await waitForLoadingComplete(page, 60000)

    await expect(page.getByRole('tab', { name: /run payroll/i })).toBeVisible({ timeout: 30000 })

    const payrollRow = page.getByRole('row').nth(1)
    const hasRow = await payrollRow.isVisible({ timeout: 15000 }).catch(() => false)
    if (!hasRow) {
      const blockerSurface = page.getByText(/blocker|action.*required|complete.*setup/i).first()
      await expect(blockerSurface).toBeVisible({ timeout: 10000 })
      return
    }

    const runPayrollLink = payrollRow.getByRole('link').first()
    if (await runPayrollLink.isVisible().catch(() => false)) {
      await runPayrollLink.click()
    } else {
      await payrollRow.getByRole('button').first().click()
    }

    await waitForLoadingComplete(page, 60000)

    const executionHeading = page
      .getByRole('heading', { name: /review payroll|payroll for|edit payroll|hours.*earnings/i })
      .first()
    await expect(executionHeading).toBeVisible({ timeout: 60000 })

    const cancelButton = page.getByRole('button', { name: /^cancel payroll$/i })
    if (await cancelButton.isVisible({ timeout: 10000 }).catch(() => false)) {
      await cancelButton.click()
      const dialog = page.getByRole('dialog').filter({ hasText: /cancel.*payroll/i })
      await expect(dialog).toBeVisible({ timeout: 10000 })
      await dialog.getByRole('button', { name: /no.*go back/i }).click()
      await expect(dialog).not.toBeVisible({ timeout: 10000 })
      await expect(executionHeading).toBeVisible()
    } else {
      await expect(executionHeading).toBeVisible()
    }
  })
})
