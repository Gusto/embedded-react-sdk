import { test, expect } from '../utils/localTestFixture'

const TERMINATION_URL = '/?flow=termination&companyId=123&employeeId=456'
const isRealApi = process.env.E2E_LOCAL === 'true'

function getFutureDateParts(): { month: number; day: number; year: number } {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return {
    month: date.getMonth() + 1,
    day: date.getDate(),
    year: date.getFullYear(),
  }
}

async function waitForTerminationForm(page: import('@playwright/test').Page) {
  await page
    .getByRole('heading', { name: /terminate/i })
    .waitFor({ state: 'visible', timeout: 60000 })
}

async function fillTerminationDate(page: import('@playwright/test').Page) {
  const futureDate = getFutureDateParts()
  await page.getByRole('spinbutton', { name: /^month,/i }).fill(String(futureDate.month))
  await page.getByRole('spinbutton', { name: /^day,/i }).fill(String(futureDate.day))
  await page.getByRole('spinbutton', { name: /^year,/i }).fill(String(futureDate.year))
}

async function submitTerminationForm(
  page: import('@playwright/test').Page,
  payrollOption?: 'dismissalPayroll' | 'regularPayroll' | 'anotherWay',
) {
  await fillTerminationDate(page)

  if (payrollOption && payrollOption !== 'dismissalPayroll') {
    const optionLabel = payrollOption === 'regularPayroll' ? /regular payroll/i : /another way/i
    await page.getByRole('radio', { name: optionLabel }).click()
  }

  await page.getByRole('button', { name: /terminate employee/i }).click()
}

async function waitForSummary(page: import('@playwright/test').Page) {
  await page
    .getByRole('heading', { name: /termination summary/i })
    .waitFor({ state: 'visible', timeout: 60000 })
}

test.describe('TerminationFlow', () => {
  test.describe.configure({ mode: 'serial' })

  if (isRealApi) {
    test.afterEach(async ({ localConfig }) => {
      const gwsHost = process.env.E2E_GWS_FLOWS_HOST || 'https://flows.gusto-demo.com'
      if (localConfig.flowToken && localConfig.employeeId && localConfig.employeeId !== '456') {
        try {
          await fetch(
            `${gwsHost}/fe_sdk/${localConfig.flowToken}/v1/employees/${localConfig.employeeId}/terminations`,
            { method: 'DELETE' },
          )
        } catch {
          // Employee may not have a termination
        }
      }
    })
  }

  test('terminates employee and verifies via API response', async ({ page }) => {
    await page.goto(TERMINATION_URL)
    await waitForTerminationForm(page)

    const createResponsePromise = page.waitForResponse(
      response =>
        response.request().method() === 'POST' && response.url().includes('/terminations'),
    )
    await submitTerminationForm(page, 'anotherWay')
    const createResponse = await createResponsePromise
    expect(createResponse.status()).toBe(201)

    const createBody = await createResponse.json()
    expect(createBody.effective_date).toBeTruthy()
    expect(createBody.employee_uuid).toBeTruthy()

    await waitForSummary(page)
    await expect(page.getByText(/has been successfully terminated/i)).toBeVisible()

    await page.getByRole('button', { name: /cancel termination/i }).click()
    await expect(page.getByText(/are you sure you want to cancel this termination/i)).toBeVisible({
      timeout: 10000,
    })

    const deleteResponsePromise = page.waitForResponse(
      response =>
        response.request().method() === 'DELETE' && response.url().includes('/terminations'),
    )
    await page.getByRole('button', { name: /yes, cancel termination/i }).click()
    const deleteResponse = await deleteResponsePromise
    expect(deleteResponse.status()).toBe(204)

    await waitForTerminationForm(page)
    await expect(page.getByText(/termination has been cancelled successfully/i)).toBeVisible()
  })

  test('completes dismissal payroll flow', async ({ page }) => {
    await page.goto(TERMINATION_URL)
    await waitForTerminationForm(page)

    await submitTerminationForm(page, 'dismissalPayroll')
    await waitForSummary(page)

    await expect(page.getByText(/has been successfully terminated/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /run termination payroll/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /edit termination/i })).toBeVisible()
  })

  test('completes regular payroll flow', async ({ page }) => {
    await page.goto(TERMINATION_URL)
    await waitForTerminationForm(page)

    await submitTerminationForm(page, 'regularPayroll')
    await waitForSummary(page)

    await expect(page.getByText(/has been successfully terminated/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /run termination payroll/i })).not.toBeVisible()
    await expect(page.getByRole('button', { name: /run off-cycle payroll/i })).not.toBeVisible()
    await expect(page.getByRole('button', { name: /cancel termination/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /edit termination/i })).toBeVisible()
  })

  test('completes another way flow with off-cycle payroll', async ({ page }) => {
    await page.goto(TERMINATION_URL)
    await waitForTerminationForm(page)

    await submitTerminationForm(page, 'anotherWay')
    await waitForSummary(page)

    await expect(page.getByText(/has been successfully terminated/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /run off-cycle payroll/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /run termination payroll/i })).not.toBeVisible()
  })

  test('can edit termination from summary', async ({ page }) => {
    await page.goto(TERMINATION_URL)
    await waitForTerminationForm(page)

    await submitTerminationForm(page, 'anotherWay')
    await waitForSummary(page)

    await page.getByRole('button', { name: /edit termination/i }).click()
    await waitForTerminationForm(page)

    await submitTerminationForm(page, 'regularPayroll')

    await waitForSummary(page)
    await expect(page.getByText(/has been successfully terminated/i)).toBeVisible()
  })

  test('can cancel termination from summary', async ({ page }) => {
    await page.goto(TERMINATION_URL)
    await waitForTerminationForm(page)

    await submitTerminationForm(page, 'regularPayroll')
    await waitForSummary(page)

    await page.getByRole('button', { name: /cancel termination/i }).click()

    await expect(page.getByText(/are you sure you want to cancel this termination/i)).toBeVisible({
      timeout: 10000,
    })
    await page.getByRole('button', { name: /yes, cancel termination/i }).click()
    await waitForTerminationForm(page)
    await expect(page.getByText(/termination has been cancelled successfully/i)).toBeVisible()
  })

  test('can dismiss cancel dialog', async ({ page }) => {
    await page.goto(TERMINATION_URL)
    await waitForTerminationForm(page)

    await submitTerminationForm(page, 'regularPayroll')
    await waitForSummary(page)

    await page.getByRole('button', { name: /cancel termination/i }).click()
    await expect(page.getByText(/are you sure you want to cancel this termination/i)).toBeVisible({
      timeout: 10000,
    })

    await page.getByRole('button', { name: /no, go back/i }).click()

    await expect(
      page.getByText(/are you sure you want to cancel this termination/i),
    ).not.toBeVisible()
    await expect(page.getByRole('heading', { name: /termination summary/i })).toBeVisible()
  })

  test('payroll option alerts change correctly', async ({ page }) => {
    await page.goto(TERMINATION_URL)
    await waitForTerminationForm(page)

    await expect(
      page.getByText(/after submitting, you won't be able to undo this dismissal/i),
    ).toBeVisible()

    await page.getByRole('radio', { name: /regular payroll/i }).click()
    await expect(
      page.getByText(/after their last day, you won't be able to undo this dismissal/i),
    ).toBeVisible()

    await page.getByRole('radio', { name: /another way/i }).click()
    await expect(
      page.getByText(/after their last day, you won't be able to undo this dismissal/i),
    ).toBeVisible()

    await page.getByRole('radio', { name: /dismissal payroll/i }).click()
    await expect(
      page.getByText(/after submitting, you won't be able to undo this dismissal/i),
    ).toBeVisible()
  })
})
