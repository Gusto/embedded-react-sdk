import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, assertType, vi } from 'vitest'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { QueryClient } from '@tanstack/react-query'
import { invalidateAllJobsAndCompensationsGetJobs } from '@gusto/embedded-api/react-query/jobsAndCompensationsGetJobs'
import { useCompensationForm } from './useCompensationForm'
import type { UseCompensationFormResult } from './useCompensationForm'
import {
  createCompensationSchema,
  CompensationErrorCodes,
  type CompensationFormData,
  type CompensationOptionalFieldsToRequire,
} from './compensationSchema'
import { server } from '@/test/mocks/server'
import {
  handleGetEmployeeJobs,
  handleUpdateEmployeeCompensation,
} from '@/test/mocks/apis/employees'
import { handleCreateCompensation } from '@/test/mocks/apis/compensations'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import {
  buildCompensation,
  buildEmployeeWithJobs,
  buildJob,
} from '@/test/factories/jobsAndCompensations'
import { API_BASE_URL } from '@/test/constants'
import { FlsaStatus, PAY_PERIODS } from '@/shared/constants'

assertType<CompensationOptionalFieldsToRequire>({ update: ['title'] })
assertType<CompensationOptionalFieldsToRequire>({})

type ReadyResult = Extract<UseCompensationFormResult, { isLoading: false }>

function assertReady(hookResult: UseCompensationFormResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

function todayISO(): string {
  const d = new Date()
  return `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function tomorrowISO(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const VALID_FORM_DATA: CompensationFormData = {
  title: '',
  flsaStatus: FlsaStatus.NONEXEMPT,
  paymentUnit: PAY_PERIODS.HOUR,
  rate: 20,
  effectiveDate: '2024-12-24',
  adjustForMinimumWage: false,
  minimumWageId: '',
}

describe('createCompensationSchema', () => {
  it('requires flsaStatus, paymentUnit, rate, effectiveDate on create', () => {
    const [schema] = createCompensationSchema({ mode: 'create' })
    const result = schema.safeParse({ ...VALID_FORM_DATA, effectiveDate: null })
    expect(result.success).toBe(false)
  })

  it('does NOT require effectiveDate on update', () => {
    const [schema] = createCompensationSchema({ mode: 'update' })
    const result = schema.safeParse({ ...VALID_FORM_DATA, effectiveDate: null })
    expect(result.success).toBe(true)
  })

  it('keeps title optional in both modes (title belongs to useJobForm on create)', () => {
    const [createSchema] = createCompensationSchema({ mode: 'create' })
    const [updateSchema] = createCompensationSchema({ mode: 'update' })
    expect(createSchema.safeParse({ ...VALID_FORM_DATA, title: '' }).success).toBe(true)
    expect(updateSchema.safeParse({ ...VALID_FORM_DATA, title: '' }).success).toBe(true)
  })

  it('rejects effectiveDate before hireDate on create (EFFECTIVE_DATE_BEFORE_HIRE)', () => {
    const [schema] = createCompensationSchema({ mode: 'create', hireDate: '2024-12-24' })
    const result = schema.safeParse({ ...VALID_FORM_DATA, effectiveDate: '2024-12-23' })
    expect(result.success).toBe(false)
    if (result.success) return
    const issue = result.error.issues.find(i => String(i.path[0]) === 'effectiveDate')
    expect(issue?.message).toBe(CompensationErrorCodes.EFFECTIVE_DATE_BEFORE_HIRE)
  })

  it('does NOT enforce hireDate lower bound on update', () => {
    // Loaded comp.effectiveDate may legitimately predate the parent job's
    // hireDate (e.g. carried over from a stub or out-of-order data). The API
    // accepts the unchanged value or omitting it entirely on PUT, so the
    // schema must not block the submit — partners whose flow doesn't render
    // Fields.EffectiveDate would otherwise be trapped with no way to recover.
    const [schema] = createCompensationSchema({ mode: 'update', hireDate: '2025-05-08' })
    const result = schema.safeParse({ ...VALID_FORM_DATA, effectiveDate: '2020-01-01' })
    expect(result.success).toBe(true)
  })

  it('rejects effectiveDate before minEffectiveDate on create (EFFECTIVE_DATE_BEFORE_MIN)', () => {
    const [schema] = createCompensationSchema({
      mode: 'create',
      minEffectiveDate: '2099-01-02',
    })
    const result = schema.safeParse({ ...VALID_FORM_DATA, effectiveDate: '2099-01-01' })
    expect(result.success).toBe(false)
    if (result.success) return
    const issue = result.error.issues.find(i => String(i.path[0]) === 'effectiveDate')
    expect(issue?.message).toBe(CompensationErrorCodes.EFFECTIVE_DATE_BEFORE_MIN)
  })

  it('rejects effectiveDate before minEffectiveDate on update (EFFECTIVE_DATE_BEFORE_MIN)', () => {
    // Unlike hireDate, minEffectiveDate is enforced in both modes — callers
    // only supply it when the carve-out cannot fire (e.g. secondary jobs).
    const [schema] = createCompensationSchema({
      mode: 'update',
      minEffectiveDate: '2099-01-02',
    })
    const result = schema.safeParse({ ...VALID_FORM_DATA, effectiveDate: '2099-01-01' })
    expect(result.success).toBe(false)
    if (result.success) return
    const issue = result.error.issues.find(i => String(i.path[0]) === 'effectiveDate')
    expect(issue?.message).toBe(CompensationErrorCodes.EFFECTIVE_DATE_BEFORE_MIN)
  })

  it('accepts effectiveDate equal to minEffectiveDate', () => {
    const [schema] = createCompensationSchema({
      mode: 'create',
      minEffectiveDate: '2099-01-01',
    })
    const result = schema.safeParse({ ...VALID_FORM_DATA, effectiveDate: '2099-01-01' })
    expect(result.success).toBe(true)
  })

  it('does not raise EFFECTIVE_DATE_BEFORE_MIN when minEffectiveDate is absent', () => {
    const [schema] = createCompensationSchema({ mode: 'create' })
    const result = schema.safeParse({ ...VALID_FORM_DATA, effectiveDate: '2000-01-01' })
    expect(result.success).toBe(true)
  })

  it('Owner must use Paycheck (PAYMENT_UNIT_OWNER)', () => {
    const [schema] = createCompensationSchema({ mode: 'create' })
    const result = schema.safeParse({
      ...VALID_FORM_DATA,
      flsaStatus: FlsaStatus.OWNER,
      paymentUnit: PAY_PERIODS.YEAR,
      rate: 100,
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const issue = result.error.issues.find(i => String(i.path[0]) === 'paymentUnit')
    expect(issue?.message).toBe(CompensationErrorCodes.PAYMENT_UNIT_OWNER)
  })

  it('Commission Only must use Year (PAYMENT_UNIT_COMMISSION) and rate=0 (RATE_COMMISSION_ZERO)', () => {
    const [schema] = createCompensationSchema({ mode: 'create' })
    const badPaymentUnit = schema.safeParse({
      ...VALID_FORM_DATA,
      flsaStatus: FlsaStatus.COMMISSION_ONLY_NONEXEMPT,
      paymentUnit: PAY_PERIODS.HOUR,
      rate: 0,
    })
    expect(badPaymentUnit.success).toBe(false)

    const badRate = schema.safeParse({
      ...VALID_FORM_DATA,
      flsaStatus: FlsaStatus.COMMISSION_ONLY_NONEXEMPT,
      paymentUnit: PAY_PERIODS.YEAR,
      rate: 100,
    })
    expect(badRate.success).toBe(false)
    if (badRate.success) return
    const issue = badRate.error.issues.find(i => String(i.path[0]) === 'rate')
    expect(issue?.message).toBe(CompensationErrorCodes.RATE_COMMISSION_ZERO)
  })

  it('rate must be at least 1 for Nonexempt/Exempt/Salaried Nonexempt', () => {
    const [schema] = createCompensationSchema({ mode: 'create' })
    const result = schema.safeParse({
      ...VALID_FORM_DATA,
      flsaStatus: FlsaStatus.NONEXEMPT,
      rate: 0,
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const issue = result.error.issues.find(i => String(i.path[0]) === 'rate')
    expect(issue?.message).toBe(CompensationErrorCodes.RATE_MINIMUM)
  })

  it('Exempt rate must clear FLSA overtime salary threshold (yearly)', () => {
    const [schema] = createCompensationSchema({ mode: 'create' })
    const result = schema.safeParse({
      ...VALID_FORM_DATA,
      flsaStatus: FlsaStatus.EXEMPT,
      paymentUnit: PAY_PERIODS.YEAR,
      rate: 100,
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const issue = result.error.issues.find(i => String(i.path[0]) === 'rate')
    expect(issue?.message).toBe(CompensationErrorCodes.RATE_EXEMPT_THRESHOLD)
  })

  it('minimumWageId required only when adjustForMinimumWage is true', () => {
    const [schema] = createCompensationSchema({ mode: 'create' })
    expect(
      schema.safeParse({ ...VALID_FORM_DATA, adjustForMinimumWage: false, minimumWageId: '' })
        .success,
    ).toBe(true)
    const bad = schema.safeParse({
      ...VALID_FORM_DATA,
      adjustForMinimumWage: true,
      minimumWageId: '',
    })
    expect(bad.success).toBe(false)
    if (bad.success) return
    expect(bad.error.issues.some(i => String(i.path[0]) === 'minimumWageId')).toBe(true)
  })

  it('metadata reflects mode-driven required fields', () => {
    const [, { getFieldsMetadata: createMeta }] = createCompensationSchema({ mode: 'create' })
    const create = createMeta()
    expect(create.flsaStatus.isRequired).toBe(true)
    expect(create.paymentUnit.isRequired).toBe(true)
    expect(create.rate.isRequired).toBe(true)
    expect(create.effectiveDate.isRequired).toBe(true)
    expect(create.title.isRequired).toBe(false)

    const [, { getFieldsMetadata: updateMeta }] = createCompensationSchema({ mode: 'update' })
    const update = updateMeta()
    expect(update.flsaStatus.isRequired).toBe(false)
    expect(update.effectiveDate.isRequired).toBe(false)
  })

  it('drops effectiveDate from validation when withEffectiveDateField is false', () => {
    const [schema] = createCompensationSchema({ mode: 'create', withEffectiveDateField: false })
    const { effectiveDate: _omit, ...rest } = VALID_FORM_DATA
    const result = schema.safeParse(rest)
    expect(result.success).toBe(true)
  })
})

describe('useCompensationForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  describe('verb routing', () => {
    it('update mode → PUT /v1/compensations/:id with version (onboarding stub-fill)', async () => {
      let updateCompensationBody: Record<string, unknown> | null = null
      let updateCompensationPath: string | null = null
      const updateCompensationResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        updateCompensationPath = new URL(request.url).pathname
        updateCompensationBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          uuid: 'compensation-uuid',
          version: 'compensation-version-456',
          job_uuid: 'job-uuid',
          rate: updateCompensationBody.rate,
          payment_unit: updateCompensationBody.paymentUnit ?? 'Hour',
          flsa_status: updateCompensationBody.flsaStatus ?? 'Nonexempt',
          effective_date: updateCompensationBody.effectiveDate ?? '2024-12-24',
          adjust_for_minimum_wage: updateCompensationBody.adjustForMinimumWage ?? false,
        })
      })
      const createCompensationResolver = vi.fn(() => HttpResponse.json({}, { status: 201 }))

      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
        handleUpdateEmployeeCompensation(updateCompensationResolver),
        handleCreateCompensation(createCompensationResolver),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            compensationId: 'compensation-uuid',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.status.mode).toBe('update')

      const { formMethods } = result.current.form.hookFormInternals
      act(() => {
        formMethods.setValue('rate', 25)
      })

      await act(async () => {
        assertReady(result.current)
        await result.current.actions.onSubmit()
      })

      expect(updateCompensationResolver).toHaveBeenCalledTimes(1)
      expect(updateCompensationPath).toBe('/v1/compensations/compensation-uuid')
      expect(updateCompensationBody).toMatchObject({
        version: 'compensation-version-123',
        rate: '25',
      })
      expect(createCompensationResolver).not.toHaveBeenCalled()
    })

    it('update mode → resolves comp + parent job from compensationId alone (no jobId)', async () => {
      let updateCompensationBody: Record<string, unknown> | null = null
      let updateCompensationPath: string | null = null
      const updateCompensationResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        updateCompensationPath = new URL(request.url).pathname
        updateCompensationBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          uuid: 'compensation-uuid',
          version: 'compensation-version-456',
          job_uuid: 'job-uuid',
          rate: updateCompensationBody.rate,
          payment_unit: updateCompensationBody.paymentUnit ?? 'Hour',
          flsa_status: updateCompensationBody.flsaStatus ?? 'Nonexempt',
          effective_date: updateCompensationBody.effectiveDate ?? '2024-12-24',
          adjust_for_minimum_wage: updateCompensationBody.adjustForMinimumWage ?? false,
        })
      })
      const createCompensationResolver = vi.fn(() => HttpResponse.json({}, { status: 201 }))

      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
        handleUpdateEmployeeCompensation(updateCompensationResolver),
        handleCreateCompensation(createCompensationResolver),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            compensationId: 'compensation-uuid',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)

      expect(result.current.data.compensation?.uuid).toBe('compensation-uuid')
      expect(result.current.data.currentJob?.uuid).toBe('job-uuid')
      expect(result.current.status.mode).toBe('update')

      const { formMethods } = result.current.form.hookFormInternals
      act(() => {
        formMethods.setValue('rate', 25)
      })

      await act(async () => {
        assertReady(result.current)
        await result.current.actions.onSubmit()
      })

      expect(updateCompensationResolver).toHaveBeenCalledTimes(1)
      expect(updateCompensationPath).toBe('/v1/compensations/compensation-uuid')
      expect(updateCompensationBody).toMatchObject({
        version: 'compensation-version-123',
        rate: '25',
      })
      expect(createCompensationResolver).not.toHaveBeenCalled()
    })

    it('create mode → POST /v1/jobs/:jobId/compensations (future-dated change)', async () => {
      let createCompensationBody: Record<string, unknown> | null = null
      let createCompensationPath: string | null = null
      const createCompensationResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        createCompensationPath = new URL(request.url).pathname
        createCompensationBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          {
            uuid: 'new-compensation-uuid',
            version: 'v1',
            job_uuid: 'job-uuid',
            rate: createCompensationBody.rate,
            payment_unit: createCompensationBody.paymentUnit ?? 'Hour',
            flsa_status: createCompensationBody.flsaStatus ?? 'Nonexempt',
            effective_date: createCompensationBody.effectiveDate ?? '2099-01-01',
            adjust_for_minimum_wage: false,
          },
          { status: 201 },
        )
      })
      const updateCompensationResolver = vi.fn(() => HttpResponse.json({}))

      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
        handleCreateCompensation(createCompensationResolver),
        handleUpdateEmployeeCompensation(updateCompensationResolver),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            defaultValues: { rate: 30, effectiveDate: '2099-01-01' },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.status.mode).toBe('create')

      await act(async () => {
        assertReady(result.current)
        await result.current.actions.onSubmit()
      })

      expect(createCompensationResolver).toHaveBeenCalledTimes(1)
      expect(createCompensationPath).toBe('/v1/jobs/job-uuid/compensations')
      expect(createCompensationBody).toMatchObject({
        rate: '30',
        effective_date: '2099-01-01',
      })
      expect(updateCompensationResolver).not.toHaveBeenCalled()
    })

    it('options.jobId overrides hook-level jobId at submit (post-job-create chaining)', async () => {
      let createCompensationPath: string | null = null
      const createCompensationResolver = vi.fn(({ request }) => {
        createCompensationPath = new URL(request.url).pathname
        return HttpResponse.json(
          {
            uuid: 'new-compensation-uuid',
            version: 'v1',
            job_uuid: 'newly-created-job',
            rate: '30',
            payment_unit: 'Hour',
            flsa_status: 'Nonexempt',
            effective_date: '2099-01-01',
            adjust_for_minimum_wage: false,
          },
          { status: 201 },
        )
      })

      server.use(
        handleGetEmployeeJobs(() => HttpResponse.json([])),
        handleCreateCompensation(createCompensationResolver),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            defaultValues: {
              flsaStatus: FlsaStatus.NONEXEMPT,
              rate: 30,
              effectiveDate: '2099-01-01',
            },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        assertReady(result.current)
        await result.current.actions.onSubmit({ jobId: 'newly-created-job' })
      })

      expect(createCompensationResolver).toHaveBeenCalledTimes(1)
      expect(createCompensationPath).toBe('/v1/jobs/newly-created-job/compensations')
    })
  })

  describe('derived helpers', () => {
    it('flips willDeleteSecondaryJobs=true and force-clears effectiveDate to today when partner switches Nonexempt → non-Nonexempt with secondary jobs', async () => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'multiJob' })),
        ),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            compensationId: 'compensation-uuid',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.status.willDeleteSecondaryJobs).toBe(false)

      const { formMethods } = result.current.form.hookFormInternals
      act(() => {
        formMethods.setValue('flsaStatus', FlsaStatus.EXEMPT)
      })

      await waitFor(() => {
        if (result.current.isLoading) throw new Error('still loading')
        expect(result.current.status.willDeleteSecondaryJobs).toBe(true)
      })
      expect(formMethods.getValues('effectiveDate')).toBe(todayISO())
    })

    it('disables Fields.EffectiveDate via fieldsMetadata while in the carve-out branch', async () => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'multiJob' })),
        ),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            compensationId: 'compensation-uuid',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.form.fieldsMetadata.effectiveDate?.isDisabled).toBeFalsy()

      const { formMethods } = result.current.form.hookFormInternals
      act(() => {
        formMethods.setValue('flsaStatus', FlsaStatus.EXEMPT)
      })

      await waitFor(() => {
        if (result.current.isLoading) throw new Error('still loading')
        expect(result.current.form.fieldsMetadata.effectiveDate?.isDisabled).toBe(true)
      })
    })

    it('restores the prior effectiveDate when partner reverts FLSA back to Nonexempt', async () => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'multiJob' })),
        ),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            compensationId: 'compensation-uuid',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)

      const { formMethods } = result.current.form.hookFormInternals
      const priorEffectiveDate = formMethods.getValues('effectiveDate')

      act(() => {
        formMethods.setValue('flsaStatus', FlsaStatus.EXEMPT)
      })
      await waitFor(() => {
        expect(formMethods.getValues('effectiveDate')).toBe(todayISO())
      })

      act(() => {
        formMethods.setValue('flsaStatus', FlsaStatus.NONEXEMPT)
      })
      await waitFor(() => {
        if (result.current.isLoading) throw new Error('still loading')
        expect(result.current.status.willDeleteSecondaryJobs).toBe(false)
        expect(result.current.form.fieldsMetadata.effectiveDate?.isDisabled).toBeFalsy()
        expect(formMethods.getValues('effectiveDate')).toBe(priorEffectiveDate)
      })
    })

    it('willDeleteSecondaryJobs=true in create mode when scheduling future FLSA change away from Nonexempt with secondaries (effectiveDate stays editable)', async () => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'multiJob' })),
        ),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid', // primary — no compensationId → create mode
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.status.willDeleteSecondaryJobs).toBe(false)

      const { formMethods } = result.current.form.hookFormInternals
      act(() => {
        formMethods.setValue('flsaStatus', FlsaStatus.EXEMPT)
      })

      await waitFor(() => {
        if (result.current.isLoading) throw new Error('still loading')
        expect(result.current.status.willDeleteSecondaryJobs).toBe(true)
      })
      // In create mode: date must NOT be forced to today
      expect(formMethods.getValues('effectiveDate')).toBeNull()
      // In create mode: effective date field must NOT be disabled
      expect(result.current.form.fieldsMetadata.effectiveDate?.isDisabled).toBeFalsy()
    })

    it('willDeleteSecondaryJobs=false when employee has no secondary jobs (single primary)', async () => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            compensationId: 'compensation-uuid',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      const { formMethods } = result.current.form.hookFormInternals
      const priorEffectiveDate = formMethods.getValues('effectiveDate')
      act(() => {
        formMethods.setValue('flsaStatus', FlsaStatus.EXEMPT)
      })
      await new Promise(r => setTimeout(r, 20))
      expect(result.current.status.willDeleteSecondaryJobs).toBe(false)
      expect(formMethods.getValues('effectiveDate')).toBe(priorEffectiveDate)
    })

    it('willDeleteSecondaryJobs=false in create mode (compensationId not set)', async () => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'multiJob' })),
        ),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.status.willDeleteSecondaryJobs).toBe(false)
    })

    it('hasPendingFutureCompensation=true and maximumEffectiveDate set when a future comp exists', async () => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'futureCompPending' })),
        ),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            compensationId: 'compensation-uuid',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.data.hasPendingFutureCompensation).toBe(true)
      expect(result.current.data.maximumEffectiveDate).toBe('2099-01-01')
    })

    it('minimumEffectiveDate is the parent job hireDate when available', async () => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json([buildJob({ uuid: 'job-uuid', hireDate: '2020-03-15' })]),
        ),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            compensationId: 'compensation-uuid',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.data.minimumEffectiveDate).toBe('2020-03-15')
    })
  })

  describe('FLSA-driven side effects', () => {
    it('selecting Owner forces paymentUnit=Paycheck', async () => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleExempt' })),
        ),
      )
      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            compensationId: 'compensation-uuid',
          }),
        { wrapper: GustoTestProvider },
      )
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      const { formMethods } = result.current.form.hookFormInternals

      act(() => {
        formMethods.setValue('flsaStatus', FlsaStatus.OWNER)
      })
      await waitFor(() => {
        expect(formMethods.getValues('paymentUnit')).toBe(PAY_PERIODS.PAYCHECK)
      })
    })

    it('selecting Commission Only forces paymentUnit=Year and rate=0', async () => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleExempt' })),
        ),
      )
      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            compensationId: 'compensation-uuid',
          }),
        { wrapper: GustoTestProvider },
      )
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      const { formMethods } = result.current.form.hookFormInternals

      act(() => {
        formMethods.setValue('flsaStatus', FlsaStatus.COMMISSION_ONLY_NONEXEMPT)
      })
      await waitFor(() => {
        expect(formMethods.getValues('paymentUnit')).toBe(PAY_PERIODS.YEAR)
        expect(formMethods.getValues('rate')).toBe(0)
      })
    })

    it('resets adjustForMinimumWage and minimumWageId when FLSA leaves Nonexempt', async () => {
      // Min-wage adjustment is API-side gated to flsa_status: Nonexempt, but
      // because Fields.AdjustForMinimumWage / MinimumWageId stop rendering as
      // soon as FLSA leaves Nonexempt, react-hook-form would otherwise carry
      // their stale values straight into the PUT body and the server rejects
      // with "Minimum wage adjustments only valid for flsa_status: Nonexempt".
      const minWageUuid = '70c523ff-c71e-4474-9c83-a4ea51bd54a8'
      server.use(
        // Default fixture work address is in AK, which is in
        // TIP_CREDITS_UNSUPPORTED_STATES — override to TX so the gate opens.
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, () =>
          HttpResponse.json([
            {
              uuid: 'wa-uuid',
              employee_uuid: 'employee-uuid',
              location_uuid: 'tx-loc-uuid',
              effective_date: '2024-01-01',
              active: true,
              version: 'wa-v1',
              street_1: '100 Congress',
              street_2: '',
              city: 'Austin',
              state: 'TX',
              zip: '78701',
              country: 'USA',
            },
          ]),
        ),
        handleGetEmployeeJobs(() =>
          HttpResponse.json([
            buildJob({
              uuid: 'job-uuid',
              flsaStatus: FlsaStatus.NONEXEMPT,
              compensations: [
                buildCompensation({
                  uuid: 'compensation-uuid',
                  flsa_status: FlsaStatus.NONEXEMPT,
                  adjust_for_minimum_wage: true,
                  minimum_wages: [{ uuid: minWageUuid }],
                }),
              ],
            }),
          ]),
        ),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            compensationId: 'compensation-uuid',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      const { formMethods } = result.current.form.hookFormInternals

      // Sanity-check: the gate is open and the form picked up the loaded values.
      await waitFor(() => {
        if (result.current.isLoading) throw new Error('still loading')
        expect(result.current.form.Fields.AdjustForMinimumWage).toBeDefined()
        expect(result.current.form.Fields.MinimumWageId).toBeDefined()
      })
      expect(formMethods.getValues('adjustForMinimumWage')).toBe(true)
      expect(formMethods.getValues('minimumWageId')).toBe(minWageUuid)

      act(() => {
        formMethods.setValue('flsaStatus', FlsaStatus.EXEMPT)
      })

      await waitFor(() => {
        expect(formMethods.getValues('adjustForMinimumWage')).toBe(false)
        expect(formMethods.getValues('minimumWageId')).toBe('')
        if (result.current.isLoading) throw new Error('still loading')
        expect(result.current.form.Fields.AdjustForMinimumWage).toBeUndefined()
        expect(result.current.form.Fields.MinimumWageId).toBeUndefined()
      })
    })

    it('clears stale rate error when FLSA changes to Commission Only (rate becomes hook-forced and disabled)', async () => {
      // Repro: partner submits with Exempt + below-threshold rate → schema fires
      // RATE_EXEMPT_THRESHOLD on `rate`. Partner then changes FLSA to Commission
      // Only — the hook forces rate=0 and marks the field disabled, so the stale
      // "must meet salary threshold" message no longer applies and should clear.
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleExempt' })),
        ),
      )
      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            compensationId: 'compensation-uuid',
          }),
        { wrapper: GustoTestProvider },
      )
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      const { formMethods } = result.current.form.hookFormInternals

      act(() => {
        formMethods.setValue('rate', 50)
      })
      await act(async () => {
        await formMethods.trigger()
      })
      expect(formMethods.getFieldState('rate').error?.message).toBe(
        CompensationErrorCodes.RATE_EXEMPT_THRESHOLD,
      )

      act(() => {
        formMethods.setValue('flsaStatus', FlsaStatus.COMMISSION_ONLY_NONEXEMPT)
      })

      await waitFor(() => {
        expect(formMethods.getValues('rate')).toBe(0)
        expect(formMethods.getFieldState('rate').error).toBeUndefined()
      })
    })

    it('clears stale paymentUnit error when FLSA changes to a value that hook-forces paymentUnit', async () => {
      // Setup: get the form into a state where paymentUnit has a stale validation
      // error (PAYMENT_UNIT_OWNER) — set FLSA to Owner so the hook auto-forces
      // paymentUnit to Paycheck, then override paymentUnit to Hour before
      // triggering validation. Then flip FLSA to Commission Only, which forces
      // paymentUnit to Year and disables the field. The stale error must clear.
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleExempt' })),
        ),
      )
      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            compensationId: 'compensation-uuid',
          }),
        { wrapper: GustoTestProvider },
      )
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      const { formMethods } = result.current.form.hookFormInternals

      // Trip the Owner branch so paymentUnit's auto-force effect runs and settles,
      // then override paymentUnit manually so trigger() produces PAYMENT_UNIT_OWNER.
      act(() => {
        formMethods.setValue('flsaStatus', FlsaStatus.OWNER)
      })
      await waitFor(() => {
        expect(formMethods.getValues('paymentUnit')).toBe(PAY_PERIODS.PAYCHECK)
      })
      act(() => {
        formMethods.setValue('paymentUnit', PAY_PERIODS.HOUR)
      })
      await act(async () => {
        await formMethods.trigger()
      })
      expect(formMethods.getFieldState('paymentUnit').error?.message).toBe(
        CompensationErrorCodes.PAYMENT_UNIT_OWNER,
      )

      act(() => {
        formMethods.setValue('flsaStatus', FlsaStatus.COMMISSION_ONLY_NONEXEMPT)
      })

      await waitFor(() => {
        expect(formMethods.getValues('paymentUnit')).toBe(PAY_PERIODS.YEAR)
        expect(formMethods.getFieldState('paymentUnit').error).toBeUndefined()
      })
    })

    it('clears stale rate error when FLSA changes to another editable status that no longer triggers the error', async () => {
      // Repro of the bug Marie flagged on the original PR: switching FLSA between
      // two editable statuses (Exempt → Nonexempt) doesn't enter either of the
      // hook-forced branches, but the validation rules are FLSA-dependent — so a
      // RATE_EXEMPT_THRESHOLD error from when FLSA was Exempt should not linger
      // once FLSA is Nonexempt and rate=50 is perfectly valid.
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleExempt' })),
        ),
      )
      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            compensationId: 'compensation-uuid',
          }),
        { wrapper: GustoTestProvider },
      )
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      const { formMethods } = result.current.form.hookFormInternals

      act(() => {
        formMethods.setValue('rate', 50)
      })
      await act(async () => {
        await formMethods.trigger()
      })
      expect(formMethods.getFieldState('rate').error?.message).toBe(
        CompensationErrorCodes.RATE_EXEMPT_THRESHOLD,
      )

      act(() => {
        formMethods.setValue('flsaStatus', FlsaStatus.NONEXEMPT)
      })

      await waitFor(() => {
        // rate=50 is valid for Nonexempt (passes the `rate >= 1` minimum), so
        // the stale RATE_EXEMPT_THRESHOLD message must clear.
        expect(formMethods.getValues('rate')).toBe(50)
        expect(formMethods.getFieldState('rate').error).toBeUndefined()
      })
    })

    it('clears stale minimumWageId error when FLSA leaves Nonexempt (field is reset and hidden)', async () => {
      // The min-wage gate closes when FLSA leaves Nonexempt — the hook resets
      // adjustForMinimumWage/minimumWageId values and the fields stop rendering.
      // Any stale REQUIRED error on minimumWageId from a prior submit must be
      // cleared so it doesn't haunt the next submit attempt invisibly.
      const minWageUuid = '70c523ff-c71e-4474-9c83-a4ea51bd54a8'
      server.use(
        // Default fixture work address is in AK (in TIP_CREDITS_UNSUPPORTED_STATES);
        // override to TX so the min-wage gate can open.
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, () =>
          HttpResponse.json([
            {
              uuid: 'wa-uuid',
              employee_uuid: 'employee-uuid',
              location_uuid: 'tx-loc-uuid',
              effective_date: '2024-01-01',
              active: true,
              version: 'wa-v1',
              street_1: '100 Congress',
              street_2: '',
              city: 'Austin',
              state: 'TX',
              zip: '78701',
              country: 'USA',
            },
          ]),
        ),
        handleGetEmployeeJobs(() =>
          HttpResponse.json([
            buildJob({
              uuid: 'job-uuid',
              flsaStatus: FlsaStatus.NONEXEMPT,
              compensations: [
                buildCompensation({
                  uuid: 'compensation-uuid',
                  flsa_status: FlsaStatus.NONEXEMPT,
                  adjust_for_minimum_wage: true,
                  minimum_wages: [{ uuid: minWageUuid }],
                }),
              ],
            }),
          ]),
        ),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            compensationId: 'compensation-uuid',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      const { formMethods } = result.current.form.hookFormInternals

      await waitFor(() => {
        if (result.current.isLoading) throw new Error('still loading')
        expect(result.current.form.Fields.AdjustForMinimumWage).toBeDefined()
        expect(result.current.form.Fields.MinimumWageId).toBeDefined()
      })

      act(() => {
        formMethods.setValue('minimumWageId', '')
      })
      await act(async () => {
        await formMethods.trigger()
      })
      expect(formMethods.getFieldState('minimumWageId').error?.message).toBe(
        CompensationErrorCodes.REQUIRED,
      )

      act(() => {
        formMethods.setValue('flsaStatus', FlsaStatus.EXEMPT)
      })

      await waitFor(() => {
        expect(formMethods.getValues('minimumWageId')).toBe('')
        expect(formMethods.getFieldState('minimumWageId').error).toBeUndefined()
      })
    })
  })

  describe('FLSA field availability', () => {
    it('exposes Fields.FlsaStatus when adding the very first job (no primary exists)', async () => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'noJobs' })),
        ),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.form.Fields.FlsaStatus).toBeDefined()
    })

    it('exposes Fields.FlsaStatus when creating a future-dated compensation for the primary job', async () => {
      // Regression guard: isAddingSecondaryJob must not fire when jobId points
      // to the primary job, even though primaryFlsaStatus is Nonexempt.
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid', // primary job
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.form.Fields.FlsaStatus).toBeDefined()
    })

    it('hides Fields.FlsaStatus and seeds form value to primary FLSA when adding a secondary job', async () => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'new-secondary-job-uuid',
            // Even if a partner attempts to seed Exempt, the hook must override
            // it because secondaries must match the primary's FLSA.
            defaultValues: { flsaStatus: FlsaStatus.EXEMPT },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.form.Fields.FlsaStatus).toBeUndefined()
      expect(result.current.form.hookFormInternals.formMethods.getValues('flsaStatus')).toBe(
        FlsaStatus.NONEXEMPT,
      )
    })

    it('hides Fields.FlsaStatus when editing a Nonexempt secondary job (must keep matching the primary)', async () => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'multiJob' })),
        ),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid-2',
            compensationId: 'compensation-uuid-2',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.form.Fields.FlsaStatus).toBeUndefined()
    })

    it('keeps Fields.FlsaStatus visible when an onboarding stub primary (Nonexempt + rate 0) appears mid-mount', async () => {
      // Regression: during onboarding's chained submit (job POST → comp PUT)
      // `getJobs` invalidates and momentarily returns the API-generated stub
      // primary (Nonexempt + rate "0.00") between the two mutations. Without
      // the `hadPrimaryAtMount` snapshot, that transient primary flips
      // `isAddingSecondaryJob` to true and hides `Fields.FlsaStatus`
      // mid-submit — the user-visible "FLSA flicker."
      let callCount = 0
      server.use(
        handleGetEmployeeJobs(() => {
          callCount += 1
          if (callCount === 1) {
            return HttpResponse.json(buildEmployeeWithJobs({ scenario: 'noJobs' }))
          }
          return HttpResponse.json([
            buildJob({
              uuid: 'stub-primary-job-uuid',
              primary: true,
              flsaStatus: FlsaStatus.NONEXEMPT,
              rate: '0.00',
              currentCompensationUuid: 'stub-primary-comp-uuid',
              compensations: [
                buildCompensation({
                  uuid: 'stub-primary-comp-uuid',
                  job_uuid: 'stub-primary-job-uuid',
                  flsa_status: FlsaStatus.NONEXEMPT,
                  rate: '0.00',
                }),
              ],
            }),
          ])
        }),
      )

      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
          }),
        { wrapper: ({ children }) => GustoTestProvider({ children, queryClient }) },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.form.Fields.FlsaStatus).toBeDefined()

      await act(async () => {
        await invalidateAllJobsAndCompensationsGetJobs(queryClient)
      })

      await waitFor(() => {
        expect(callCount).toBeGreaterThanOrEqual(2)
      })

      expect(result.current.form.Fields.FlsaStatus).toBeDefined()
    })

    it('exposes Fields.FlsaStatus when editing the primary job', async () => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            compensationId: 'compensation-uuid',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.form.Fields.FlsaStatus).toBeDefined()
    })
  })

  describe('errorHandling', () => {
    it('surfaces query errors via errorHandling.errors', async () => {
      server.use(
        handleGetEmployeeJobs(() => HttpResponse.json({ message: 'boom' }, { status: 500 })),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            compensationId: 'compensation-uuid',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
      })
    })
  })

  describe('withEffectiveDateField', () => {
    it('hides Fields.EffectiveDate when withEffectiveDateField: false', async () => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            compensationId: 'compensation-uuid',
            withEffectiveDateField: false,
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.form.Fields.EffectiveDate).toBeUndefined()
    })

    it('uses CompensationSubmitOptions.effectiveDate over the form value on submit', async () => {
      let updateBody: Record<string, unknown> | null = null
      const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        updateBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          uuid: 'compensation-uuid',
          version: 'v2',
          job_uuid: 'job-uuid',
          rate: '20.00',
          payment_unit: 'Hour',
          flsa_status: 'Nonexempt',
          effective_date: updateBody.effectiveDate ?? '2024-12-24',
          adjust_for_minimum_wage: false,
        })
      })

      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
        handleUpdateEmployeeCompensation(updateResolver),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            compensationId: 'compensation-uuid',
            withEffectiveDateField: false,
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        assertReady(result.current)
        await result.current.actions.onSubmit({ effectiveDate: '2026-08-15' })
      })

      expect(updateResolver).toHaveBeenCalledTimes(1)
      expect(updateBody).toMatchObject({ effective_date: '2026-08-15' })
    })

    it('omits effective_date from the wire body even during the carve-out when no submit option is supplied', async () => {
      let updateBody: Record<string, unknown> | null = null
      const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        updateBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          uuid: 'compensation-uuid',
          version: 'v2',
          job_uuid: 'job-uuid',
          rate: '20.00',
          payment_unit: 'Hour',
          flsa_status: 'Exempt',
          effective_date: todayISO(),
          adjust_for_minimum_wage: false,
        })
      })

      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'multiJob' })),
        ),
        handleUpdateEmployeeCompensation(updateResolver),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            compensationId: 'compensation-uuid',
            withEffectiveDateField: false,
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)

      const { formMethods } = result.current.form.hookFormInternals
      act(() => {
        formMethods.setValue('flsaStatus', FlsaStatus.EXEMPT)
        formMethods.setValue('rate', 80000)
        formMethods.setValue('paymentUnit', PAY_PERIODS.YEAR)
      })

      await waitFor(() => {
        if (result.current.isLoading) throw new Error('still loading')
        expect(result.current.status.willDeleteSecondaryJobs).toBe(true)
      })

      await act(async () => {
        assertReady(result.current)
        await result.current.actions.onSubmit()
      })

      expect(updateResolver).toHaveBeenCalledTimes(1)
      expect(updateBody).not.toHaveProperty('effective_date')
    })
  })

  describe('internalMinEffectiveDate', () => {
    it('blocks onSubmit in create mode when effectiveDate is before tomorrow', async () => {
      const createResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json({}, { status: 201 }),
      )
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
        handleCreateCompensation(createResolver),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)

      const { formMethods } = result.current.form.hookFormInternals
      act(() => {
        formMethods.setValue('flsaStatus', 'Nonexempt')
        formMethods.setValue('paymentUnit', 'Hour')
        formMethods.setValue('rate', 25)
        formMethods.setValue('effectiveDate', todayISO())
      })

      await act(async () => {
        assertReady(result.current)
        await result.current.actions.onSubmit()
      })

      expect(createResolver).not.toHaveBeenCalled()
    })

    it('allows onSubmit in create mode when effectiveDate is tomorrow', async () => {
      let createBody: Record<string, unknown> | null = null
      const createResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        createBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          {
            uuid: 'new-comp-uuid',
            version: 'v1',
            job_uuid: 'job-uuid',
            payment_unit: 'Hour',
            flsa_status: 'Nonexempt',
            adjust_for_minimum_wage: false,
            effective_date: tomorrowISO(),
            rate: '25',
          },
          { status: 201 },
        )
      })
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
        handleCreateCompensation(createResolver),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)

      const { formMethods } = result.current.form.hookFormInternals
      act(() => {
        formMethods.setValue('flsaStatus', 'Nonexempt')
        formMethods.setValue('paymentUnit', 'Hour')
        formMethods.setValue('rate', 25)
        formMethods.setValue('effectiveDate', tomorrowISO())
      })

      await act(async () => {
        assertReady(result.current)
        await result.current.actions.onSubmit()
      })

      expect(createResolver).toHaveBeenCalledTimes(1)
      expect(createBody).toMatchObject({ effective_date: tomorrowISO() })
    })

    it('blocks onSubmit in update mode for a secondary job when effectiveDate is before the hire date', async () => {
      const updateResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json({
          uuid: 'secondary-comp-uuid',
          version: 'v2',
          job_uuid: 'secondary-job-uuid',
          rate: '25.00',
          payment_unit: 'Hour',
          flsa_status: 'Nonexempt',
          effective_date: '2099-06-01',
          adjust_for_minimum_wage: false,
        }),
      )
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json([
            buildJob({ uuid: 'job-uuid', primary: true }),
            buildJob({
              uuid: 'secondary-job-uuid',
              primary: false,
              hireDate: '2099-06-01',
              currentCompensationUuid: 'secondary-comp-uuid',
              compensations: [
                buildCompensation({
                  uuid: 'secondary-comp-uuid',
                  job_uuid: 'secondary-job-uuid',
                  effective_date: '2099-06-01',
                }),
              ],
            }),
          ]),
        ),
        handleUpdateEmployeeCompensation(updateResolver),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            compensationId: 'secondary-comp-uuid',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)

      const { formMethods } = result.current.form.hookFormInternals
      act(() => {
        // tomorrow is before the secondary job's hire date '2099-06-01'
        formMethods.setValue('effectiveDate', tomorrowISO())
      })

      await act(async () => {
        assertReady(result.current)
        await result.current.actions.onSubmit()
      })

      expect(updateResolver).not.toHaveBeenCalled()
    })

    it('does not enforce a minimum in update mode for a primary job (today is allowed)', async () => {
      const updateResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json({
          uuid: 'compensation-uuid',
          version: 'v2',
          job_uuid: 'job-uuid',
          rate: '100.00',
          payment_unit: 'Hour',
          flsa_status: 'Nonexempt',
          effective_date: todayISO(),
          adjust_for_minimum_wage: false,
        }),
      )
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
        handleUpdateEmployeeCompensation(updateResolver),
      )

      const { result } = renderHook(
        () =>
          useCompensationForm({
            employeeId: 'employee-uuid',
            compensationId: 'compensation-uuid',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)

      const { formMethods } = result.current.form.hookFormInternals
      act(() => {
        formMethods.setValue('effectiveDate', todayISO())
      })

      await act(async () => {
        assertReady(result.current)
        await result.current.actions.onSubmit()
      })

      expect(updateResolver).toHaveBeenCalledTimes(1)
    })
  })
})
