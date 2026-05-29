import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, assertType, vi } from 'vitest'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { useJobForm } from './useJobForm'
import type { UseJobFormResult } from './useJobForm'
import { createJobSchema, JobErrorCodes, type JobOptionalFieldsToRequire } from './jobSchema'
import { server } from '@/test/mocks/server'
import {
  handleGetEmployeeJobs,
  handleCreateEmployeeJob,
  handleUpdateEmployeeJob,
  handleUpdateEmployeeCompensation,
} from '@/test/mocks/apis/employees'
import { handleGetCompanyFederalTaxes } from '@/test/mocks/apis/company_federal_taxes'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import {
  buildEmployeeWithJobs,
  buildJob,
  buildCompensation,
  type CompensationFixture,
} from '@/test/factories/jobsAndCompensations'
import { fieldsMetadataEntry } from '@/test/fieldsMetadata'
import { API_BASE_URL } from '@/test/constants'

assertType<JobOptionalFieldsToRequire>({ update: ['title', 'hireDate'] })
assertType<JobOptionalFieldsToRequire>({})

type ReadyResult = Extract<UseJobFormResult, { isLoading: false }>

function assertReady(hookResult: UseJobFormResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

const VALID_FORM_DATA = {
  title: 'Engineer',
  hireDate: '2024-12-24',
  twoPercentShareholder: false,
  stateWcCovered: false,
  stateWcClassCode: '',
}

describe('createJobSchema', () => {
  it('requires title and hireDate on create', () => {
    const [schema] = createJobSchema({ mode: 'create' })
    const result = schema.safeParse({ ...VALID_FORM_DATA, title: '', hireDate: null })
    expect(result.success).toBe(false)
    if (result.success) return
    const fields = new Set(result.error.issues.map(issue => String(issue.path[0])))
    expect(fields).toContain('title')
    expect(fields).toContain('hireDate')
    expect(result.error.issues.find(issue => String(issue.path[0]) === 'title')?.message).toBe(
      JobErrorCodes.REQUIRED,
    )
  })

  it('keeps title and hireDate optional on update', () => {
    const [schema] = createJobSchema({ mode: 'update' })
    const result = schema.safeParse({ ...VALID_FORM_DATA, title: '', hireDate: null })
    expect(result.success).toBe(true)
  })

  it('requires stateWcClassCode only when stateWcCovered is true', () => {
    const [schema] = createJobSchema({ mode: 'create' })
    const ok = schema.safeParse({ ...VALID_FORM_DATA, stateWcCovered: false, stateWcClassCode: '' })
    expect(ok.success).toBe(true)

    const bad = schema.safeParse({
      ...VALID_FORM_DATA,
      stateWcCovered: true,
      stateWcClassCode: '',
    })
    expect(bad.success).toBe(false)
    if (bad.success) return
    const fields = bad.error.issues.map(issue => String(issue.path[0]))
    expect(fields).toContain('stateWcClassCode')
  })

  it('partner override (optionalFieldsToRequire) makes title required on update', () => {
    const [schema] = createJobSchema({
      mode: 'update',
      optionalFieldsToRequire: { update: ['title'] },
    })
    const result = schema.safeParse({ ...VALID_FORM_DATA, title: '' })
    expect(result.success).toBe(false)
  })

  it('drops hireDate from validation when withHireDateField is false', () => {
    const [schema] = createJobSchema({ mode: 'create', withHireDateField: false })
    const { hireDate: _omit, ...rest } = VALID_FORM_DATA
    const result = schema.safeParse(rest)
    expect(result.success).toBe(true)
  })

  it('metadata reflects API requirements: title/hireDate required on create', () => {
    const [, { getFieldsMetadata }] = createJobSchema({ mode: 'create' })
    const metadata = getFieldsMetadata()
    expect(metadata.title.isRequired).toBe(true)
    expect(metadata.hireDate.isRequired).toBe(true)
    expect(metadata.twoPercentShareholder.isRequired).toBe(false)
  })

  it('metadata: stateWcClassCode required only when stateWcCovered is true', () => {
    const [, { getFieldsMetadata }] = createJobSchema({ mode: 'create' })
    expect(getFieldsMetadata({ stateWcCovered: true }).stateWcClassCode.isRequired).toBe(true)
    expect(getFieldsMetadata({ stateWcCovered: false }).stateWcClassCode.isRequired).toBe(false)
  })
})

describe('useJobForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  describe('verb routing', () => {
    it('create mode (no jobId) → POST /v1/employees/:id/jobs with hireDate', async () => {
      let createJobBody: Record<string, unknown> | null = null
      const createJobResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        createJobBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          {
            uuid: 'new-job-uuid',
            version: 'v1',
            employee_uuid: 'employee-uuid',
            current_compensation_uuid: 'comp-uuid',
            payment_unit: 'Hour',
            primary: true,
            title: createJobBody.title,
            hire_date: createJobBody.hire_date,
            two_percent_shareholder: false,
            state_wc_covered: false,
            state_wc_class_code: null,
            compensations: [],
            rate: '0.00',
          },
          { status: 201 },
        )
      })
      const updateJobResolver = vi.fn(() => HttpResponse.json({}))

      server.use(
        handleGetEmployeeJobs(() => HttpResponse.json([])),
        handleCreateEmployeeJob(createJobResolver),
        handleUpdateEmployeeJob(updateJobResolver),
      )

      const { result } = renderHook(
        () =>
          useJobForm({
            employeeId: 'employee-uuid',
            defaultValues: { title: 'Engineer', hireDate: '2025-01-15' },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      assertReady(result.current)
      expect(result.current.status.mode).toBe('create')

      let submitResult
      await act(async () => {
        assertReady(result.current)
        submitResult = await result.current.actions.onSubmit()
      })

      expect(createJobResolver).toHaveBeenCalledTimes(1)
      expect(createJobBody).toMatchObject({
        title: 'Engineer',
        hire_date: '2025-01-15',
      })
      expect(submitResult).toMatchObject({ mode: 'create' })
      expect(updateJobResolver).not.toHaveBeenCalled()
    })

    it('update mode (with jobId) → PUT /v1/jobs/:id with version', async () => {
      let updateJobBody: Record<string, unknown> | null = null
      let updateJobPath: string | null = null
      const updateJobResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        updateJobPath = new URL(request.url).pathname
        updateJobBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          uuid: 'job-uuid',
          version: 'v2',
          employee_uuid: 'employee-uuid',
          current_compensation_uuid: 'compensation-uuid',
          payment_unit: 'Hour',
          primary: true,
          title: updateJobBody.title ?? 'My Job',
          hire_date: updateJobBody.hire_date ?? '2024-12-24',
          two_percent_shareholder: false,
          state_wc_covered: false,
          state_wc_class_code: null,
          compensations: [],
          rate: '100.00',
        })
      })
      const createJobResolver = vi.fn(() => HttpResponse.json({}, { status: 201 }))

      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
        handleUpdateEmployeeJob(updateJobResolver),
        handleCreateEmployeeJob(createJobResolver),
      )

      const { result } = renderHook(
        () =>
          useJobForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      assertReady(result.current)
      expect(result.current.status.mode).toBe('update')

      await act(async () => {
        assertReady(result.current)
        await result.current.actions.onSubmit()
      })

      expect(updateJobResolver).toHaveBeenCalledTimes(1)
      expect(updateJobPath).toBe('/v1/jobs/job-uuid')
      expect(updateJobBody).toMatchObject({
        title: 'My Job',
        version: 'job-version-123',
      })
      expect(createJobResolver).not.toHaveBeenCalled()
    })

    it('options.employeeId overrides hook-level employeeId on create submit', async () => {
      let createJobPath: string | null = null
      const createJobResolver = vi.fn(({ request }) => {
        createJobPath = new URL(request.url).pathname
        return HttpResponse.json(
          {
            uuid: 'new-job-uuid',
            version: 'v1',
            employee_uuid: 'newly-created-employee',
            current_compensation_uuid: 'comp-uuid',
            payment_unit: 'Hour',
            primary: true,
            title: 'Engineer',
            hire_date: '2025-01-15',
            two_percent_shareholder: false,
            state_wc_covered: false,
            state_wc_class_code: null,
            compensations: [],
            rate: '0.00',
          },
          { status: 201 },
        )
      })

      server.use(
        handleGetEmployeeJobs(() => HttpResponse.json([])),
        handleCreateEmployeeJob(createJobResolver),
      )

      const { result } = renderHook(
        () =>
          useJobForm({
            employeeId: 'employee-uuid',
            defaultValues: { title: 'Engineer', hireDate: '2025-01-15' },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        assertReady(result.current)
        await result.current.actions.onSubmit({
          employeeId: 'newly-created-employee',
        })
      })

      expect(createJobResolver).toHaveBeenCalledTimes(1)
      expect(createJobPath).toBe('/v1/employees/newly-created-employee/jobs')
    })
  })

  describe('gating signals', () => {
    it('exposes showStateWc=true when active work address is in WA, renders StateWcCovered, and gates StateWcClassCode on stateWcCovered=true', async () => {
      server.use(
        handleGetEmployeeJobs(() => HttpResponse.json([])),
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, () =>
          HttpResponse.json([
            {
              uuid: 'wa-uuid',
              employee_uuid: 'employee-uuid',
              location_uuid: 'wa-loc-uuid',
              effective_date: '2024-01-01',
              active: true,
              version: 'wa-v1',
              street_1: '123 Pike',
              street_2: '',
              city: 'Seattle',
              state: 'WA',
              zip: '98101',
              country: 'USA',
            },
          ]),
        ),
      )

      const { result } = renderHook(() => useJobForm({ employeeId: 'employee-uuid' }), {
        wrapper: GustoTestProvider,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      assertReady(result.current)
      expect(result.current.data.showStateWc).toBe(true)
      expect(result.current.form.Fields.StateWcCovered).toBeDefined()
      expect(result.current.form.Fields.StateWcClassCode).toBeUndefined()
    })

    it('renders StateWcClassCode once stateWcCovered flips to true (via defaultValues)', async () => {
      server.use(
        handleGetEmployeeJobs(() => HttpResponse.json([])),
        http.get(`${API_BASE_URL}/v1/employees/:employee_id/work_addresses`, () =>
          HttpResponse.json([
            {
              uuid: 'wa-uuid',
              employee_uuid: 'employee-uuid',
              location_uuid: 'wa-loc-uuid',
              effective_date: '2024-01-01',
              active: true,
              version: 'wa-v1',
              street_1: '123 Pike',
              street_2: '',
              city: 'Seattle',
              state: 'WA',
              zip: '98101',
              country: 'USA',
            },
          ]),
        ),
      )

      const { result } = renderHook(
        () =>
          useJobForm({
            employeeId: 'employee-uuid',
            defaultValues: { stateWcCovered: true },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      assertReady(result.current)
      expect(result.current.form.Fields.StateWcCovered).toBeDefined()
      expect(result.current.form.Fields.StateWcClassCode).toBeDefined()
    })

    it('exposes showStateWc=false (and hides fields) for non-WA work address', async () => {
      server.use(handleGetEmployeeJobs(() => HttpResponse.json([])))
      const { result } = renderHook(() => useJobForm({ employeeId: 'employee-uuid' }), {
        wrapper: GustoTestProvider,
      })
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.data.showStateWc).toBe(false)
      expect(result.current.form.Fields.StateWcCovered).toBeUndefined()
      expect(result.current.form.Fields.StateWcClassCode).toBeUndefined()
    })

    it('exposes showTwoPercentShareholder=true when company is taxable as S-Corp', async () => {
      server.use(
        handleGetEmployeeJobs(() => HttpResponse.json([])),
        handleGetCompanyFederalTaxes(() =>
          HttpResponse.json({
            version: '36d35e28689e641e9e153f0324c2625a',
            tax_payer_type: 'S-Corporation',
            taxable_as_scorp: true,
            filing_form: '944',
            has_ein: true,
            ein_verified: true,
            legal_name: 'My Corp',
          }),
        ),
      )

      const { result } = renderHook(() => useJobForm({ employeeId: 'employee-uuid' }), {
        wrapper: GustoTestProvider,
      })

      await waitFor(
        () => {
          if (result.current.isLoading) throw new Error('still loading')
          expect(result.current.data.showTwoPercentShareholder).toBe(true)
        },
        { timeout: 3000 },
      )

      assertReady(result.current)
      expect(result.current.form.Fields.TwoPercentShareholder).toBeDefined()
    })

    it('exposes showTwoPercentShareholder=false (and hides field) when not S-Corp', async () => {
      server.use(handleGetEmployeeJobs(() => HttpResponse.json([])))
      const { result } = renderHook(() => useJobForm({ employeeId: 'employee-uuid' }), {
        wrapper: GustoTestProvider,
      })
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(result.current.data.showTwoPercentShareholder).toBe(false)
      expect(result.current.form.Fields.TwoPercentShareholder).toBeUndefined()
    })
  })

  describe('errorHandling', () => {
    it('surfaces query errors via errorHandling.errors', async () => {
      server.use(
        handleGetEmployeeJobs(() => HttpResponse.json({ message: 'boom' }, { status: 500 })),
      )

      const { result } = renderHook(() => useJobForm({ employeeId: 'employee-uuid' }), {
        wrapper: GustoTestProvider,
      })

      await waitFor(() => {
        expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
      })
    })
  })

  describe('optionalFieldsToRequire', () => {
    it('treats partner-required title-on-update as required in metadata', async () => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
      )

      const { result } = renderHook(
        () =>
          useJobForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            optionalFieldsToRequire: { update: ['title'] },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      expect(fieldsMetadataEntry(result.current.form.fieldsMetadata, 'title').isRequired).toBe(true)
    })
  })

  describe('withHireDateField', () => {
    it('hides Fields.HireDate when withHireDateField: false', async () => {
      server.use(handleGetEmployeeJobs(() => HttpResponse.json([])))

      const { result } = renderHook(
        () =>
          useJobForm({
            employeeId: 'employee-uuid',
            withHireDateField: false,
            defaultValues: { title: 'Engineer' },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      assertReady(result.current)
      expect(result.current.form.Fields.HireDate).toBeUndefined()
      expect(result.current.form.Fields.Title).toBeDefined()
    })

    it('create mode: sends hireDate from JobSubmitOptions when field is hidden', async () => {
      let createJobBody: Record<string, unknown> | null = null
      const createJobResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        createJobBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(
          {
            uuid: 'new-job-uuid',
            version: 'v1',
            employee_uuid: 'employee-uuid',
            current_compensation_uuid: 'comp-uuid',
            payment_unit: 'Hour',
            primary: true,
            title: createJobBody.title,
            hire_date: createJobBody.hire_date,
            two_percent_shareholder: false,
            state_wc_covered: false,
            state_wc_class_code: null,
            compensations: [],
            rate: '0.00',
          },
          { status: 201 },
        )
      })

      server.use(
        handleGetEmployeeJobs(() => HttpResponse.json([])),
        handleCreateEmployeeJob(createJobResolver),
      )

      const { result } = renderHook(
        () =>
          useJobForm({
            employeeId: 'employee-uuid',
            withHireDateField: false,
            defaultValues: { title: 'Engineer' },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        assertReady(result.current)
        await result.current.actions.onSubmit({ hireDate: '2025-03-01' })
      })

      expect(createJobResolver).toHaveBeenCalledTimes(1)
      expect(createJobBody).toMatchObject({
        title: 'Engineer',
        hire_date: '2025-03-01',
      })
    })

    it('create mode: throws when hidden and no JobSubmitOptions.hireDate supplied', async () => {
      const createJobResolver = vi.fn(() => HttpResponse.json({}, { status: 201 }))

      server.use(
        handleGetEmployeeJobs(() => HttpResponse.json([])),
        handleCreateEmployeeJob(createJobResolver),
      )

      const { result } = renderHook(
        () =>
          useJobForm({
            employeeId: 'employee-uuid',
            withHireDateField: false,
            defaultValues: { title: 'Engineer' },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let submitResult
      await act(async () => {
        assertReady(result.current)
        submitResult = await result.current.actions.onSubmit()
      })

      expect(submitResult).toBeUndefined()
      expect(createJobResolver).not.toHaveBeenCalled()
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })

    it('update mode: keeps existing hireDate when hidden and no override supplied', async () => {
      let updateJobBody: Record<string, unknown> | null = null
      const updateJobResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        updateJobBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          uuid: 'job-uuid',
          version: 'v2',
          employee_uuid: 'employee-uuid',
          current_compensation_uuid: 'compensation-uuid',
          payment_unit: 'Hour',
          primary: true,
          title: updateJobBody.title ?? 'My Job',
          hire_date: '2024-12-24',
          two_percent_shareholder: false,
          state_wc_covered: false,
          state_wc_class_code: null,
          compensations: [],
          rate: '100.00',
        })
      })

      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
        handleUpdateEmployeeJob(updateJobResolver),
      )

      const { result } = renderHook(
        () =>
          useJobForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            withHireDateField: false,
            optionalFieldsToRequire: { update: ['title'] },
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        assertReady(result.current)
        await result.current.actions.onSubmit()
      })

      expect(updateJobResolver).toHaveBeenCalledTimes(1)
      // currentJob.hireDate is the fallback when the field is hidden and no
      // submit-options override is supplied; the API keeps the stored value.
      expect(updateJobBody).toMatchObject({ hire_date: '2024-12-24' })
    })
  })

  describe('withTitleField', () => {
    it('hides Fields.Title when withTitleField: false', async () => {
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
      )

      const { result } = renderHook(
        () =>
          useJobForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            withTitleField: false,
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      assertReady(result.current)
      expect(result.current.form.Fields.Title).toBeUndefined()
      expect(result.current.form.Fields.HireDate).toBeDefined()
    })

    it('update mode: omits title from the PUT body when field is hidden', async () => {
      let updateJobBody: Record<string, unknown> | null = null
      const updateJobResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        updateJobBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          uuid: 'job-uuid',
          version: 'v2',
          employee_uuid: 'employee-uuid',
          current_compensation_uuid: 'compensation-uuid',
          payment_unit: 'Hour',
          primary: true,
          title: 'Senior Engineer',
          hire_date: '2024-12-24',
          two_percent_shareholder: true,
          state_wc_covered: false,
          state_wc_class_code: null,
          compensations: [],
          rate: '0.00',
        })
      })

      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'singleNonexempt' })),
        ),
        handleUpdateEmployeeJob(updateJobResolver),
      )

      const { result } = renderHook(
        () =>
          useJobForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            withTitleField: false,
            withHireDateField: false,
          }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        assertReady(result.current)
        await result.current.actions.onSubmit()
      })

      expect(updateJobResolver).toHaveBeenCalledTimes(1)
      expect(updateJobBody).not.toHaveProperty('title')
    })

    it('drops title from validation when withTitleField is false', () => {
      const [schema] = createJobSchema({ mode: 'create', withTitleField: false })
      const { title: _omit, ...rest } = VALID_FORM_DATA
      const result = schema.safeParse(rest)
      expect(result.success).toBe(true)
    })
  })

  describe('primary-job hire_date PUT → secondary compensation correction', () => {
    // After the primary's hire_date PUT, the server clobbers every secondary
    // current-compensation effective_date to the new hire_date and bumps each
    // compensation version. We model that by reusing the pre-PUT scenario and
    // tagging versions with a `-next` suffix and pushing effective_date to the
    // new hire_date — the hook's refetch reads `version` and the test asserts
    // the request bodies the corrective block sent back.
    function buildAfterPrimaryPutJobs(newHireDate: string) {
      return buildEmployeeWithJobs({ scenario: 'newPrimaryJobWithSecondaries' }).map(job => ({
        ...job,
        version: `${job.version}-next`,
        hire_date: newHireDate,
        compensations: job.compensations.map(c => ({
          ...c,
          version: `${c.version}-next`,
          effective_date: newHireDate,
        })),
      }))
    }

    // Two-phase GET: first call returns the pre-PUT scenario, subsequent calls
    // (the hook's post-PUT refetch) return the after-PUT shape with bumped
    // secondary versions.
    function getJobsResolver(afterHireDate: string) {
      let calls = 0
      return vi.fn<HttpResponseResolver>(() => {
        calls += 1
        return HttpResponse.json(
          calls === 1
            ? buildEmployeeWithJobs({ scenario: 'newPrimaryJobWithSecondaries' })
            : buildAfterPrimaryPutJobs(afterHireDate),
        )
      })
    }

    // Captures every PUT /v1/compensations/:id call so the tests can pick the
    // body that hit a specific secondary's URL.
    function compPutResolver() {
      const calls: { compensationId: string; body: Record<string, unknown> }[] = []
      const resolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        const compensationId = new URL(request.url).pathname.split('/').pop() ?? ''
        const body = (await request.json()) as Record<string, unknown>
        calls.push({ compensationId, body })
        return HttpResponse.json(
          buildCompensation({ uuid: compensationId, ...(body as Partial<CompensationFixture>) }),
        )
      })
      return { resolver, calls }
    }

    function jobPutResponse(newHireDate: string) {
      return HttpResponse.json(
        buildJob({ uuid: 'job-uuid', version: 'job-version-next', hireDate: newHireDate }),
      )
    }

    async function renderAndSubmit(newHireDate: string | null) {
      const { result } = renderHook(
        () =>
          useJobForm({
            employeeId: 'employee-uuid',
            jobId: 'job-uuid',
            withHireDateField: newHireDate !== null,
          }),
        { wrapper: GustoTestProvider },
      )
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      if (newHireDate !== null) {
        act(() => {
          assertReady(result.current)
          result.current.form.hookFormInternals.formMethods.setValue('hireDate', newHireDate)
        })
      }
      let submitResult: unknown
      await act(async () => {
        assertReady(result.current)
        submitResult = await result.current.actions.onSubmit()
      })
      return { result, submitResult }
    }

    it('does not PUT any secondary compensation when the hire date is unchanged', async () => {
      const { resolver: updateCompResolver, calls: compCalls } = compPutResolver()
      server.use(
        handleGetEmployeeJobs(getJobsResolver('2099-07-01')),
        handleUpdateEmployeeJob(() => jobPutResponse('2099-07-01')),
        handleUpdateEmployeeCompensation(updateCompResolver),
      )

      await renderAndSubmit(null)

      expect(compCalls).toHaveLength(0)
    })

    it('does not PUT any secondary compensation when there are no secondaries', async () => {
      const { resolver: updateCompResolver, calls: compCalls } = compPutResolver()
      server.use(
        handleGetEmployeeJobs(() =>
          HttpResponse.json(buildEmployeeWithJobs({ scenario: 'newPrimaryJob' })),
        ),
        handleUpdateEmployeeJob(() => jobPutResponse('2099-08-01')),
        handleUpdateEmployeeCompensation(updateCompResolver),
      )

      await renderAndSubmit('2099-08-01')

      expect(compCalls).toHaveLength(0)
    })

    it("keeps a secondary's effective_date when it is still after the new hire date", async () => {
      const { resolver: updateCompResolver, calls: compCalls } = compPutResolver()
      server.use(
        handleGetEmployeeJobs(getJobsResolver('2099-08-01')),
        handleUpdateEmployeeJob(() => jobPutResponse('2099-08-01')),
        handleUpdateEmployeeCompensation(updateCompResolver),
      )

      await renderAndSubmit('2099-08-01')

      const aCall = compCalls.find(c => c.compensationId === 'compensation-uuid-secondary-a')
      const bCall = compCalls.find(c => c.compensationId === 'compensation-uuid-secondary-b')

      // A's original effective_date (2099-08-16) is still after the new hire
      // date (2099-08-01), so it stays put. B's original (2099-07-01) is
      // before the new hire date, so it advances.
      expect(aCall?.body).toMatchObject({
        effective_date: '2099-08-16',
        version: 'compensation-version-secondary-a-next',
      })
      expect(bCall?.body).toMatchObject({
        effective_date: '2099-08-01',
        version: 'compensation-version-secondary-b-next',
      })
    })

    it('advances every secondary effective_date when the new hire date passes them all', async () => {
      const { resolver: updateCompResolver, calls: compCalls } = compPutResolver()
      server.use(
        handleGetEmployeeJobs(getJobsResolver('2099-09-01')),
        handleUpdateEmployeeJob(() => jobPutResponse('2099-09-01')),
        handleUpdateEmployeeCompensation(updateCompResolver),
      )

      await renderAndSubmit('2099-09-01')

      const aCall = compCalls.find(c => c.compensationId === 'compensation-uuid-secondary-a')
      const bCall = compCalls.find(c => c.compensationId === 'compensation-uuid-secondary-b')

      expect(aCall?.body).toMatchObject({ effective_date: '2099-09-01' })
      expect(bCall?.body).toMatchObject({ effective_date: '2099-09-01' })
    })

    it('surfaces a secondary PUT failure through errorHandling and skips submitResult', async () => {
      const updateCompResolver = vi.fn<HttpResponseResolver>(({ request }) => {
        const compensationId = new URL(request.url).pathname.split('/').pop() ?? ''
        if (compensationId === 'compensation-uuid-secondary-a') {
          return new HttpResponse(null, { status: 500 })
        }
        return HttpResponse.json(buildCompensation({ uuid: compensationId }))
      })
      server.use(
        handleGetEmployeeJobs(getJobsResolver('2099-09-01')),
        handleUpdateEmployeeJob(() => jobPutResponse('2099-09-01')),
        handleUpdateEmployeeCompensation(updateCompResolver),
      )

      const { result, submitResult } = await renderAndSubmit('2099-09-01')

      expect(submitResult).toBeUndefined()
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })
  })
})
