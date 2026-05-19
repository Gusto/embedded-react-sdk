import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('PayrollFlow - run vs review existing payroll entry lifecycle', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'payroll/payroll-multi-entity-history',
    })
  })

  test('opening an unprocessed payroll row lands on the execution surface (configuration or overview)', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(180_000)

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

    const linkOrButton = (await payrollRow
      .getByRole('link')
      .first()
      .isVisible()
      .catch(() => false))
      ? payrollRow.getByRole('link').first()
      : payrollRow.getByRole('button').first()
    await linkOrButton.click()

    await waitForLoadingComplete(page, 60000)

    const executionHeading = page
      .getByRole('heading', { name: /review payroll|payroll for|edit payroll|hours.*earnings/i })
      .first()
    await expect(executionHeading).toBeVisible({ timeout: 60000 })

    await expect(page.getByRole('button', { name: /save and exit/i }).first()).toBeVisible({
      timeout: 30000,
    })
  })
})
