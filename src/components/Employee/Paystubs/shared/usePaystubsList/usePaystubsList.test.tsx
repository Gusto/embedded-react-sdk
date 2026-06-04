import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { usePaystubsList, type UsePaystubsListResult } from './usePaystubsList'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { API_BASE_URL } from '@/test/constants'

type ReadyResult = Extract<UsePaystubsListResult, { isLoading: false }>

function assertReady(hookResult: UsePaystubsListResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

type PayStubApiFixture = {
  uuid: string
  payroll_uuid: string
  check_date: string
  gross_pay: string
  net_pay: string
}

const buildPayStubFixture = (overrides: Partial<PayStubApiFixture> & { uuid: string }) => ({
  payroll_uuid: `payroll-${overrides.uuid}`,
  check_date: '2025-01-15',
  gross_pay: '2000.00',
  net_pay: '1500.00',
  ...overrides,
})

const stubList = (
  payStubs: ReturnType<typeof buildPayStubFixture>[],
  headers: Record<string, string> = { 'x-total-count': '0', 'x-total-pages': '1', 'x-page': '1' },
) => {
  server.use(
    http.get(`${API_BASE_URL}/v1/employees/:employee_uuid/pay_stubs`, () =>
      HttpResponse.json(payStubs, { headers }),
    ),
  )
}

describe('usePaystubsList', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('starts loading then resolves to a ready state with paystubs and pagination', async () => {
    stubList(
      [
        buildPayStubFixture({ uuid: 'stub-1', check_date: '2025-01-15' }),
        buildPayStubFixture({ uuid: 'stub-2', check_date: '2024-12-31' }),
      ],
      { 'x-total-count': '2', 'x-total-pages': '1', 'x-page': '1' },
    )

    const { result } = renderHook(() => usePaystubsList({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.errorHandling.errors).toEqual([])

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.data.payStubs).toHaveLength(2)
    expect(result.current.data.payStubs[0]?.uuid).toBe('stub-1')
    expect(result.current.status.isFetching).toBe(false)
    expect(result.current.status.isPending).toBe(false)
    expect(result.current.pagination.payStubs).toBeDefined()
    expect(result.current.actions.downloadPayStub).toBeDefined()
  })

  it('actions.downloadPayStub GETs the paystub PDF and returns a Blob HookSubmitResult', async () => {
    stubList([buildPayStubFixture({ uuid: 'stub-1' })])

    let downloadPath: string | null = null
    const downloadResolver = vi.fn<HttpResponseResolver>(({ request }) => {
      downloadPath = new URL(request.url).pathname
      // The funcs/payrollsGetPayStub helper expects a binary PDF response;
      // MSW serves it as a Blob with the right content-type so readableStreamToBlob
      // succeeds. The exact bytes don't matter — only that a Blob comes back.
      return new HttpResponse(new Uint8Array([0x25, 0x50, 0x44, 0x46]), {
        headers: { 'content-type': 'application/pdf' },
      })
    })
    server.use(
      http.get(
        `${API_BASE_URL}/v1/payrolls/:payroll_id/employees/:employee_id/pay_stub`,
        downloadResolver,
      ),
    )

    const { result } = renderHook(() => usePaystubsList({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let submitResult: Awaited<ReturnType<ReadyResult['actions']['downloadPayStub']>>
    await act(async () => {
      assertReady(result.current)
      submitResult = await result.current.actions.downloadPayStub('payroll-stub-1')
    })

    expect(downloadResolver).toHaveBeenCalledTimes(1)
    expect(downloadPath).toBe('/v1/payrolls/payroll-stub-1/employees/employee-123/pay_stub')
    expect(submitResult).toMatchObject({ mode: 'update' })
    expect(submitResult?.data).toBeInstanceOf(Blob)
    expect(submitResult?.data.type).toBe('application/pdf')
  })

  it('surfaces a paystub download failure through errorHandling.errors', async () => {
    stubList([buildPayStubFixture({ uuid: 'stub-1' })])
    server.use(
      http.get(`${API_BASE_URL}/v1/payrolls/:payroll_id/employees/:employee_id/pay_stub`, () =>
        HttpResponse.json(
          { error_key: 'server_error', errors: [{ message: 'Boom' }] },
          { status: 500 },
        ),
      ),
    )

    const { result } = renderHook(() => usePaystubsList({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      assertReady(result.current)
      await result.current.actions.downloadPayStub('payroll-stub-1')
    })

    await waitFor(() => {
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })
  })
})
