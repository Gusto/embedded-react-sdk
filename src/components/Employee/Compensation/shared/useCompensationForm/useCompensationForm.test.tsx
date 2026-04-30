import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, assertType } from 'vitest'
import { HttpResponse } from 'msw'
import { useCompensationForm } from './useCompensationForm'
import type { UseCompensationFormResult } from './useCompensationForm'
import {
  createCompensationSchema,
  CompensationErrorCodes,
  type CompensationOptionalFieldsToRequire,
} from './compensationSchema'
import { server } from '@/test/mocks/server'
import { handleGetEmployeeJobs, handleCreateEmployeeJob } from '@/test/mocks/apis/employees'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { getFixture } from '@/test/mocks/fixtures/getFixture'

// ── Type-level assertions for CompensationOptionalFieldsToRequire ────
// These validate at compile time that the derived type matches expectations.

assertType<CompensationOptionalFieldsToRequire>({
  update: ['jobTitle', 'flsaStatus', 'paymentUnit', 'rate', 'startDate'],
})

assertType<CompensationOptionalFieldsToRequire>({ update: ['jobTitle'] })

assertType<CompensationOptionalFieldsToRequire>({})

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
  result: ReturnType<ReturnType<typeof createCompensationSchema>[0]['safeParse']>,
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
    const [schema] = createCompensationSchema({ mode: 'create', withStartDateField: true })
    const result = schema.safeParse({ ...VALID_FORM_DATA, startDate: null })
    const errors = getFieldErrors(result)

    expect(errors.startDate).toContain(CompensationErrorCodes.REQUIRED)
  })

  it('does not error on startDate when not required', () => {
    const [schema] = createCompensationSchema({ mode: 'create', withStartDateField: false })
    const result = schema.safeParse({ ...VALID_FORM_DATA, startDate: null })

    expect(result.success).toBe(true)
  })

  it('produces RATE_MINIMUM for rate of 0', () => {
    const [schema] = createCompensationSchema({ mode: 'create', withStartDateField: true })
    const result = schema.safeParse({ ...VALID_FORM_DATA, rate: 0 })
    const errors = getFieldErrors(result)

    expect(errors.rate).toContain(CompensationErrorCodes.RATE_MINIMUM)
  })

  it('produces RATE_MINIMUM for NaN rate', () => {
    const [schema] = createCompensationSchema({ mode: 'create', withStartDateField: true })
    const result = schema.safeParse({ ...VALID_FORM_DATA, rate: NaN })
    const errors = getFieldErrors(result)

    expect(errors.rate).toContain(CompensationErrorCodes.RATE_MINIMUM)
  })
})

describe('CompensationOptionalFieldsToRequire typing', () => {
  it('allows update-mode overrides for create-scoped fields', () => {
    const [schema] = createCompensationSchema({
      mode: 'update',
      optionalFieldsToRequire: {
        update: ['jobTitle', 'flsaStatus', 'paymentUnit', 'rate', 'startDate'],
      },
    })
    const result = schema.safeParse({
      ...VALID_FORM_DATA,
      jobTitle: '',
    })
    expect(result.success).toBe(false)
    expect(getFieldErrors(result).jobTitle).toContain(CompensationErrorCodes.REQUIRED)
  })

  it('single field override makes only that field required on update', () => {
    const [schema] = createCompensationSchema({
      mode: 'update',
      optionalFieldsToRequire: { update: ['jobTitle'] },
    })
    const result = schema.safeParse({
      ...VALID_FORM_DATA,
      jobTitle: '',
      flsaStatus: '' as never,
    })
    const errors = getFieldErrors(result)
    expect(errors.jobTitle).toContain(CompensationErrorCodes.REQUIRED)
    expect(errors.flsaStatus).toBeUndefined()
  })

  it('update overrides do not alter create-mode metadata', () => {
    const [, withOverrideMeta] = createCompensationSchema({
      mode: 'create',
      optionalFieldsToRequire: { update: ['jobTitle', 'rate', 'startDate'] },
    })
    const [, withoutMeta] = createCompensationSchema({ mode: 'create' })

    const metaWith = withOverrideMeta.getFieldsMetadata()
    const metaWithout = withoutMeta.getFieldsMetadata()

    for (const key of Object.keys(metaWith) as Array<keyof typeof metaWith>) {
      expect(metaWith[key].isRequired).toBe(metaWithout[key].isRequired)
    }
  })

  it('metadata reflects partner override in update mode', () => {
    const [, { getFieldsMetadata }] = createCompensationSchema({
      mode: 'update',
      optionalFieldsToRequire: { update: ['rate'] },
    })
    const metadata = getFieldsMetadata()

    expect(metadata.rate.isRequired).toBe(true)
    expect(metadata.jobTitle.isRequired).toBe(false)
    expect(metadata.flsaStatus.isRequired).toBe(false)
  })

  it('metadata shows create-scoped fields as optional in update without overrides', () => {
    const [, { getFieldsMetadata }] = createCompensationSchema({
      mode: 'update',
    })
    const metadata = getFieldsMetadata()

    expect(metadata.jobTitle.isRequired).toBe(false)
    expect(metadata.flsaStatus.isRequired).toBe(false)
    expect(metadata.paymentUnit.isRequired).toBe(false)
    expect(metadata.rate.isRequired).toBe(false)
    expect(metadata.startDate.isRequired).toBe(false)
  })

  it('metadata shows create-scoped fields as required in create mode', () => {
    const [, { getFieldsMetadata }] = createCompensationSchema({
      mode: 'create',
    })
    const metadata = getFieldsMetadata()

    expect(metadata.jobTitle.isRequired).toBe(true)
    expect(metadata.flsaStatus.isRequired).toBe(true)
    expect(metadata.paymentUnit.isRequired).toBe(true)
    expect(metadata.rate.isRequired).toBe(true)
    expect(metadata.startDate.isRequired).toBe(true)
  })

  it('function-based fields reflect data in metadata', () => {
    const [, { getFieldsMetadata }] = createCompensationSchema({
      mode: 'create',
    })
    const withMinWage = getFieldsMetadata({ adjustForMinimumWage: true })
    expect(withMinWage.minimumWageId.isRequired).toBe(true)

    const withoutMinWage = getFieldsMetadata({ adjustForMinimumWage: false })
    expect(withoutMinWage.minimumWageId.isRequired).toBe(false)

    const withWc = getFieldsMetadata({ stateWcCovered: true })
    expect(withWc.stateWcClassCode.isRequired).toBe(true)

    const withoutWc = getFieldsMetadata({ stateWcCovered: false })
    expect(withoutWc.stateWcClassCode.isRequired).toBe(false)
  })

  it('unlisted fields (always-required) are required in both modes', () => {
    for (const mode of ['create', 'update'] as const) {
      const [, { getFieldsMetadata }] = createCompensationSchema({ mode })
      const metadata = getFieldsMetadata()

      expect(metadata.adjustForMinimumWage.isRequired).toBe(true)
      expect(metadata.stateWcCovered.isRequired).toBe(true)
      expect(metadata.twoPercentShareholder.isRequired).toBe(true)
    }
  })

  it('excludeFields removes startDate from validation', () => {
    const [schema] = createCompensationSchema({
      mode: 'create',
      withStartDateField: false,
    })
    const result = schema.safeParse({ ...VALID_FORM_DATA, startDate: undefined })
    expect(result.success).toBe(true)
  })
})

describe('createCompensationSchema superRefine unblocking', () => {
  it('reports rate errors even when startDate is missing', () => {
    const [schema] = createCompensationSchema({ mode: 'create', withStartDateField: true })
    const result = schema.safeParse({ ...VALID_FORM_DATA, startDate: null, rate: 0 })
    const errors = getFieldErrors(result)

    expect(errors.startDate).toContain(CompensationErrorCodes.REQUIRED)
    expect(errors.rate).toContain(CompensationErrorCodes.RATE_MINIMUM)
  })

  it('reports payment unit errors even when startDate is missing', () => {
    const [schema] = createCompensationSchema({ mode: 'create', withStartDateField: true })
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
    const [schema] = createCompensationSchema({ mode: 'create', withStartDateField: true })
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
