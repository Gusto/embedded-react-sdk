import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import {
  buildPayrollData,
  buildPayrollConfigurationHandlers,
  createEmployee,
  createCompensation,
} from '../../__fixtures__/payrollConfigurationMocks'
import {
  usePayrollConfiguration,
  type UsePayrollConfigurationResult,
} from './usePayrollConfiguration'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { API_BASE_URL } from '@/test/constants'

type ReadyResult = Extract<UsePayrollConfigurationResult, { isLoading: false }>

function assertReady(result: UsePayrollConfigurationResult): asserts result is ReadyResult {
  if (result.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

const defaultParams = (onEvent: () => void) => ({
  companyId: 'company-123',
  payrollId: 'payroll-uuid-1',
  onEvent,
})

describe('usePayrollConfiguration', () => {
  const onEvent = vi.fn()
  let currentPayrollData = buildPayrollData({
    employeeCompensations: [createCompensation('emp-1')],
  })

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    currentPayrollData = buildPayrollData({
      employeeCompensations: [createCompensation('emp-1')],
    })
    server.use(
      ...buildPayrollConfigurationHandlers({
        getPayrollData: () => currentPayrollData,
        employees: [createEmployee('emp-1', 'Alice', 'Anderson')],
      }),
    )
  })

  it('starts loading, then resolves to a ready state with prepared compensations', async () => {
    const { result } = renderHook(() => usePayrollConfiguration(defaultParams(onEvent)), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.data.employeeCompensations).toHaveLength(1)
    expect(result.current.data.employeeCompensations[0]!.employeeUuid).toBe('emp-1')
    expect(result.current.data.payrollCategory).toBe('Regular')
    expect(result.current.status).toMatchObject({
      isCalculating: false,
      isProcessed: false,
      isUpdating: false,
    })
    expect(typeof result.current.pagination.handleNextPage).toBe('function')
  })

  it('exposes a direct-deposit deadline notice', async () => {
    const { result } = renderHook(() => usePayrollConfiguration(defaultParams(onEvent)), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    expect(result.current.data.notice).toMatchObject({
      type: 'directDepositDeadline',
      checkDate: '2025-08-15',
    })
  })

  it('reports isProcessed when the payroll is already processed', async () => {
    server.use(
      http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/prepare`, () =>
        HttpResponse.json(
          {
            errors: [
              {
                error_key: 'base',
                category: 'invalid_operation',
                message: 'This payroll has already been processed.',
              },
            ],
          },
          { status: 422 },
        ),
      ),
    )

    const { result } = renderHook(() => usePayrollConfiguration(defaultParams(onEvent)), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      assertReady(result.current)
      expect(result.current.status.isProcessed).toBe(true)
    })
    expect(onEvent).toHaveBeenCalledWith(
      'runPayroll/alreadyProcessed',
      expect.objectContaining({ payrollId: 'payroll-uuid-1' }),
    )
  })

  it('toggleExclude emits skip + saved events and returns the saved result', async () => {
    let updateBody: { employee_compensations: Array<{ excluded: boolean }> } | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateBody = (await request.json()) as typeof updateBody
      return HttpResponse.json(currentPayrollData)
    })
    server.use(
      http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, updateResolver),
    )

    const { result } = renderHook(() => usePayrollConfiguration(defaultParams(onEvent)), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    const ready = result.current

    const compensation = ready.data.employeeCompensations[0]!
    let submitResult: Awaited<ReturnType<typeof ready.actions.toggleExclude>>
    await act(async () => {
      submitResult = await ready.actions.toggleExclude(compensation)
    })

    expect(onEvent).toHaveBeenCalledWith('runPayroll/employee/skip', { employeeId: 'emp-1' })
    expect(onEvent).toHaveBeenCalledWith(
      'runPayroll/employee/saved',
      expect.objectContaining({ payrollPrepared: expect.anything() }),
    )
    expect(updateResolver).toHaveBeenCalledTimes(1)
    // emp-1 starts unexcluded, so the toggle sends excluded: true.
    expect(updateBody!.employee_compensations[0]!.excluded).toBe(true)
    expect(submitResult!).toMatchObject({ mode: 'update' })
  })

  it('surfaces query errors through errorHandling', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    )

    const { result } = renderHook(() => usePayrollConfiguration(defaultParams(onEvent)), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })
  })

  describe('calculation', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      currentPayrollData = buildPayrollData({
        calculatedAt: null,
        processingRequest: null,
        employeeCompensations: [createCompensation('emp-1')],
      })
      server.use(
        ...buildPayrollConfigurationHandlers({
          getPayrollData: () => currentPayrollData,
          employees: [createEmployee('emp-1', 'Alice', 'Anderson')],
        }),
      )
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('calculatePayroll submits and emits runPayroll/calculated once polling detects success', async () => {
      server.use(
        http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/calculate`, () => {
          currentPayrollData = buildPayrollData({
            calculatedAt: new Date().toISOString(),
            processingRequest: { status: 'calculate_success', errors: [] },
            employeeCompensations: [createCompensation('emp-1')],
          })
          return new HttpResponse(null, { status: 202 })
        }),
      )

      const { result } = renderHook(() => usePayrollConfiguration(defaultParams(onEvent)), {
        wrapper: GustoTestProvider,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      assertReady(result.current)
      const ready = result.current

      await act(async () => {
        await ready.actions.calculatePayroll()
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(6_000)
      })

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          'runPayroll/calculated',
          expect.objectContaining({ payrollId: 'payroll-uuid-1' }),
        )
      })
    })
  })
})
