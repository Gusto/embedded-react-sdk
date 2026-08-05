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

    await waitFor(() => {
      assertReady(result.current)
      expect(result.current.status.isHourly).toBe(true)
      expect(result.current.form.getFormSubmissionValues()).toMatchObject({
        wageType: 'Hourly',
        hourlyRate: 45,
      })
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
})
