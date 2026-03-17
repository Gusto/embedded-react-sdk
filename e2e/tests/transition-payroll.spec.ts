import { test, expect } from '../utils/localTestFixture'
import { waitForLoadingComplete, fillDate } from '../utils/helpers'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

const MSW_TRANSITION_URL =
  '/?flow=transition&companyId=123&startDate=2025-08-14&endDate=2025-08-27&payScheduleUuid=1478a82e-b45c-4980-843a-6ddc3b78268e'

interface TransitionSetupState {
  ready: boolean
  startDate: string
  endDate: string
  payScheduleUuid: string
}

const transitionState: TransitionSetupState = {
  ready: false,
  startDate: '',
  endDate: '',
  payScheduleUuid: '',
}

interface PaySchedule {
  uuid: string
  frequency: string
  version: string
  anchor_pay_date: string
  anchor_end_of_pay_period: string
}

interface PayPeriod {
  start_date: string
  end_date: string
  pay_schedule_uuid: string
  payroll: { processed: boolean }
}

function getGWSFlowsBase(): string {
  return process.env.E2E_GWS_FLOWS_HOST || 'https://flows.gusto-demo.com'
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${getGWSFlowsBase()}${endpoint}`)
  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    console.log(`[transition-setup] GET ${endpoint} failed (${response.status}): ${errorBody}`)
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

async function putApi<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${getGWSFlowsBase()}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const errorText = await response.text()
    console.log(`[transition-setup] PUT ${endpoint} failed (${response.status}): ${errorText}`)
    throw new Error(`API PUT failed: ${response.status} - ${errorText}`)
  }
  return response.json()
}

function getTargetFrequencyConfig(currentFrequency: string) {
  const SEMIMONTHLY = {
    frequency: 'Twice per month',
    getAnchorDates: () => {
      const today = new Date()
      const anchorPayDate = new Date(today.getFullYear(), today.getMonth() + 1, 15)
      const anchorEndOfPayPeriod = new Date(anchorPayDate)
      anchorEndOfPayPeriod.setDate(anchorPayDate.getDate() - 1)
      return { anchorPayDate, anchorEndOfPayPeriod }
    },
    extraParams: { day_1: 15, day_2: 31 },
  }

  const BIWEEKLY = {
    frequency: 'Every other week',
    getAnchorDates: () => {
      const today = new Date()
      const anchorPayDate = new Date(today)
      anchorPayDate.setDate(today.getDate() + 14)
      const anchorEndOfPayPeriod = new Date(anchorPayDate)
      anchorEndOfPayPeriod.setDate(anchorPayDate.getDate() - 1)
      return { anchorPayDate, anchorEndOfPayPeriod }
    },
    extraParams: {},
  }

  return currentFrequency === SEMIMONTHLY.frequency ? BIWEEKLY : SEMIMONTHLY
}

async function fetchUnprocessedTransitionPeriods(
  flowToken: string,
  companyId: string,
): Promise<PayPeriod[]> {
  const today = new Date()
  const rangeStart = new Date(today)
  rangeStart.setMonth(today.getMonth() - 2)
  const rangeEnd = new Date(today)
  rangeEnd.setDate(today.getDate() + 89)

  const endpoint =
    `/fe_sdk/${flowToken}/v1/companies/${companyId}/pay_periods` +
    `?start_date=${rangeStart.toISOString().split('T')[0]}` +
    `&end_date=${rangeEnd.toISOString().split('T')[0]}` +
    `&payroll_types=transition`
  const periods = await fetchApi<PayPeriod[]>(endpoint)
  return periods.filter(p => !p.payroll?.processed)
}

async function ensureProcessedPayroll(
  flowToken: string,
  companyId: string,
): Promise<boolean> {
  const today = new Date()
  const rangeStart = new Date(today)
  rangeStart.setMonth(today.getMonth() - 3)
  const rangeEnd = new Date(today)
  rangeEnd.setDate(today.getDate() + 30)

  const endpoint =
    `/fe_sdk/${flowToken}/v1/companies/${companyId}/pay_periods` +
    `?start_date=${rangeStart.toISOString().split('T')[0]}` +
    `&end_date=${rangeEnd.toISOString().split('T')[0]}`
  const periods = await fetchApi<PayPeriod[]>(endpoint)

  const hasProcessed = periods.some(p => p.payroll?.processed)
  if (hasProcessed) {
    console.log('[transition-setup] Company has processed payroll history')
    return true
  }

  const unprocessedPast = periods.find(
    p => !p.payroll?.processed && p.payroll?.payroll_type === 'regular' && p.end_date <= today.toISOString().split('T')[0],
  )
  if (!unprocessedPast) {
    console.log('[transition-setup] No past unprocessed regular payroll available to process')
    return false
  }

  const payrollUuid = unprocessedPast.payroll.payroll_uuid
  console.log(`[transition-setup] Processing payroll ${payrollUuid} (${unprocessedPast.start_date} to ${unprocessedPast.end_date})...`)

  const prepareEndpoint = `/fe_sdk/${flowToken}/v1/companies/${companyId}/payrolls/${payrollUuid}/prepare`
  await putApi(prepareEndpoint, {})

  const calculateEndpoint = `/fe_sdk/${flowToken}/v1/companies/${companyId}/payrolls/${payrollUuid}/calculate`
  await putApi(calculateEndpoint, {})

  const maxPollAttempts = 20
  for (let i = 0; i < maxPollAttempts; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const payroll = await fetchApi<{ processed: boolean; processing_request?: { status: string } }>(
      `/fe_sdk/${flowToken}/v1/companies/${companyId}/payrolls/${payrollUuid}`,
    )
    if (payroll.processing_request?.status === 'calculate_success') {
      console.log('[transition-setup] Payroll calculated, submitting...')
      const submitEndpoint = `/fe_sdk/${flowToken}/v1/companies/${companyId}/payrolls/${payrollUuid}/submit`
      await putApi(submitEndpoint, {})
      break
    }
    if (payroll.processing_request?.status === 'calculate_failed') {
      console.log('[transition-setup] Payroll calculation failed')
      return false
    }
  }

  for (let i = 0; i < maxPollAttempts; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const payroll = await fetchApi<{ processed: boolean }>(
      `/fe_sdk/${flowToken}/v1/companies/${companyId}/payrolls/${payrollUuid}`,
    )
    if (payroll.processed) {
      console.log('[transition-setup] Payroll processed successfully')
      return true
    }
  }

  console.log('[transition-setup] Payroll processing timed out')
  return false
}

async function createTransitionPeriodViaScheduleChange(
  flowToken: string,
  companyId: string,
  payScheduleUuid: string,
): Promise<{ startDate: string; endDate: string } | null> {
  const hasHistory = await ensureProcessedPayroll(flowToken, companyId)
  if (!hasHistory) {
    console.log('[transition-setup] Cannot create transition period without processed payroll history')
    return null
  }

  const scheduleEndpoint = `/fe_sdk/${flowToken}/v1/companies/${companyId}/pay_schedules/${payScheduleUuid}`
  const schedule = await fetchApi<PaySchedule>(scheduleEndpoint)

  console.log(`[transition-setup] Current schedule: frequency="${schedule.frequency}", version="${schedule.version}"`)

  const targetConfig = getTargetFrequencyConfig(schedule.frequency)
  const { anchorPayDate, anchorEndOfPayPeriod } = targetConfig.getAnchorDates()

  console.log(
    `[transition-setup] Changing pay schedule from "${schedule.frequency}" to "${targetConfig.frequency}"...`,
  )

  await putApi<PaySchedule>(scheduleEndpoint, {
    version: schedule.version,
    frequency: targetConfig.frequency,
    anchor_pay_date: anchorPayDate.toISOString().split('T')[0],
    anchor_end_of_pay_period: anchorEndOfPayPeriod.toISOString().split('T')[0],
    ...targetConfig.extraParams,
  })

  const periods = await fetchUnprocessedTransitionPeriods(flowToken, companyId)
  if (periods.length > 0) {
    return { startDate: periods[0].start_date, endDate: periods[0].end_date }
  }

  console.log('[transition-setup] First frequency change did not produce a transition period, retrying with toggle...')

  const updatedSchedule = await fetchApi<PaySchedule>(scheduleEndpoint)
  const retryConfig = getTargetFrequencyConfig(updatedSchedule.frequency)
  const retryDates = retryConfig.getAnchorDates()

  await putApi<PaySchedule>(scheduleEndpoint, {
    version: updatedSchedule.version,
    frequency: retryConfig.frequency,
    anchor_pay_date: retryDates.anchorPayDate.toISOString().split('T')[0],
    anchor_end_of_pay_period: retryDates.anchorEndOfPayPeriod.toISOString().split('T')[0],
    ...retryConfig.extraParams,
  })

  const retryPeriods = await fetchUnprocessedTransitionPeriods(flowToken, companyId)
  if (retryPeriods.length > 0) {
    return { startDate: retryPeriods[0].start_date, endDate: retryPeriods[0].end_date }
  }

  return null
}

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

function getTransitionUrl(): string {
  if (transitionState.ready) {
    return `/?flow=transition&companyId=123&startDate=${transitionState.startDate}&endDate=${transitionState.endDate}&payScheduleUuid=${transitionState.payScheduleUuid}`
  }
  return MSW_TRANSITION_URL
}

test.describe('TransitionFlow', () => {
  test.beforeAll(async () => {
    const isLocal = process.env.E2E_LOCAL === 'true'
    if (!isLocal) return

    const statePath = resolve(process.cwd(), 'e2e/.e2e-state.json')
    if (!existsSync(statePath)) {
      console.warn('[transition-setup] No .e2e-state.json found, cannot set up transition period')
      return
    }

    const state = JSON.parse(readFileSync(statePath, 'utf-8'))
    const flowToken = process.env.E2E_FLOW_TOKEN || ''
    const companyId = state.companyId
    const payScheduleUuid = state.payScheduleUuid

    if (!flowToken || !companyId || !payScheduleUuid) {
      console.warn('[transition-setup] Missing flowToken, companyId, or payScheduleUuid')
      return
    }

    console.log('[transition-setup] Setting up transition period...')

    try {
      const existingPeriods = await fetchUnprocessedTransitionPeriods(flowToken, companyId)
      if (existingPeriods.length > 0) {
        console.log(`[transition-setup] Reusing existing transition period: ${existingPeriods[0].start_date} to ${existingPeriods[0].end_date}`)
        transitionState.ready = true
        transitionState.startDate = existingPeriods[0].start_date
        transitionState.endDate = existingPeriods[0].end_date
        transitionState.payScheduleUuid = payScheduleUuid
        return
      }

      const result = await createTransitionPeriodViaScheduleChange(flowToken, companyId, payScheduleUuid)
      if (result) {
        console.log(`[transition-setup] Created transition period: ${result.startDate} to ${result.endDate}`)
        transitionState.ready = true
        transitionState.startDate = result.startDate
        transitionState.endDate = result.endDate
        transitionState.payScheduleUuid = payScheduleUuid
      } else {
        console.error('[transition-setup] Could not create transition period after 2 attempts')
      }
    } catch (error) {
      console.error(`[transition-setup] Failed: ${error}`)
    }
  })

  test.describe('Creation Page', () => {
    test('displays the creation page with pre-filled details', async ({ page }) => {
      await page.goto(getTransitionUrl())
      await waitForLoadingComplete(page)

      await expect(
        page.getByRole('heading', { name: /transition payroll/i, level: 2 }),
      ).toBeVisible({ timeout: 30000 })

      await expect(page.getByText(/pay period/i)).toBeVisible()
      await expect(page.getByText(/check date/i).first()).toBeVisible()
    })

    test('shows transition explanation alert', async ({ page }) => {
      await page.goto(getTransitionUrl())
      await waitForLoadingComplete(page)

      await expect(page.getByRole('alert')).toBeVisible({ timeout: 30000 })
    })

    test('displays transition details with dates', async ({ page }) => {
      await page.goto(getTransitionUrl())
      await waitForLoadingComplete(page)

      await expect(
        page.getByRole('heading', { name: /transition details/i }),
      ).toBeVisible({ timeout: 30000 })

      const datePattern = /\w{3}\s+\d{1,2},\s+\d{4}\s*-\s*\w{3}\s+\d{1,2},\s+\d{4}/
      await expect(page.getByText(datePattern)).toBeVisible()
    })

    test('requires check date before submission', async ({ page }) => {
      await page.goto(getTransitionUrl())
      await waitForLoadingComplete(page)

      await expect(
        page.getByRole('heading', { name: /transition payroll/i, level: 2 }),
      ).toBeVisible({ timeout: 30000 })

      const continueButton = page.getByRole('button', { name: /continue/i })
      await expect(continueButton).toBeVisible()
      await continueButton.click()

      await expect(page.getByText(/check date is required/i)).toBeVisible({ timeout: 10000 })
    })

    test('displays deductions radio group defaulting to include', async ({ page }) => {
      await page.goto(getTransitionUrl())
      await waitForLoadingComplete(page)

      await expect(
        page.getByRole('heading', { name: /transition payroll/i, level: 2 }),
      ).toBeVisible({ timeout: 30000 })

      await expect(
        page.getByLabel(/make all the regular deductions and contributions/i),
      ).toBeVisible()
      await expect(page.getByLabel(/block all deductions and contributions/i)).toBeVisible()

      await expect(
        page.getByLabel(/make all the regular deductions and contributions/i),
      ).toBeChecked()
    })

    test('displays tax withholding rates table with edit button', async ({ page }) => {
      await page.goto(getTransitionUrl())
      await waitForLoadingComplete(page)

      await expect(
        page.getByRole('heading', { name: /transition payroll/i, level: 2 }),
      ).toBeVisible({ timeout: 30000 })

      await expect(page.getByRole('heading', { name: /tax withholding rates/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /edit/i })).toBeVisible()
      await expect(page.getByText(/regular hours, regular wages, tips/i)).toBeVisible()
      await expect(page.getByText(/supplemental wages, bonus wages, commission/i)).toBeVisible()
      await expect(page.getByText(/reimbursements/i)).toBeVisible()
    })
  })

  test.describe('Deductions and Tax Config Interaction', () => {
    test('can switch deductions to block mode', async ({ page }) => {
      await page.goto(getTransitionUrl())
      await waitForLoadingComplete(page)

      await expect(
        page.getByRole('heading', { name: /transition payroll/i, level: 2 }),
      ).toBeVisible({ timeout: 30000 })

      const blockRadio = page.getByLabel(/block all deductions and contributions/i)
      await blockRadio.click()

      await expect(blockRadio).toBeChecked()
      await expect(
        page.getByLabel(/make all the regular deductions and contributions/i),
      ).not.toBeChecked()
    })

    test('can open and close tax withholding edit modal', async ({ page }) => {
      await page.goto(getTransitionUrl())
      await waitForLoadingComplete(page)

      await expect(
        page.getByRole('heading', { name: /transition payroll/i, level: 2 }),
      ).toBeVisible({ timeout: 30000 })

      await page.getByRole('button', { name: /edit/i }).click()

      await expect(
        page.getByText('Rate for regular wages and earnings'),
      ).toBeVisible({ timeout: 10000 })

      const cancelButton = page.getByRole('button', { name: /cancel/i }).first()
      await cancelButton.click()

      await expect(
        page.getByText('Rate for regular wages and earnings'),
      ).not.toBeVisible({ timeout: 5000 })

      await expect(page.getByRole('heading', { name: /tax withholding rates/i })).toBeVisible()
    })
  })

  test.describe('Creation to Execution', () => {
    test('creates payroll with default settings and enters execution', async ({
      page,
      localConfig,
    }) => {
      test.skip(
        localConfig.isLocal && !transitionState.ready,
        'Transition period setup failed -- cannot create transition payroll against real API',
      )

      await page.goto(getTransitionUrl())
      await waitForLoadingComplete(page)

      await expect(
        page.getByRole('heading', { name: /transition payroll/i, level: 2 }),
      ).toBeVisible({ timeout: 30000 })

      const checkDate = getCheckDate(transitionState.endDate || undefined)
      await fillDate(page, /check date/i, checkDate)

      await page.getByRole('button', { name: /continue/i }).click()

      await waitForLoadingComplete(page, 90000)

      const executionContent = page
        .getByRole('heading', { name: /hours.*earnings/i })
        .or(page.getByRole('heading', { name: /payroll/i }))
      await expect(executionContent.first()).toBeVisible({ timeout: 60000 })
    })

    test('creates payroll with blocked deductions and enters execution', async ({
      page,
      localConfig,
    }) => {
      test.skip(
        localConfig.isLocal && !transitionState.ready,
        'Transition period setup failed -- cannot create transition payroll against real API',
      )

      await page.goto(getTransitionUrl())
      await waitForLoadingComplete(page)

      await expect(
        page.getByRole('heading', { name: /transition payroll/i, level: 2 }),
      ).toBeVisible({ timeout: 30000 })

      await page.getByLabel(/block all deductions and contributions/i).click()
      await expect(
        page.getByLabel(/block all deductions and contributions/i),
      ).toBeChecked()

      const checkDate = getCheckDate(transitionState.endDate || undefined)
      await fillDate(page, /check date/i, checkDate)

      await page.getByRole('button', { name: /continue/i }).click()

      await waitForLoadingComplete(page, 90000)

      const executionContent = page
        .getByRole('heading', { name: /hours.*earnings/i })
        .or(page.getByRole('heading', { name: /payroll/i }))
      await expect(executionContent.first()).toBeVisible({ timeout: 60000 })
    })
  })

  test.describe('Full Flow', () => {
    test('completes full flow from creation through payroll receipt', async ({
      page,
      localConfig,
    }) => {
      test.skip(
        localConfig.isLocal && !transitionState.ready,
        'Transition period setup failed -- cannot run full flow against real API',
      )

      await page.goto(getTransitionUrl())
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

      await expect(
        page.getByRole('heading', { name: /transition payroll/i, level: 2 }),
      ).toBeVisible({ timeout: 30000 })

      const checkDate = getCheckDate(transitionState.endDate || undefined)
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

      if (!(await reviewHeading.isVisible().catch(() => false))) {
        await expect(reviewHeading).toBeVisible({ timeout: 180000 })
      }

      const wireOption = page.getByRole('radio', { name: /wire funds/i })
      const fourDayOption = page.getByRole('radio', { name: /4-day/i })

      if (await wireOption.isVisible().catch(() => false)) {
        await wireOption.click()
      } else if (await fourDayOption.isVisible().catch(() => false)) {
        await fourDayOption.click()
      }

      const submitButton = page.getByRole('button', { name: /^submit$/i })
      await expect(submitButton).toBeEnabled({ timeout: 10000 })
      await submitButton.click()

      await waitForLoadingComplete(page, 90000)

      await expect(
        page.getByRole('heading', { name: /payroll summary/i, level: 1 }),
      ).toBeVisible({ timeout: 60000 })

      await expect(
        page.getByRole('button', { name: /view payroll receipt/i }),
      ).toBeVisible({ timeout: 10000 })
    })
  })
})
