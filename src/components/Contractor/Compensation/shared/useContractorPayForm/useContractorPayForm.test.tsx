import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { useContractorPayForm } from './useContractorPayForm'
import type { UseContractorPayFormResult } from './useContractorPayForm'
import { createContractorPaySchema, ContractorPayErrorCodes, WageType } from './contractorPaySchema'
import { server } from '@/test/mocks/server'
import { handleGetContractor, handleUpdateContractor } from '@/test/mocks/apis/contractors'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { fieldsMetadataEntry } from '@/test/fieldsMetadata'

type ReadyResult = Extract<UseContractorPayFormResult, { isLoading: false }>

function assertReady(hookResult: UseContractorPayFormResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

describe('createContractorPaySchema', () => {
  it('requires hourlyRate only when wageType is Hourly', () => {
    const [schema] = createContractorPaySchema()
    expect(schema.safeParse({ wageType: WageType.Fixed, hourlyRate: 0 }).success).toBe(true)

    const result = schema.safeParse({ wageType: WageType.Hourly, hourlyRate: 0 })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues[0]?.message).toBe(ContractorPayErrorCodes.REQUIRED)
  })

  it('accepts a positive hourlyRate when Hourly', () => {
    const [schema] = createContractorPaySchema()
    expect(schema.safeParse({ wageType: WageType.Hourly, hourlyRate: 25.5 }).success).toBe(true)
  })

  it('rejects an hourlyRate above the server cap with MAX_HOURLY_RATE', () => {
    const [schema] = createContractorPaySchema()
    const result = schema.safeParse({ wageType: WageType.Hourly, hourlyRate: 1_000_000_000_001 })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues).toEqual([
      expect.objectContaining({
        path: ['hourlyRate'],
        message: ContractorPayErrorCodes.MAX_HOURLY_RATE,
      }),
    ])
  })

  it('accepts an hourlyRate exactly at the server cap', () => {
    const [schema] = createContractorPaySchema()
    expect(
      schema.safeParse({ wageType: WageType.Hourly, hourlyRate: 1_000_000_000_000 }).success,
    ).toBe(true)
  })

  it('rejects a negative hourlyRate when Hourly', () => {
    const [schema] = createContractorPaySchema()
    const result = schema.safeParse({ wageType: WageType.Hourly, hourlyRate: -5 })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues[0]?.path).toEqual(['hourlyRate'])
  })

  it('rejects a negative hourlyRate even when Fixed (no applicability exclusion)', () => {
    const [schema] = createContractorPaySchema()
    const result = schema.safeParse({ wageType: WageType.Fixed, hourlyRate: -5 })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues[0]?.path).toEqual(['hourlyRate'])
  })

  it('treats a NaN hourlyRate as missing (REQUIRED) even when Fixed', () => {
    const [schema] = createContractorPaySchema()
    const result = schema.safeParse({ wageType: WageType.Fixed, hourlyRate: NaN })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues).toEqual([
      expect.objectContaining({ path: ['hourlyRate'], message: ContractorPayErrorCodes.REQUIRED }),
    ])
  })

  it('treats a NaN hourlyRate as missing (REQUIRED) when Hourly', () => {
    const [schema] = createContractorPaySchema()
    const result = schema.safeParse({ wageType: WageType.Hourly, hourlyRate: NaN })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(new Set(result.error.issues.map(issue => issue.message))).toEqual(
      new Set([ContractorPayErrorCodes.REQUIRED]),
    )
    expect(new Set(result.error.issues.map(issue => issue.path.join('.')))).toEqual(
      new Set(['hourlyRate']),
    )
  })

  it('rejects an unknown wageType', () => {
    const [schema] = createContractorPaySchema()
    const result = schema.safeParse({ wageType: 'Salary', hourlyRate: 0 })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues[0]?.path).toEqual(['wageType'])
  })
})

describe('useContractorPayForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('seeds the form from the loaded contractor and exposes isHourly', async () => {
    server.use(
      handleGetContractor(() =>
        HttpResponse.json({
          uuid: 'contractor-123',
          type: 'Individual',
          is_active: true,
          version: 'v1',
          wage_type: 'Hourly',
          hourly_rate: '45.00',
          file_new_hire_report: false,
        }),
      ),
    )

    const { result } = renderHook(() => useContractorPayForm({ contractorId: 'contractor-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // isHourly is useWatch-derived, so it reflects the values-driven reset to
    // the loaded wageType one render after isLoading flips. Wait on that single
    // signal, then read the rest of the settled state synchronously.
    await waitFor(() => {
      assertReady(result.current)
      expect(result.current.status.isHourly).toBe(true)
    })

    assertReady(result.current)
    expect(result.current.form.getFormSubmissionValues()).toMatchObject({
      wageType: 'Hourly',
      hourlyRate: 45,
    })
  })

  it('always includes the contractor type on submit, even though the form has no type field', async () => {
    server.use(
      handleGetContractor(() =>
        HttpResponse.json({
          uuid: 'contractor-123',
          type: 'Business',
          business_name: 'Acme LLC',
          is_active: true,
          version: 'v1',
          wage_type: 'Fixed',
          file_new_hire_report: false,
        }),
      ),
    )

    let requestBody: Record<string, unknown> | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      requestBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({
        uuid: 'contractor-123',
        type: 'Business',
        business_name: 'Acme LLC',
        is_active: true,
        version: 'v2',
        wage_type: 'Fixed',
        file_new_hire_report: false,
      })
    })
    server.use(handleUpdateContractor(updateResolver))

    const { result } = renderHook(() => useContractorPayForm({ contractorId: 'contractor-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    const ready = result.current

    let submitResult: unknown
    await act(async () => {
      submitResult = await ready.actions.onSubmit()
    })

    expect(updateResolver).toHaveBeenCalledTimes(1)
    expect(requestBody).toMatchObject({ type: 'Business', wage_type: 'Fixed' })
    expect(submitResult).toEqual(expect.objectContaining({ mode: 'update' }))
  })

  it('blocks submission when hourlyRate is missing while Hourly is selected', async () => {
    server.use(
      handleGetContractor(() =>
        HttpResponse.json({
          uuid: 'contractor-123',
          type: 'Individual',
          is_active: true,
          version: 'v1',
          wage_type: 'Hourly',
          hourly_rate: '0',
          file_new_hire_report: false,
        }),
      ),
    )
    const updateResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({ uuid: 'contractor-123', version: 'v2' }),
    )
    server.use(handleUpdateContractor(updateResolver))

    const { result } = renderHook(() => useContractorPayForm({ contractorId: 'contractor-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    const ready = result.current

    let submitResult: unknown
    await act(async () => {
      submitResult = await ready.actions.onSubmit()
    })

    expect(submitResult).toBeUndefined()
    expect(updateResolver).not.toHaveBeenCalled()
  })

  describe('SDK-1157 regression net', () => {
    const fixedContractor = {
      uuid: 'contractor-123',
      type: 'Individual',
      is_active: true,
      version: 'v1',
      wage_type: 'Fixed',
      file_new_hire_report: false,
    }

    const hourlyContractor = {
      ...fixedContractor,
      wage_type: 'Hourly',
      hourly_rate: '45.00',
    }

    const renderPayForm = () =>
      renderHook(() => useContractorPayForm({ contractorId: 'contractor-123' }), {
        wrapper: GustoTestProvider,
      })

    const waitForReady = async (result: { current: UseContractorPayFormResult }) => {
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      return result.current
    }

    it('starts in the loading state before the contractor resolves', () => {
      server.use(handleGetContractor(() => HttpResponse.json(fixedContractor)))

      const { result } = renderPayForm()

      expect(result.current).toMatchObject({ isLoading: true })
    })

    it('surfaces a failed contractor fetch on errorHandling while loading', async () => {
      server.use(
        handleGetContractor(() =>
          HttpResponse.json(
            { errors: [{ category: 'server_error', message: 'Boom' }] },
            { status: 500 },
          ),
        ),
      )

      const { result } = renderPayForm()

      await waitFor(() => {
        expect(result.current.errorHandling.errors).toHaveLength(1)
      })
      expect(result.current.isLoading).toBe(true)
      expect(result.current.errorHandling.errors[0]).toMatchObject({ httpStatus: 500 })
      expect(typeof result.current.errorHandling.retryQueries).toBe('function')
    })

    it('defaults hourlyRate to 0 (not NaN) when the contractor has no rate', async () => {
      server.use(handleGetContractor(() => HttpResponse.json(fixedContractor)))

      const { result } = renderPayForm()
      const ready = await waitForReady(result)

      expect(ready.status).toMatchObject({ mode: 'update', isHourly: false, isPending: false })
      expect(ready.form.hookFormInternals.formMethods.getValues()).toEqual({
        wageType: WageType.Fixed,
        hourlyRate: 0,
      })
    })

    it('exposes wageType options ordered Fixed, Hourly', async () => {
      server.use(handleGetContractor(() => HttpResponse.json(fixedContractor)))

      const { result } = renderPayForm()
      const ready = await waitForReady(result)

      expect(fieldsMetadataEntry(ready.form.fieldsMetadata, 'wageType')).toMatchObject({
        options: [
          { value: WageType.Fixed, label: WageType.Fixed },
          { value: WageType.Hourly, label: WageType.Hourly },
        ],
      })
      expect(fieldsMetadataEntry(ready.form.fieldsMetadata, 'hourlyRate')).toMatchObject({
        name: 'hourlyRate',
      })
    })

    it('always exposes both WageType and HourlyRate field components', async () => {
      server.use(handleGetContractor(() => HttpResponse.json(fixedContractor)))

      const { result } = renderPayForm()
      const ready = await waitForReady(result)

      expect(typeof ready.form.Fields.WageType).toBe('function')
      expect(typeof ready.form.Fields.HourlyRate).toBe('function')
    })

    it('flips isHourly when wageType switches from Fixed to Hourly', async () => {
      server.use(handleGetContractor(() => HttpResponse.json(fixedContractor)))

      const { result } = renderPayForm()
      const ready = await waitForReady(result)
      expect(ready.status.isHourly).toBe(false)

      act(() => {
        ready.form.hookFormInternals.formMethods.setValue('wageType', WageType.Hourly)
      })

      await waitFor(() => {
        assertReady(result.current)
        expect(result.current.status.isHourly).toBe(true)
      })
    })

    it('blocks a Fixed -> Hourly switch while the rate is still the 0 default', async () => {
      server.use(handleGetContractor(() => HttpResponse.json(fixedContractor)))
      const updateResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json(fixedContractor))
      server.use(handleUpdateContractor(updateResolver))

      const { result } = renderPayForm()
      const ready = await waitForReady(result)

      act(() => {
        ready.form.hookFormInternals.formMethods.setValue('wageType', WageType.Hourly)
      })

      let submitResult: unknown
      await act(async () => {
        submitResult = await ready.actions.onSubmit()
      })

      expect(submitResult).toBeUndefined()
      expect(updateResolver).not.toHaveBeenCalled()
      expect(
        ready.form.hookFormInternals.formMethods.getFieldState('hourlyRate').error,
      ).toMatchObject({ message: ContractorPayErrorCodes.REQUIRED })
    })

    it.each([
      ['45.00', 45, '45'],
      ['25.50', 25.5, '25.5'],
    ])(
      'sends {version, type, wage_type, hourly_rate} for an Hourly contractor (rate %s)',
      async (apiRate, formRate, wireRate) => {
        server.use(
          handleGetContractor(() =>
            HttpResponse.json({ ...hourlyContractor, hourly_rate: apiRate }),
          ),
        )
        let requestBody: Record<string, unknown> | null = null
        const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
          requestBody = (await request.json()) as Record<string, unknown>
          return HttpResponse.json({ ...hourlyContractor, version: 'v2', hourly_rate: apiRate })
        })
        server.use(handleUpdateContractor(updateResolver))

        const { result } = renderPayForm()
        await waitFor(() => {
          assertReady(result.current)
          expect(result.current.status.isHourly).toBe(true)
        })
        assertReady(result.current)
        const ready = result.current
        expect(ready.form.getFormSubmissionValues()).toMatchObject({ hourlyRate: formRate })

        let submitResult: unknown
        await act(async () => {
          submitResult = await ready.actions.onSubmit()
        })

        expect(updateResolver).toHaveBeenCalledTimes(1)
        expect(requestBody).toEqual({
          version: 'v1',
          type: 'Individual',
          wage_type: 'Hourly',
          hourly_rate: wireRate,
          self_onboarding: false,
          file_new_hire_report: false,
        })
        expect(submitResult).toMatchObject({
          mode: 'update',
          data: { uuid: 'contractor-123', version: 'v2' },
        })
      },
    )

    it('omits hourly_rate when an Hourly contractor switches to Fixed', async () => {
      server.use(handleGetContractor(() => HttpResponse.json(hourlyContractor)))
      let requestBody: Record<string, unknown> | null = null
      let requestPath: string | null = null
      const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
        requestBody = (await request.json()) as Record<string, unknown>
        requestPath = new URL(request.url).pathname
        return HttpResponse.json({ ...fixedContractor, version: 'v2' })
      })
      server.use(handleUpdateContractor(updateResolver))

      const { result } = renderPayForm()
      await waitFor(() => {
        assertReady(result.current)
        expect(result.current.status.isHourly).toBe(true)
      })
      assertReady(result.current)
      const ready = result.current

      act(() => {
        ready.form.hookFormInternals.formMethods.setValue('wageType', WageType.Fixed)
      })

      await act(async () => {
        await ready.actions.onSubmit()
      })

      expect(updateResolver).toHaveBeenCalledTimes(1)
      expect(requestPath).toBe('/v1/contractors/contractor-123')
      // self_onboarding / file_new_hire_report are client-library wire defaults,
      // not values the hook sends.
      expect(requestBody).toEqual({
        version: 'v1',
        type: 'Individual',
        wage_type: 'Fixed',
        self_onboarding: false,
        file_new_hire_report: false,
      })
    })

    it('populates errorHandling.errors on a 422 and clears them after a later success', async () => {
      server.use(handleGetContractor(() => HttpResponse.json(hourlyContractor)))
      const failingResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json(
          {
            errors: [
              {
                error_key: 'hourly_rate',
                category: 'invalid_attribute_value',
                message: 'Hourly rate is invalid',
              },
            ],
          },
          { status: 422 },
        ),
      )
      server.use(handleUpdateContractor(failingResolver))

      const { result } = renderPayForm()
      const ready = await waitForReady(result)

      let firstResult: unknown
      await act(async () => {
        firstResult = await ready.actions.onSubmit()
      })

      expect(firstResult).toBeUndefined()
      expect(failingResolver).toHaveBeenCalledTimes(1)
      await waitFor(() => {
        expect(result.current.errorHandling.errors).toHaveLength(1)
      })
      expect(result.current.errorHandling.errors[0]).toMatchObject({
        category: 'api_error',
        httpStatus: 422,
        fieldErrors: [
          {
            field: 'hourlyRate',
            category: 'invalid_attribute_value',
            message: 'Hourly rate is invalid',
          },
        ],
      })

      const succeedingResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json({ ...hourlyContractor, version: 'v2' }),
      )
      server.use(handleUpdateContractor(succeedingResolver))

      assertReady(result.current)
      const retryReady = result.current
      let secondResult: unknown
      await act(async () => {
        secondResult = await retryReady.actions.onSubmit()
      })

      expect(succeedingResolver).toHaveBeenCalledTimes(1)
      expect(secondResult).toMatchObject({ mode: 'update' })
      await waitFor(() => {
        expect(result.current.errorHandling.errors).toEqual([])
      })
    })

    it('reports isPending while the update mutation is in flight', async () => {
      server.use(handleGetContractor(() => HttpResponse.json(hourlyContractor)))
      let releaseUpdate: () => void = () => {}
      const updateGate = new Promise<void>(resolve => {
        releaseUpdate = resolve
      })
      const updateResolver = vi.fn<HttpResponseResolver>(async () => {
        await updateGate
        return HttpResponse.json({ ...hourlyContractor, version: 'v2' })
      })
      server.use(handleUpdateContractor(updateResolver))

      const { result } = renderPayForm()
      const ready = await waitForReady(result)
      expect(ready.status.isPending).toBe(false)

      let submitPromise: Promise<unknown> = Promise.resolve()
      act(() => {
        submitPromise = ready.actions.onSubmit()
      })

      await waitFor(() => {
        assertReady(result.current)
        expect(result.current.status.isPending).toBe(true)
      })

      await act(async () => {
        releaseUpdate()
        await submitPromise
      })

      await waitFor(() => {
        assertReady(result.current)
        expect(result.current.status.isPending).toBe(false)
      })
    })
  })
})
