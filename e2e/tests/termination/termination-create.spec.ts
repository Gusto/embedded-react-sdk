import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('TerminationFlow - terminate active employee end-to-end', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'dismissal/termination-employee-active',
    })
  })

  test('selects last day + regular payroll option, submits, lands on termination summary', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(180_000)

    const employeeId = Object.values(scenario.employeeIds)[0]
    expect(employeeId).toBeTruthy()

    await page.goto(`/?flow=termination&employeeId=${employeeId}`)
    await waitForLoadingComplete(page, 60000)

    await expect(page.getByRole('heading', { name: /^terminate/i })).toBeVisible({
      timeout: 30000,
    })

    const lastDay = new Date()
    lastDay.setDate(lastDay.getDate() + 30)
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

    await expect(page.getByRole('heading', { name: /termination summary/i })).toBeVisible({
      timeout: 30000,
    })

    await expect(page.getByText(/has been successfully terminated/i).first()).toBeVisible({
      timeout: 15000,
    })
  })
})
