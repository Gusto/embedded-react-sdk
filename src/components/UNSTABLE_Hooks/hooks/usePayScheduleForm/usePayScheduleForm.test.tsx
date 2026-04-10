import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { usePayScheduleForm } from './usePayScheduleForm'
import type { UsePayScheduleFormResult } from './usePayScheduleForm'
import { createPayScheduleSchema, PayScheduleErrorCodes } from './payScheduleSchema'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { getFixture } from '@/test/mocks/fixtures/getFixture'
import { API_BASE_URL } from '@/test/constants'

type ReadyResult = Extract<UsePayScheduleFormResult, { isLoading: false }>

function assertReady(hookResult: UsePayScheduleFormResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

function setupPaymentConfigsMock() {
  server.use(
    http.get(`${API_BASE_URL}/v1/companies/:company_uuid/payment_configs`, () => {
      return HttpResponse.json({
        payment_speed: '2-day',
        fast_payment_limit: 5000000,
      })
    }),
  )
}

describe('usePayScheduleForm', () => {
  let createRequestBody: Record<string, unknown> | null = null
  let updateRequestBody: Record<string, unknown> | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    createRequestBody = null
    updateRequestBody = null
    setupApiTestMocks()
    setupPaymentConfigsMock()
  })

  describe('create mode', () => {
    beforeEach(() => {
      server.use(
        http.post(`${API_BASE_URL}/v1/companies/:company_id/pay_schedules`, async ({ request }) => {
          createRequestBody = (await request.json()) as Record<string, unknown>
          const responseFixture = await getFixture('post-v1-companies-company_id-pay_schedules')
          return HttpResponse.json({ ...responseFixture, ...createRequestBody }, { status: 201 })
        }),
      )
    })

    it('returns ready state with create mode when no payScheduleId is provided', async () => {
      const { result } = renderHook(
        () =>
          usePayScheduleForm({
            companyId: 'company-1',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.status.mode).toBe('create')
      expect(readyResult.data.paySchedule).toBeNull()
      expect(readyResult.form.Fields.CustomName).toBeDefined()
      expect(readyResult.form.Fields.Frequency).toBeDefined()
      expect(readyResult.form.Fields.AnchorPayDate).toBeDefined()
      expect(readyResult.form.Fields.AnchorEndOfPayPeriod).toBeDefined()
      // Day1/Day2 are undefined for weekly (only shown for Monthly / Twice per month custom)
      expect(readyResult.form.Fields.Day1).toBeUndefined()
      expect(readyResult.form.Fields.Day2).toBeUndefined()
    })

    it('conditionally shows Day1 for Monthly frequency', async () => {
      const { result } = renderHook(
        () =>
          usePayScheduleForm({
            companyId: 'company-1',
            defaultValues: { frequency: 'Monthly' },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      assertReady(result.current)
      expect(result.current.form.Fields.Day1).toBeDefined()
      expect(result.current.form.Fields.Day2).toBeUndefined()
      expect(result.current.form.Fields.CustomTwicePerMonth).toBeUndefined()
    })

    it('creates a pay schedule with weekly frequency', async () => {
      const { result } = renderHook(
        () =>
          usePayScheduleForm({
            companyId: 'company-1',
            defaultValues: {
              customName: 'Weekly Test',
              frequency: 'Every week',
              anchorPayDate: '2026-05-01',
              anchorEndOfPayPeriod: '2026-04-24',
            },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      await act(async () => {
        await readyResult.actions.onSubmit()
      })

      expect(createRequestBody).not.toBeNull()
      expect(createRequestBody?.frequency).toBe('Every week')
      expect(createRequestBody?.anchor_pay_date).toBe('2026-05-01')
      expect(createRequestBody?.anchor_end_of_pay_period).toBe('2026-04-24')
      expect(createRequestBody?.custom_name).toBe('Weekly Test')
    })

    it('returns a create submit result on success', async () => {
      const { result } = renderHook(
        () =>
          usePayScheduleForm({
            companyId: 'company-1',
            defaultValues: {
              customName: 'New Schedule',
              frequency: 'Every week',
              anchorPayDate: '2026-05-01',
              anchorEndOfPayPeriod: '2026-04-24',
            },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      let submitResult: unknown
      await act(async () => {
        submitResult = await readyResult.actions.onSubmit()
      })

      expect(submitResult).toEqual(expect.objectContaining({ mode: 'create' }))
    })

    it('sends day1 and day2 for monthly frequency', async () => {
      const { result } = renderHook(
        () =>
          usePayScheduleForm({
            companyId: 'company-1',
            defaultValues: {
              customName: 'Monthly',
              frequency: 'Monthly',
              anchorPayDate: '2026-05-01',
              anchorEndOfPayPeriod: '2026-04-30',
              day1: 1,
            },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      await act(async () => {
        await readyResult.actions.onSubmit()
      })

      expect(createRequestBody).not.toBeNull()
      expect(createRequestBody?.frequency).toBe('Monthly')
      expect(createRequestBody?.day_1).toBe(1)
    })

    it('blocks submission when required fields are empty', async () => {
      const { result } = renderHook(
        () =>
          usePayScheduleForm({
            companyId: 'company-1',
            defaultValues: {
              customName: '',
              frequency: 'Every week',
              anchorPayDate: '',
              anchorEndOfPayPeriod: '',
            },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      await act(async () => {
        await readyResult.actions.onSubmit()
      })

      expect(createRequestBody).toBeNull()
    })

    it('exposes paymentSpeedDays from payment configs', async () => {
      const { result } = renderHook(() => usePayScheduleForm({ companyId: 'company-1' }), {
        wrapper: GustoTestProvider,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      assertReady(result.current)
      expect(result.current.data.paymentSpeedDays).toBe(2)
    })
  })

  describe('update mode', () => {
    beforeEach(() => {
      server.use(
        http.get(
          `${API_BASE_URL}/v1/companies/:company_id/pay_schedules/:pay_schedule_id`,
          async () => {
            const fixture = await getFixture('get-v1-companies-company_id-pay_schedules')
            return HttpResponse.json(fixture.paySchedules[0])
          },
        ),
        http.put(
          `${API_BASE_URL}/v1/companies/:company_id/pay_schedules/:schedule_id`,
          async ({ request }) => {
            updateRequestBody = (await request.json()) as Record<string, unknown>
            const fixture = await getFixture(
              'put-v1-companies-company_id-pay_schedules-pay_schedule_id',
            )
            return HttpResponse.json({ ...fixture, ...updateRequestBody })
          },
        ),
      )
    })

    it('returns ready state with update mode when payScheduleId is provided', async () => {
      const { result } = renderHook(
        () =>
          usePayScheduleForm({
            companyId: 'company-1',
            payScheduleId: 'schedule-1',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.status.mode).toBe('update')
      expect(readyResult.data.paySchedule).not.toBeNull()
    })

    it('pre-populates form with existing schedule data', async () => {
      const { result } = renderHook(
        () =>
          usePayScheduleForm({
            companyId: 'company-1',
            payScheduleId: 'schedule-1',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      assertReady(result.current)
      const schedule = result.current.data.paySchedule
      expect(schedule?.frequency).toBe('Every week')
      expect(schedule?.customName).toBe('Weekly Schedule')
    })

    it('updates a pay schedule and sends version', async () => {
      const { result } = renderHook(
        () =>
          usePayScheduleForm({
            companyId: 'company-1',
            payScheduleId: 'schedule-1',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      await act(async () => {
        await readyResult.actions.onSubmit()
      })

      expect(updateRequestBody).not.toBeNull()
      expect(updateRequestBody?.version).toBeDefined()
    })

    it('returns an update submit result on success', async () => {
      const { result } = renderHook(
        () =>
          usePayScheduleForm({
            companyId: 'company-1',
            payScheduleId: 'schedule-1',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      let submitResult: unknown
      await act(async () => {
        submitResult = await readyResult.actions.onSubmit()
      })

      expect(submitResult).toEqual(expect.objectContaining({ mode: 'update' }))
    })
  })
})

// ── Schema-level tests ──────────────────────────────────────────────────

const VALID_FORM_DATA = {
  customName: 'Test Schedule',
  frequency: 'Every week' as const,
  customTwicePerMonth: '',
  anchorPayDate: '2026-05-01',
  anchorEndOfPayPeriod: '2026-04-24',
  day1: 0,
  day2: 0,
}

function getFieldErrors(
  result: ReturnType<ReturnType<typeof createPayScheduleSchema>[0]['safeParse']>,
) {
  if (result.success) return {}
  const errors: Record<string, string[]> = {}
  for (const issue of result.error.issues) {
    const path = issue.path.join('.')
    if (!errors[path]) errors[path] = []
    errors[path].push(issue.message)
  }
  return errors
}

describe('createPayScheduleSchema', () => {
  it('validates a basic weekly schedule', () => {
    const [schema] = createPayScheduleSchema({ mode: 'create' })
    const result = schema.safeParse(VALID_FORM_DATA)
    expect(result.success).toBe(true)
  })

  it('requires anchorPayDate', () => {
    const [schema] = createPayScheduleSchema({ mode: 'create' })
    const result = schema.safeParse({ ...VALID_FORM_DATA, anchorPayDate: null })
    const errors = getFieldErrors(result)
    expect(errors.anchorPayDate).toBeDefined()
  })

  it('requires anchorEndOfPayPeriod', () => {
    const [schema] = createPayScheduleSchema({ mode: 'create' })
    const result = schema.safeParse({ ...VALID_FORM_DATA, anchorEndOfPayPeriod: null })
    const errors = getFieldErrors(result)
    expect(errors.anchorEndOfPayPeriod).toBeDefined()
  })

  describe('day1/day2 conditional requirements', () => {
    it('requires day1 for Monthly frequency', () => {
      const [schema] = createPayScheduleSchema({ mode: 'create' })
      const result = schema.safeParse({
        ...VALID_FORM_DATA,
        frequency: 'Monthly',
        day1: 0,
      })
      const errors = getFieldErrors(result)
      expect(errors.day1).toContain(PayScheduleErrorCodes.REQUIRED)
    })

    it('does not require day1 for weekly frequencies', () => {
      const [schema] = createPayScheduleSchema({ mode: 'create' })
      const result = schema.safeParse({
        ...VALID_FORM_DATA,
        frequency: 'Every week',
        day1: 0,
      })
      expect(result.success).toBe(true)
    })

    it('requires day1 and day2 for Twice per month custom', () => {
      const [schema] = createPayScheduleSchema({ mode: 'create' })
      const result = schema.safeParse({
        ...VALID_FORM_DATA,
        frequency: 'Twice per month',
        customTwicePerMonth: 'custom',
        day1: 0,
        day2: 0,
      })
      const errors = getFieldErrors(result)
      expect(errors.day1).toContain(PayScheduleErrorCodes.REQUIRED)
      expect(errors.day2).toContain(PayScheduleErrorCodes.REQUIRED)
    })

    it('does not require day1/day2 for Twice per month 1st15th preset', () => {
      const [schema] = createPayScheduleSchema({ mode: 'create' })
      const result = schema.safeParse({
        ...VALID_FORM_DATA,
        frequency: 'Twice per month',
        customTwicePerMonth: '1st15th',
        day1: 0,
        day2: 0,
      })
      expect(result.success).toBe(true)
    })

    it('produces DAY_RANGE error for day1 > 31', () => {
      const [schema] = createPayScheduleSchema({ mode: 'create' })
      const result = schema.safeParse({
        ...VALID_FORM_DATA,
        frequency: 'Monthly',
        day1: 32,
      })
      const errors = getFieldErrors(result)
      expect(errors.day1).toContain(PayScheduleErrorCodes.DAY_RANGE)
    })

    it('produces DAY_RANGE error for day2 > 31', () => {
      const [schema] = createPayScheduleSchema({ mode: 'create' })
      const result = schema.safeParse({
        ...VALID_FORM_DATA,
        frequency: 'Twice per month',
        customTwicePerMonth: 'custom',
        day1: 10,
        day2: 32,
      })
      const errors = getFieldErrors(result)
      expect(errors.day2).toContain(PayScheduleErrorCodes.DAY_RANGE)
    })

    it('accepts valid day values', () => {
      const [schema] = createPayScheduleSchema({ mode: 'create' })
      const result = schema.safeParse({
        ...VALID_FORM_DATA,
        frequency: 'Twice per month',
        customTwicePerMonth: 'custom',
        day1: 10,
        day2: 25,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('fieldsMetadata', () => {
    it('reports day1 as required for Monthly', () => {
      const [, { getFieldsMetadata }] = createPayScheduleSchema({ mode: 'create' })
      const metadata = getFieldsMetadata({ frequency: 'Monthly', customTwicePerMonth: '' })
      expect(metadata.day1.isRequired).toBe(true)
      expect(metadata.day2.isRequired).toBe(false)
    })

    it('reports day1 and day2 as required for Twice per month custom', () => {
      const [, { getFieldsMetadata }] = createPayScheduleSchema({ mode: 'create' })
      const metadata = getFieldsMetadata({
        frequency: 'Twice per month',
        customTwicePerMonth: 'custom',
      })
      expect(metadata.day1.isRequired).toBe(true)
      expect(metadata.day2.isRequired).toBe(true)
    })

    it('reports day1 and day2 as not required for Twice per month 1st15th', () => {
      const [, { getFieldsMetadata }] = createPayScheduleSchema({ mode: 'create' })
      const metadata = getFieldsMetadata({
        frequency: 'Twice per month',
        customTwicePerMonth: '1st15th',
      })
      expect(metadata.day1.isRequired).toBe(false)
      expect(metadata.day2.isRequired).toBe(false)
    })

    it('reports day1 and day2 as not required for weekly', () => {
      const [, { getFieldsMetadata }] = createPayScheduleSchema({ mode: 'create' })
      const metadata = getFieldsMetadata({ frequency: 'Every week', customTwicePerMonth: '' })
      expect(metadata.day1.isRequired).toBe(false)
      expect(metadata.day2.isRequired).toBe(false)
    })

    it('customTwicePerMonth is always optional', () => {
      const [, { getFieldsMetadata }] = createPayScheduleSchema({ mode: 'create' })
      const metadata = getFieldsMetadata()
      expect(metadata.customTwicePerMonth.isRequired).toBe(false)
    })
  })

  describe('optionalFieldsToRequire', () => {
    it('makes customTwicePerMonth required when specified', () => {
      const [schema] = createPayScheduleSchema({
        mode: 'create',
        optionalFieldsToRequire: { create: ['customTwicePerMonth'] },
      })
      const result = schema.safeParse({ ...VALID_FORM_DATA, customTwicePerMonth: '' })
      expect(result.success).toBe(false)
    })

    it('metadata reflects partner override', () => {
      const [, { getFieldsMetadata }] = createPayScheduleSchema({
        mode: 'create',
        optionalFieldsToRequire: { create: ['customTwicePerMonth'] },
      })
      const metadata = getFieldsMetadata()
      expect(metadata.customTwicePerMonth.isRequired).toBe(true)
    })
  })
})
