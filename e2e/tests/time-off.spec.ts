import { test, expect } from '../utils/localTestFixture'
import { waitForLoadingComplete } from '../utils/helpers'

test.describe('TimeOffFlow', () => {
  test('loads the time-off flow and displays the policy list', async ({ page }) => {
    await page.goto('/?flow=time-off&companyId=123')
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /time.?off|holiday/i }).first()).toBeVisible({
      timeout: 30000,
    })
  })
})

// The tests below were added in #1617 but assume a UI shape that doesn't exist:
// they look for `getByRole('button').filter({ hasText: /vacation|sick|pto/i })`,
// but PolicyListPresentation renders policy names as <Text> inside a DataView grid,
// not as buttons. Reaching AddEmployeesToPolicy requires navigating the full
// Create Policy flow (PolicyTypeSelector -> PolicyDetailsForm -> [PolicySettings ->]
// AddEmployees). Skipping until the SelectEmployees feature owners can rewrite
// these against the real flow with local validation.
test.describe.skip('SelectEmployees - Add employees to time-off policy', () => {
  test('navigates to add employees step and displays employee table', async ({ page }) => {
    await page.goto('/?flow=time-off&companyId=123')
    await waitForLoadingComplete(page)

    const policyLink = page
      .getByRole('button')
      .filter({ hasText: /vacation|sick|pto/i })
      .first()
    await expect(policyLink).toBeVisible({ timeout: 30000 })
    await policyLink.click()
    await waitForLoadingComplete(page)

    const addEmployeesButton = page
      .getByRole('button')
      .filter({ hasText: /add employees/i })
      .first()
    await expect(addEmployeesButton).toBeVisible({ timeout: 30000 })
    await addEmployeesButton.click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
      timeout: 30000,
    })
    await expect(page.getByPlaceholder(/search employees/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /back/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible()
  })

  test('employee table renders in table mode (not card mode)', async ({ page }) => {
    await page.goto('/?flow=time-off&companyId=123')
    await waitForLoadingComplete(page)

    const policyLink = page
      .getByRole('button')
      .filter({ hasText: /vacation|sick|pto/i })
      .first()
    await expect(policyLink).toBeVisible({ timeout: 30000 })
    await policyLink.click()
    await waitForLoadingComplete(page)

    const addEmployeesButton = page
      .getByRole('button')
      .filter({ hasText: /add employees/i })
      .first()
    await expect(addEmployeesButton).toBeVisible({ timeout: 30000 })
    await addEmployeesButton.click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
      timeout: 30000,
    })

    // Table mode has column headers; card mode does not
    await expect(page.getByRole('columnheader', { name: /name/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /department/i })).toBeVisible()
  })

  test('can search to filter employees', async ({ page }) => {
    await page.goto('/?flow=time-off&companyId=123')
    await waitForLoadingComplete(page)

    const policyLink = page
      .getByRole('button')
      .filter({ hasText: /vacation|sick|pto/i })
      .first()
    await expect(policyLink).toBeVisible({ timeout: 30000 })
    await policyLink.click()
    await waitForLoadingComplete(page)

    const addEmployeesButton = page
      .getByRole('button')
      .filter({ hasText: /add employees/i })
      .first()
    await expect(addEmployeesButton).toBeVisible({ timeout: 30000 })
    await addEmployeesButton.click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
      timeout: 30000,
    })

    const searchInput = page.getByPlaceholder(/search employees/i)
    const initialRowCount = await page.getByRole('row').count()

    await searchInput.fill('zzz_no_match_expected')

    // Empty state or reduced results
    await expect(
      page.getByText(/no employees found/i).or(page.getByRole('row').nth(1)),
    ).toBeVisible({ timeout: 10000 })

    const filteredRowCount = await page.getByRole('row').count()
    expect(filteredRowCount).toBeLessThanOrEqual(initialRowCount)
  })

  test('can select employees and continue', async ({ page }) => {
    await page.goto('/?flow=time-off&companyId=123')
    await waitForLoadingComplete(page)

    const policyLink = page
      .getByRole('button')
      .filter({ hasText: /vacation|sick|pto/i })
      .first()
    await expect(policyLink).toBeVisible({ timeout: 30000 })
    await policyLink.click()
    await waitForLoadingComplete(page)

    const addEmployeesButton = page
      .getByRole('button')
      .filter({ hasText: /add employees/i })
      .first()
    await expect(addEmployeesButton).toBeVisible({ timeout: 30000 })
    await addEmployeesButton.click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
      timeout: 30000,
    })

    // Skip the select-all header checkbox (row 0 is the column header, row 1 is the first employee)
    const firstEmployeeRow = page.getByRole('row').nth(1)
    const firstCheckbox = firstEmployeeRow.getByRole('checkbox')
    await firstCheckbox.check()
    await expect(firstCheckbox).toBeChecked()

    // Continue — should not error
    await page.getByRole('button', { name: /continue/i }).click()
    await waitForLoadingComplete(page)
  })
})

// Same root cause as the time-off describe above — selector mismatch with the actual UI.
test.describe.skip('SelectEmployees - Add employees to holiday pay policy', () => {
  test('navigates to add holiday employees step', async ({ page, localConfig }) => {
    test.skip(
      !localConfig.isLocal,
      'Holiday flow requires real backend — MSW mocks return 404 for the holiday pay policy',
    )

    await page.goto('/?flow=time-off&companyId=123')
    await waitForLoadingComplete(page)

    const holidayTab = page
      .getByRole('button')
      .filter({ hasText: /holiday/i })
      .first()
    await expect(holidayTab).toBeVisible({ timeout: 30000 })
    await holidayTab.click()
    await waitForLoadingComplete(page)

    const addEmployeesButton = page
      .getByRole('button')
      .filter({ hasText: /add employees/i })
      .first()
    await expect(addEmployeesButton).toBeVisible({ timeout: 30000 })
    await addEmployeesButton.click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
      timeout: 30000,
    })

    // Holiday mode does NOT show the reassignment warning
    await expect(
      page.getByText(/employees can only be enrolled in one time-off policy/i),
    ).not.toBeVisible()
  })
})
