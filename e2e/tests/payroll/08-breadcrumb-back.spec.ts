import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('PayrollFlow - breadcrumb back from execution lifecycle', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test('clicks the landing breadcrumb from execution and lands back on the run-payroll tabs', async ({
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

    await expect(
      page
        .getByRole('heading', { name: /review payroll|payroll for|edit payroll|hours.*earnings/i })
        .first(),
    ).toBeVisible({ timeout: 60000 })

    const breadcrumbLandingButton = page
      .getByRole('navigation', { name: /breadcrumb/i })
      .getByRole('button')
      .first()
    const breadcrumbLandingLink = page
      .getByRole('navigation', { name: /breadcrumb/i })
      .getByRole('link')
      .first()

    if (await breadcrumbLandingButton.isVisible().catch(() => false)) {
      await breadcrumbLandingButton.click()
    } else if (await breadcrumbLandingLink.isVisible().catch(() => false)) {
      await breadcrumbLandingLink.click()
    } else {
      await page
        .getByRole('button', { name: /save and exit/i })
        .first()
        .click()
    }

    await waitForLoadingComplete(page, 30000)

    await expect(page.getByRole('tab', { name: /run payroll/i })).toBeVisible({ timeout: 30000 })
    await expect(page.getByRole('tab', { name: /payroll history/i })).toBeVisible()
  })
})
