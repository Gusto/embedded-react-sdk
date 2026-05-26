import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('EmployeeOnboardingFlow - update re-entry from list lifecycle', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test('opens edit on the existing employee and renders profile pre-filled', async ({
    page,
    scenario,
  }) => {
    test.skip(!scenario.flowToken, 'Requires scenario provisioning (local/demo runs only)')
    test.setTimeout(180_000)

    await page.goto('/?flow=employee-onboarding')
    await waitForLoadingComplete(page, 30000)

    await expect(page.getByRole('button', { name: /Add/i })).toBeVisible({ timeout: 30000 })

    const grid = page.getByRole('grid').or(page.getByRole('table')).first()
    await expect(grid).toBeVisible({ timeout: 15000 })

    const menuTrigger = page.getByRole('button', { name: /employee actions menu/i }).first()
    await expect(menuTrigger).toBeVisible({ timeout: 15000 })
    await menuTrigger.click()

    await page
      .getByRole('menuitem', { name: /edit employee/i })
      .first()
      .click()
    await waitForLoadingComplete(page, 30000)

    const firstNameField = page.getByLabel(/first name/i).first()
    await expect(firstNameField).toBeVisible({ timeout: 30000 })

    const firstNameValue = await firstNameField.inputValue()
    expect(firstNameValue.length).toBeGreaterThan(0)
  })
})
