import { test, expect } from '../../utils/localTestFixture'
import { waitForLoadingComplete } from '../../utils/helpers'

test.describe('InformationRequestsFlow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?flow=information-requests&companyId=company-123')
    await waitForLoadingComplete(page)
  })

  test('renders the information requests list with status badges', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /information requests/i })).toBeVisible()

    await expect(page.getByText(/incomplete/i).first()).toBeVisible()
    await expect(page.getByText(/under review/i).first()).toBeVisible()
    await expect(page.getByText(/payroll blocking/i).first()).toBeVisible()
  })

  test('opens the response modal when Respond is clicked on a pending request', async ({
    page,
  }) => {
    const respondButtons = page.getByRole('button', { name: /^respond$/i })
    await expect(respondButtons.first()).toBeVisible()
    await respondButtons.first().click()

    await expect(page.getByRole('heading', { name: /request for information/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /submit response/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /^cancel$/i })).toBeVisible()
  })

  test('shows the payroll blocking alert inside the form for blocking requests', async ({
    page,
  }) => {
    await page
      .getByRole('button', { name: /^respond$/i })
      .first()
      .click()

    await expect(page.getByText(/payroll blocking request/i)).toBeVisible()
  })

  test('cancels back to the list without submitting', async ({ page }) => {
    await page
      .getByRole('button', { name: /^respond$/i })
      .first()
      .click()
    await expect(page.getByRole('heading', { name: /request for information/i })).toBeVisible()

    await page.getByRole('button', { name: /^cancel$/i }).click()

    await expect(page.getByRole('heading', { name: /information requests/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /request for information/i })).not.toBeVisible()
  })
})
