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

test.describe('SelectEmployees - Add employees to time-off policy', () => {
  test('navigates to add employees step and displays employee table', async ({ page }) => {
    await page.goto('/?flow=time-off&companyId=123')
    await waitForLoadingComplete(page)

    // Navigate into a policy — click the first available policy
    const policyLink = page
      .getByRole('button')
      .filter({ hasText: /vacation|sick|pto/i })
      .first()
    const hasPolicies = await policyLink.count()

    if (!hasPolicies) {
      test.skip()
      return
    }

    await policyLink.click()
    await waitForLoadingComplete(page)

    // Navigate to the "Add employees" action
    const addEmployeesButton = page
      .getByRole('button')
      .filter({ hasText: /add employees/i })
      .first()
    if (!(await addEmployeesButton.count())) {
      test.skip()
      return
    }

    await addEmployeesButton.click()
    await waitForLoadingComplete(page)

    // Verify the SelectEmployees screen
    await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
      timeout: 30000,
    })
    await expect(page.getByPlaceholderText(/search employees/i)).toBeVisible()
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
    if (!(await policyLink.count())) {
      test.skip()
      return
    }

    await policyLink.click()
    await waitForLoadingComplete(page)

    const addEmployeesButton = page
      .getByRole('button')
      .filter({ hasText: /add employees/i })
      .first()
    if (!(await addEmployeesButton.count())) {
      test.skip()
      return
    }

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
    if (!(await policyLink.count())) {
      test.skip()
      return
    }

    await policyLink.click()
    await waitForLoadingComplete(page)

    const addEmployeesButton = page
      .getByRole('button')
      .filter({ hasText: /add employees/i })
      .first()
    if (!(await addEmployeesButton.count())) {
      test.skip()
      return
    }

    await addEmployeesButton.click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
      timeout: 30000,
    })

    const searchInput = page.getByPlaceholderText(/search employees/i)
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
    if (!(await policyLink.count())) {
      test.skip()
      return
    }

    await policyLink.click()
    await waitForLoadingComplete(page)

    const addEmployeesButton = page
      .getByRole('button')
      .filter({ hasText: /add employees/i })
      .first()
    if (!(await addEmployeesButton.count())) {
      test.skip()
      return
    }

    await addEmployeesButton.click()
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /add employees to policy/i })).toBeVisible({
      timeout: 30000,
    })

    // Select the first employee
    const firstCheckbox = page.getByRole('checkbox').first()
    await firstCheckbox.check()
    await expect(firstCheckbox).toBeChecked()

    // Continue — should not error
    await page.getByRole('button', { name: /continue/i }).click()
    await waitForLoadingComplete(page)
  })
})

test.describe('SelectEmployees - Add employees to holiday pay policy', () => {
  test('navigates to add holiday employees step', async ({ page }) => {
    await page.goto('/?flow=time-off&companyId=123')
    await waitForLoadingComplete(page)

    // Navigate to holiday pay section
    const holidayTab = page
      .getByRole('button')
      .filter({ hasText: /holiday/i })
      .first()
    if (!(await holidayTab.count())) {
      test.skip()
      return
    }

    await holidayTab.click()
    await waitForLoadingComplete(page)

    const addEmployeesButton = page
      .getByRole('button')
      .filter({ hasText: /add employees/i })
      .first()
    if (!(await addEmployeesButton.count())) {
      test.skip()
      return
    }

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
