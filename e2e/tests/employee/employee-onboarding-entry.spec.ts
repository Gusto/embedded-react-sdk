import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('EmployeeOnboarding — entry into Add Employee', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'employee/employee-onboarding-entry',
    })
  })

  test('opens employee list and exposes the Add CTA', async ({ page }) => {
    await page.goto('/?flow=employee-onboarding')

    await page.waitForLoadState('domcontentloaded')
    await waitForLoadingComplete(page, 30000)

    const addButton = page.getByRole('button', { name: /Add/i })
    await addButton.waitFor({ state: 'visible', timeout: 30000 })
    await expect(addButton).toBeVisible()
  })

  test('clicking Add opens basics form with first/last name and SSN inputs', async ({ page }) => {
    await page.goto('/?flow=employee-onboarding')

    await page.waitForLoadState('domcontentloaded')
    await waitForLoadingComplete(page, 30000)

    const addButton = page.getByRole('button', { name: /Add/i })
    await addButton.waitFor({ state: 'visible', timeout: 30000 })
    await addButton.click()
    await waitForLoadingComplete(page)

    await expect(page.getByLabel(/first name/i)).toBeVisible({ timeout: 30000 })
    await expect(page.getByLabel(/last name/i)).toBeVisible()
    await expect(page.getByLabel(/social/i)).toBeVisible()
  })
})
