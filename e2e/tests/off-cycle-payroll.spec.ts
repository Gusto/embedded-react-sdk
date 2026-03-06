import { test, expect } from '../utils/localTestFixture'
import { fillDate, waitForLoadingComplete } from '../utils/helpers'

test.describe('OffCyclePayrollFlow', () => {
  test('prepare is called only once when editing an employee in off-cycle flow', async ({
    page,
  }) => {
    let prepareCallCount = 0

    await page.route('**/v1/companies/*/payrolls/*/prepare', route => {
      prepareCallCount++
      return route.continue()
    })

    await page.goto('/?flow=off-cycle-payroll&companyId=123')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /new off-cycle payroll/i })).toBeVisible({
      timeout: 30000,
    })

    await fillDate(page, 'Start date', { month: 3, day: 1, year: 2026 })
    await fillDate(page, 'End date', { month: 3, day: 15, year: 2026 })
    await fillDate(page, 'Payment date', { month: 3, day: 20, year: 2026 })

    await page.getByLabel('Bonus').click()
    await page.getByLabel(/make all the regular deductions/i).click()

    const continueButton = page.getByRole('button', { name: /continue/i })
    await continueButton.click()

    await waitForLoadingComplete(page)

    await expect(page.getByRole('columnheader', { name: /employee/i })).toBeVisible({
      timeout: 30000,
    })

    const prepareCountBeforeEdit = prepareCallCount

    const editButton = page.getByRole('button', { name: 'Edit' }).first()
    await editButton.click()

    const editMenuItem = page.getByRole('menuitem', { name: 'Edit' })
    await editMenuItem.click()

    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /edit payroll for/i })).toBeVisible({
      timeout: 30000,
    })

    const prepareCallsDuringEdit = prepareCallCount - prepareCountBeforeEdit

    expect(prepareCallsDuringEdit).toBe(1)
  })

  test('no error banner appears when editing employee in off-cycle flow', async ({ page }) => {
    await page.goto('/?flow=off-cycle-payroll&companyId=123')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /new off-cycle payroll/i })).toBeVisible({
      timeout: 30000,
    })

    await fillDate(page, 'Start date', { month: 3, day: 1, year: 2026 })
    await fillDate(page, 'End date', { month: 3, day: 15, year: 2026 })
    await fillDate(page, 'Payment date', { month: 3, day: 20, year: 2026 })

    await page.getByLabel('Bonus').click()
    await page.getByLabel(/make all the regular deductions/i).click()

    const continueButton = page.getByRole('button', { name: /continue/i })
    await continueButton.click()

    await waitForLoadingComplete(page)

    await expect(page.getByRole('columnheader', { name: /employee/i })).toBeVisible({
      timeout: 30000,
    })

    const editButton = page.getByRole('button', { name: 'Edit' }).first()
    await editButton.click()

    const editMenuItem = page.getByRole('menuitem', { name: 'Edit' })
    await editMenuItem.click()

    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /edit payroll for/i })).toBeVisible({
      timeout: 30000,
    })

    const errorBanner = page.getByText(/unknown error/i)
    await expect(errorBanner).not.toBeVisible()
  })
})
