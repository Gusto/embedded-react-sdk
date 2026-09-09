import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import {
  buildPayrollData,
  buildPayrollConfigurationHandlers,
  createCompensation,
} from '../../__fixtures__/payrollConfigurationMocks'
import { usePayrollGrossUp, type UsePayrollGrossUpResult } from './usePayrollGrossUp'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { API_BASE_URL } from '@/test/constants'

type ReadyResult = Extract<UsePayrollGrossUpResult, { isLoading: false }>

function assertReady(result: UsePayrollGrossUpResult): asserts result is ReadyResult {
  if (result.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

const params = {
  companyId: 'company-123',
  payrollId: 'payroll-uuid-1',
  employeeId: 'emp-1',
}

const bonusPayroll = () =>
  buildPayrollData({
    offCycle: true,
    offCycleReason: 'Bonus',
    employeeCompensations: [
      createCompensation('emp-1', {
        fixedCompensations: [{ name: 'Bonus', job_uuid: 'job-emp-1', amount: '0' }],
      }),
    ],
  })

describe('usePayrollGrossUp', () => {
  let currentPayrollData = bonusPayroll()

  beforeEach(() => {
    setupApiTestMocks()
    currentPayrollData = bonusPayroll()
    server.use(...buildPayrollConfigurationHandlers({ getPayrollData: () => currentPayrollData }))
  })

  it('reports eligibility and the target compensation for a bonus payroll', async () => {
    const { result } = renderHook(() => usePayrollGrossUp(params), { wrapper: GustoTestProvider })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    expect(result.current.data).toMatchObject({
      isEligible: true,
      targetCompensationName: 'Bonus',
    })
  })

  it('reports ineligibility for a regular payroll', async () => {
    currentPayrollData = buildPayrollData({
      employeeCompensations: [createCompensation('emp-1')],
    })

    const { result } = renderHook(() => usePayrollGrossUp(params), { wrapper: GustoTestProvider })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    expect(result.current.data).toMatchObject({
      isEligible: false,
      targetCompensationName: null,
    })
  })

  it('calculateGrossUp returns the computed gross amount', async () => {
    server.use(
      http.post(`${API_BASE_URL}/v1/payrolls/:payroll_uuid/gross_up`, () =>
        HttpResponse.json({ gross_up: '1250.00' }),
      ),
    )

    const { result } = renderHook(() => usePayrollGrossUp(params), { wrapper: GustoTestProvider })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    const ready = result.current

    let gross: string | null = null
    await act(async () => {
      gross = await ready.actions.calculateGrossUp(1000)
    })
    expect(gross).toBe('1250.00')
  })

  it('calculateGrossUp returns null when the API omits a gross amount', async () => {
    server.use(
      http.post(`${API_BASE_URL}/v1/payrolls/:payroll_uuid/gross_up`, () =>
        HttpResponse.json({ gross_up: null }),
      ),
    )

    const { result } = renderHook(() => usePayrollGrossUp(params), { wrapper: GustoTestProvider })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    const ready = result.current

    let gross: string | null = 'unset'
    await act(async () => {
      gross = await ready.actions.calculateGrossUp(1000)
    })
    expect(gross).toBeNull()
  })

  it('applyGrossUp writes the gross to the target line and zeroes hours', async () => {
    let updateBody: {
      employee_compensations: Array<{
        fixed_compensations: Array<{ name: string; amount: string }>
        hourly_compensations: Array<{ hours: string }>
        excluded: boolean
      }>
    } | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateBody = (await request.json()) as typeof updateBody
      return HttpResponse.json(currentPayrollData)
    })
    server.use(
      http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id`, updateResolver),
    )

    const { result } = renderHook(() => usePayrollGrossUp(params), { wrapper: GustoTestProvider })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    assertReady(result.current)
    const ready = result.current

    let submitResult: Awaited<ReturnType<typeof ready.actions.applyGrossUp>>
    await act(async () => {
      submitResult = await ready.actions.applyGrossUp('1250.00')
    })

    expect(updateResolver).toHaveBeenCalledTimes(1)
    const comp = updateBody!.employee_compensations[0]!
    expect(comp.excluded).toBe(false)
    expect(comp.fixed_compensations).toContainEqual(
      expect.objectContaining({ name: 'Bonus', amount: '1250.00' }),
    )
    expect(comp.hourly_compensations.every(hc => hc.hours === '0')).toBe(true)
    expect(submitResult!).toMatchObject({ mode: 'update' })
  })

  it('surfaces prepare errors through errorHandling', async () => {
    server.use(
      http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/prepare`, () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    )

    const { result } = renderHook(() => usePayrollGrossUp(params), { wrapper: GustoTestProvider })

    await waitFor(() => {
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })
  })
})
