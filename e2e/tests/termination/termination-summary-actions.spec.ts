import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('TerminationFlow - summary cancel termination dialog lifecycle', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'dismissal/termination-employee-active',
    })
  })

  test('opens cancel termination dialog from summary, declines, asserts dialog dismissed', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(240_000)

    const employeeId = Object.values(scenario.employeeIds)[0]
    expect(employeeId).toBeTruthy()

    await page.goto(`/?flow=termination&employeeId=${employeeId}`)
    await waitForLoadingComplete(page, 60000)

    const summaryHeading = page.getByRole('heading', { name: /termination summary/i })
    const reachedSummary = await summaryHeading
      .waitFor({ state: 'visible', timeout: 15000 })
      .then(() => true)
      .catch(() => false)

    if (!reachedSummary) {
      await expect(page.getByRole('heading', { name: /^terminate/i })).toBeVisible({
        timeout: 30000,
      })

      const lastDay = new Date()
      lastDay.setDate(lastDay.getDate() + 45)
      const dateGroup = page.getByRole('group', { name: 'Last day of work' })
      await dateGroup
        .getByRole('spinbutton', { name: /^month, Last day of work$/i })
        .fill(String(lastDay.getMonth() + 1))
      await dateGroup
        .getByRole('spinbutton', { name: /^day, Last day of work$/i })
        .fill(String(lastDay.getDate()))
      await dateGroup
        .getByRole('spinbutton', { name: /^year, Last day of work$/i })
        .fill(String(lastDay.getFullYear()))

      await page.getByRole('radio', { name: /regular payroll/i }).check()
      await page.getByRole('button', { name: /terminate employee/i }).click()
      await waitForLoadingComplete(page, 60_000)
      await expect(summaryHeading).toBeVisible({ timeout: 30000 })
    }

    const cancelTerminationBtn = page.getByRole('button', { name: /^cancel termination$/i })
    await expect(cancelTerminationBtn).toBeVisible({ timeout: 15000 })
    await cancelTerminationBtn.click()

    const dialog = page.getByRole('dialog').filter({ hasText: /cancel termination/i })
    await expect(dialog).toBeVisible({ timeout: 10000 })

    await dialog.getByRole('button', { name: /no.*go back/i }).click()
    await expect(dialog).not.toBeVisible({ timeout: 10000 })
    await expect(summaryHeading).toBeVisible()
  })
})
