import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpResponse } from 'msw'
import { useCompensationForm } from './useCompensationForm'
import type { UseCompensationFormResult } from './useCompensationForm'
import { createCompensationSchema, CompensationErrorCodes } from './compensationSchema'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeJobs, handleCreateEmployeeJob } from '@/test/mocks/apis/employees'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { getFixture } from '@/test/mocks/fixtures/getFixture'

type ReadyResult = Extract<UseCompensationFormResult, { isLoading: false }>

function assertReady(hookResult: UseCompensationFormResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

const VALID_DEFAULTS = {
  jobTitle: 'Software Engineer',
  rate: 50,
}

describe('useCompensationForm start date handling', () => {
  let createJobRequestBody: Record<string, unknown> | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    createJobRequestBody = null
    setupApiTestMocks()
    server.use(
      handleGetEmployeeJobs(() => HttpResponse.json([])),
      handleCreateEmployeeJob(async ({ request }) => {
        createJobRequestBody = (await request.json()) as Record<string, unknown>
        const responseFixture = await getFixture('get-v1-employees-employee_id-jobs')
        return HttpResponse.json(
          {
            ...responseFixture[0],
            title: createJobRequestBody.title,
            hire_date: createJobRequestBody.hireDate,
          },
          { status: 201 },
        )
      }),
    )
  })

  it('blocks submission when startDate is missing in create mode', async () => {
    const { result } = renderHook(
      () =>
        useCompensationForm({
          employeeId: 'emp-1',
          defaultValues: VALID_DEFAULTS,
        }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)

    const submitResult = await act(async () => {
      return (result.current as ReadyResult).actions.onSubmit()
    })

    expect(submitResult).toBeUndefined()
    expect(createJobRequestBody).toBeNull()
  })

  it('creates a job with hireDate from options.startDate when field is hidden', async () => {
    const { result } = renderHook(
      () =>
        useCompensationForm({
          employeeId: 'emp-1',
          withStartDateField: false,
          defaultValues: VALID_DEFAULTS,
        }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const readyResult = result.current
    assertReady(readyResult)

    await act(async () => {
      await readyResult.actions.onSubmit({}, { startDate: '2024-06-15' })
    })

    expect(result.current.errorHandling.errors).toHaveLength(0)
    expect(createJobRequestBody).not.toBeNull()
    expect(createJobRequestBody?.hire_date).toBe('2024-06-15')
  })

  it('creates a job with hireDate from the form when withStartDateField is enabled', async () => {
    const { result } = renderHook(
      () =>
        useCompensationForm({
          employeeId: 'emp-1',
          withStartDateField: true,
          defaultValues: {
            ...VALID_DEFAULTS,
            startDate: '2024-03-20',
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

    expect(result.current.errorHandling.errors).toHaveLength(0)
    expect(createJobRequestBody).not.toBeNull()
    expect(createJobRequestBody?.hire_date).toBe('2024-03-20')
  })

  it('form start date takes precedence over options.startDate', async () => {
    const { result } = renderHook(
      () =>
        useCompensationForm({
          employeeId: 'emp-1',
          withStartDateField: true,
          defaultValues: {
            ...VALID_DEFAULTS,
            startDate: '2024-03-20',
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
      await readyResult.actions.onSubmit({}, { startDate: '2024-09-01' })
    })

    expect(createJobRequestBody).not.toBeNull()
    expect(createJobRequestBody?.hire_date).toBe('2024-03-20')
  })
})

const VALID_FORM_DATA = {
  jobTitle: 'Software Engineer',
  flsaStatus: 'Nonexempt' as const,
  paymentUnit: 'Hour' as const,
  rate: 50,
  startDate: '2024-06-15',
  adjustForMinimumWage: false,
  minimumWageId: '',
  stateWcCovered: false,
  stateWcClassCode: '',
  twoPercentShareholder: false,
}

function getFieldErrors(
  result: ReturnType<ReturnType<typeof createCompensationSchema>['schema']['safeParse']>,
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

describe('createCompensationSchema error codes', () => {
  it('produces REQUIRED for missing startDate when required', () => {
    const { schema } = createCompensationSchema({ mode: 'create', withStartDateField: true })
    const result = schema.safeParse({ ...VALID_FORM_DATA, startDate: null })
    const errors = getFieldErrors(result)

    expect(errors.startDate).toContain(CompensationErrorCodes.REQUIRED)
  })

  it('does not error on startDate when not required', () => {
    const { schema } = createCompensationSchema({ mode: 'create', withStartDateField: false })
    const result = schema.safeParse({ ...VALID_FORM_DATA, startDate: null })

    expect(result.success).toBe(true)
  })

  it('produces RATE_MINIMUM for rate of 0', () => {
    const { schema } = createCompensationSchema({ mode: 'create', withStartDateField: true })
    const result = schema.safeParse({ ...VALID_FORM_DATA, rate: 0 })
    const errors = getFieldErrors(result)

    expect(errors.rate).toContain(CompensationErrorCodes.RATE_MINIMUM)
  })

  it('produces RATE_MINIMUM for NaN rate', () => {
    const { schema } = createCompensationSchema({ mode: 'create', withStartDateField: true })
    const result = schema.safeParse({ ...VALID_FORM_DATA, rate: NaN })
    const errors = getFieldErrors(result)

    expect(errors.rate).toContain(CompensationErrorCodes.RATE_MINIMUM)
  })
})

describe('createCompensationSchema superRefine unblocking', () => {
  it('reports rate errors even when startDate is missing', () => {
    const { schema } = createCompensationSchema({ mode: 'create', withStartDateField: true })
    const result = schema.safeParse({ ...VALID_FORM_DATA, startDate: null, rate: 0 })
    const errors = getFieldErrors(result)

    expect(errors.startDate).toContain(CompensationErrorCodes.REQUIRED)
    expect(errors.rate).toContain(CompensationErrorCodes.RATE_MINIMUM)
  })

  it('reports payment unit errors even when startDate is missing', () => {
    const { schema } = createCompensationSchema({ mode: 'create', withStartDateField: true })
    const result = schema.safeParse({
      ...VALID_FORM_DATA,
      startDate: null,
      flsaStatus: 'Owner' as const,
      paymentUnit: 'Hour' as const,
    })
    const errors = getFieldErrors(result)

    expect(errors.startDate).toContain(CompensationErrorCodes.REQUIRED)
    expect(errors.paymentUnit).toContain(CompensationErrorCodes.PAYMENT_UNIT_OWNER)
  })

  it('reports RATE_MINIMUM before RATE_EXEMPT_THRESHOLD for low values', () => {
    const { schema } = createCompensationSchema({ mode: 'create', withStartDateField: true })
    const result = schema.safeParse({
      ...VALID_FORM_DATA,
      flsaStatus: 'Exempt' as const,
      rate: 0,
    })
    const errors = getFieldErrors(result)

    expect(errors.rate).toContain(CompensationErrorCodes.RATE_MINIMUM)
    expect(errors.rate).not.toContain(CompensationErrorCodes.RATE_EXEMPT_THRESHOLD)
  })
})
