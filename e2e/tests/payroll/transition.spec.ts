import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('TransitionFlow — post schedule change', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'payroll/biweekly-shared',
    })
  })

  test('displays the creation page with pre-filled details', async ({ page, scenario }) => {
    test.skip(!scenario.flowToken, 'Transition tests require real API')

    await page.goto('/?flow=transition')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /transition payroll/i, level: 2 })).toBeVisible({
      timeout: 30000,
    })

    await expect(page.getByText(/pay period/i)).toBeVisible()
    await expect(page.getByText(/check date/i).first()).toBeVisible()
  })

  test('shows transition explanation alert', async ({ page, scenario }) => {
    test.skip(!scenario.flowToken, 'Transition tests require real API')

    await page.goto('/?flow=transition')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('alert')).toBeVisible({ timeout: 30000 })
  })

  test('displays deductions radio group defaulting to include', async ({ page, scenario }) => {
    test.skip(!scenario.flowToken, 'Transition tests require real API')

    await page.goto('/?flow=transition')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /transition payroll/i, level: 2 })).toBeVisible({
      timeout: 30000,
    })

    await expect(
      page.getByLabel(/make all the regular deductions and contributions/i),
    ).toBeVisible()
    await expect(page.getByLabel(/block all deductions and contributions/i)).toBeVisible()
    await expect(
      page.getByLabel(/make all the regular deductions and contributions/i),
    ).toBeChecked()
  })
})
