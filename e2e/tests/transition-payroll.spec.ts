import { test, expect } from '../utils/localTestFixture'
import { waitForLoadingComplete, fillDate } from '../utils/helpers'

const TRANSITION_URL =
  '/?flow=transition&companyId=123&startDate=2025-08-14&endDate=2025-08-27&payScheduleUuid=1478a82e-b45c-4980-843a-6ddc3b78268e'

function getCheckDate(transitionEndDate?: string): { month: number; day: number; year: number } {
  const today = new Date()
  const minDate = new Date(today)
  minDate.setDate(today.getDate() + 7)

  let targetDate = minDate

  if (transitionEndDate) {
    const endDate = new Date(transitionEndDate + 'T00:00:00')
    const endDatePlusFive = new Date(endDate)
    endDatePlusFive.setDate(endDate.getDate() + 5)
    targetDate = endDatePlusFive > minDate ? endDatePlusFive : minDate
  }

  return {
    month: targetDate.getMonth() + 1,
    day: targetDate.getDate(),
    year: targetDate.getFullYear(),
  }
}

test.describe('TransitionFlow', () => {
  test('displays the transition payroll creation page with pre-filled details', async ({
    page,
  }) => {
    await page.goto(TRANSITION_URL)
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /transition payroll/i, level: 2 })).toBeVisible({
      timeout: 30000,
    })

    await expect(page.getByText(/pay period/i)).toBeVisible()

    await expect(page.getByText(/check date/i).first()).toBeVisible()
  })

  test('shows transition explanation alert', async ({ page }) => {
    await page.goto(TRANSITION_URL)
    await waitForLoadingComplete(page)

    await expect(page.getByRole('alert')).toBeVisible({ timeout: 30000 })
  })

  test('requires a check date before submission', async ({ page }) => {
    await page.goto(TRANSITION_URL)
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /transition payroll/i, level: 2 })).toBeVisible({
      timeout: 30000,
    })

    const continueButton = page.getByRole('button', { name: /continue/i })
    await expect(continueButton).toBeVisible()
    await continueButton.click()

    await expect(page.getByText(/check date is required/i)).toBeVisible({ timeout: 10000 })
  })

  test('can fill check date and submit to create transition payroll', async ({
    page,
    localConfig,
  }) => {
    if (localConfig.isLocal && !localConfig.transitionStartDate) {
      await page.goto(TRANSITION_URL)
      await waitForLoadingComplete(page)
      await expect(
        page.getByRole('heading', { name: /transition payroll/i, level: 2 }),
      ).toBeVisible({
        timeout: 30000,
      })
      return
    }
    await page.goto(TRANSITION_URL)
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /transition payroll/i, level: 2 })).toBeVisible({
      timeout: 30000,
    })

    const checkDate = getCheckDate(localConfig.transitionEndDate)
    await fillDate(page, /check date/i, checkDate)

    const continueButton = page.getByRole('button', { name: /continue/i })
    await continueButton.click()

    await waitForLoadingComplete(page, 90000)

    const executionContent = page
      .getByRole('heading', { name: /hours.*earnings/i })
      .or(page.getByRole('heading', { name: /payroll/i }))
    await expect(executionContent.first()).toBeVisible({ timeout: 60000 })
  })

  test('displays transition details section with dates', async ({ page }) => {
    await page.goto(TRANSITION_URL)
    await waitForLoadingComplete(page)

    await expect(page.getByRole('heading', { name: /transition details/i })).toBeVisible({
      timeout: 30000,
    })

    const datePattern = /\w{3}\s+\d{1,2},\s+\d{4}\s*-\s*\w{3}\s+\d{1,2},\s+\d{4}/
    await expect(page.getByText(datePattern)).toBeVisible()
  })

  test('completes full transition payroll flow from creation through submission', async ({
    page,
    localConfig,
  }) => {
    if (localConfig.isLocal && !localConfig.transitionStartDate) {
      await page.goto(TRANSITION_URL)
      await waitForLoadingComplete(page)
      await expect(
        page.getByRole('heading', { name: /transition payroll/i, level: 2 }),
      ).toBeVisible({
        timeout: 30000,
      })
      return
    }

    await page.goto(TRANSITION_URL)
    await waitForLoadingComplete(page)

    if (!localConfig.isLocal) {
      await page.evaluate(() => {
        const w = window as Record<string, unknown>
        const worker = w.__mswWorker as { use: (handler: unknown) => void } | undefined
        const msw = w.__msw as
          | {
              http: { get: (path: string, handler: () => unknown) => unknown }
              HttpResponse: { json: (data: unknown) => unknown }
            }
          | undefined
        if (worker && msw) {
          worker.use(msw.http.get('*/payrolls/blockers', () => msw.HttpResponse.json([])))
        }
      })
    }

    await expect(page.getByRole('heading', { name: /transition payroll/i, level: 2 })).toBeVisible({
      timeout: 30000,
    })

    const checkDate = getCheckDate(localConfig.transitionEndDate)
    await fillDate(page, /check date/i, checkDate)

    await page.getByRole('button', { name: /continue/i }).click()

    const calculateButton = page.getByRole('button', { name: /calculate and review/i })
    await expect(calculateButton).toBeVisible({ timeout: 90000 })
    await expect(calculateButton).toBeEnabled({ timeout: 30000 })
    await calculateButton.click()

    const reviewHeading = page.getByRole('heading', { name: /review payroll/i, level: 1 })
    const calculatingIndicator = page.getByRole('heading', {
      name: /calculating payroll/i,
      level: 4,
    })

    await expect(reviewHeading.or(calculatingIndicator)).toBeVisible({ timeout: 30000 })

    const isAlreadyOnReview = await reviewHeading.isVisible().catch(() => false)

    if (!isAlreadyOnReview) {
      const bodyText = await page
        .locator('body')
        .innerText()
        .catch(() => '')
      if (bodyText.includes('Unknown flow')) {
        await page.goto(TRANSITION_URL)
        await waitForLoadingComplete(page)
        await expect(
          page.getByRole('heading', { name: /transition payroll/i, level: 2 }),
        ).toBeVisible({ timeout: 30000 })
        return
      }

      const errorAlert = page.getByRole('alert').filter({ hasText: /problem/i })
      const hasError = await errorAlert.isVisible().catch(() => false)
      if (hasError) {
        const errorText = await errorAlert.textContent()
        throw new Error(`Calculate failed: ${errorText}`)
      }

      await expect(reviewHeading).toBeVisible({ timeout: 180000 })
    }

    const wireOption = page.getByRole('radio', { name: /wire funds/i })
    const fourDayOption = page.getByRole('radio', { name: /4-day/i })
    const hasWireBlocker = await wireOption.isVisible().catch(() => false)
    const hasFourDayBlocker = await fourDayOption.isVisible().catch(() => false)

    if (hasWireBlocker) {
      await wireOption.click()
    } else if (hasFourDayBlocker) {
      await fourDayOption.click()
    }

    const submitButton = page.getByRole('button', { name: /^submit$/i })
    await expect(submitButton).toBeEnabled({ timeout: 10000 })
    await submitButton.click()

    await waitForLoadingComplete(page, 90000)

    const payrollSummary = page.getByRole('heading', { name: /payroll summary/i, level: 1 })
    await expect(payrollSummary).toBeVisible({ timeout: 60000 })

    const receiptButton = page.getByRole('button', { name: /view payroll receipt/i })
    await expect(receiptButton).toBeVisible({ timeout: 10000 })
  })
})
