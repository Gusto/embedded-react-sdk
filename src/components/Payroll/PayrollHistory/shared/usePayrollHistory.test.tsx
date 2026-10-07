import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { usePayrollHistory } from './usePayrollHistory'
import { server } from '@/test/mocks/server'
import { API_BASE_URL } from '@/test/constants'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

const companyId = 'company-123'
const deadline = new Date()
deadline.setDate(deadline.getDate() + 7)
const payroll = {
  payroll_uuid: 'payroll-123',
  processed: true,
  off_cycle: false,
  payroll_deadline: deadline.toISOString(),
  payroll_status_meta: { cancellable: true },
  pay_period: { start_date: '2025-01-01', end_date: '2025-01-15' },
  totals: { gross_pay: '1000', employer_taxes: '75', reimbursements: '25', benefits: '50' },
}
const wrapper = GustoTestProvider
function renderHistoryHook() {
  return renderHook(() => usePayrollHistory({ companyId }), { wrapper })
}

describe('usePayrollHistory headless contract', () => {
  beforeEach(() => {
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () =>
        HttpResponse.json([payroll]),
      ),
      http.get(`${API_BASE_URL}/v1/companies/:company_id/wire_in_requests`, () =>
        HttpResponse.json([{ payment_uuid: payroll.payroll_uuid, status: 'awaiting_funds' }]),
      ),
    )
  })

  it('returns history rendering data without mounting PayrollHistory', async () => {
    const { result } = renderHistoryHook()
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    if (result.current.isLoading) throw new Error('Expected ready hook')
    expect(result.current.data.payrollHistory[0]?.historyDetails).toEqual({
      payrollId: payroll.payroll_uuid,
      totalAmount: 1150,
      canCancel: true,
      wireInRequest: { paymentUuid: payroll.payroll_uuid, status: 'awaiting_funds' },
    })
    expect(result.current.pagination.currentPage).toBe(1)
    expect(result.current.pagination.itemsPerPage).toBe(5)
  })

  it('retains the uuid fallback and honors cancellation restrictions', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, () =>
        HttpResponse.json([
          {
            ...payroll,
            payroll_uuid: undefined,
            uuid: 'uuid-fallback',
            payroll_status_meta: { cancellable: false },
          },
        ]),
      ),
    )
    const { result } = renderHistoryHook()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    if (result.current.isLoading) throw new Error('Expected ready hook')
    expect(result.current.data.payrollHistory[0]?.historyDetails).toMatchObject({
      payrollId: 'uuid-fallback',
      canCancel: false,
    })
  })

  it('returns supporting-query errors before ready state and supports retry', async () => {
    const resolver = vi
      .fn<HttpResponseResolver>()
      .mockImplementationOnce(() =>
        HttpResponse.json({ message: 'Unable to load wires' }, { status: 500 }),
      )
      .mockImplementation(() => HttpResponse.json([]))
    server.use(http.get(`${API_BASE_URL}/v1/companies/:company_id/wire_in_requests`, resolver))
    const { result } = renderHistoryHook()
    await waitFor(() => {
      expect(result.current.errorHandling.errors).toHaveLength(1)
    })
    expect(result.current.isLoading).toBe(true)
    act(() => {
      result.current.errorHandling.retryQueries()
    })
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.errorHandling.errors).toEqual([])
  })

  it('returns undefined for a failed cancellation and allows clearing its error', async () => {
    server.use(
      http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/cancel`, () =>
        HttpResponse.json({ error: 'Cancellation failed' }, { status: 400 }),
      ),
    )
    const { result } = renderHistoryHook()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    await act(async () => {
      if (result.current.isLoading) throw new Error('Expected ready hook')
      expect(await result.current.actions.onCancel(payroll.payroll_uuid)).toBeUndefined()
    })
    expect(result.current.errorHandling.errors).toHaveLength(1)
    if (result.current.isLoading) throw new Error('Expected ready hook')
    expect(result.current.status.isPending).toBe(false)
    act(() => {
      result.current.errorHandling.clearSubmitError()
    })
    expect(result.current.errorHandling.errors).toEqual([])
  })

  it('keeps cached rows and exposes background wire errors to headless consumers', async () => {
    const wiresResolver = vi
      .fn<HttpResponseResolver>()
      .mockImplementationOnce(() => HttpResponse.json([]))
      .mockImplementation(() =>
        HttpResponse.json({ message: 'Unable to refresh wires' }, { status: 500 }),
      )
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/wire_in_requests`, wiresResolver),
      http.put(`${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/cancel`, () =>
        HttpResponse.json({ ...payroll, processed: false }),
      ),
    )
    const { result } = renderHistoryHook()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    await act(async () => {
      if (result.current.isLoading) throw new Error('Expected ready hook')
      expect(await result.current.actions.onCancel(payroll.payroll_uuid)).toBeDefined()
    })
    await waitFor(() => {
      expect(result.current.errorHandling.errors).toHaveLength(1)
    })
    if (result.current.isLoading) throw new Error('Expected cached ready hook')
    expect(result.current.data.payrollHistory[0]?.historyDetails.payrollId).toBe(
      payroll.payroll_uuid,
    )
    expect(result.current.status.isPending).toBe(false)
  })

  it('returns the complete cancel response and relies on SDK invalidation to refresh queries', async () => {
    const listResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json([payroll]))
    const wiresResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json([]))
    const cancelResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({ ...payroll, processed: false }),
    )
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/payrolls`, listResolver),
      http.get(`${API_BASE_URL}/v1/companies/:company_id/wire_in_requests`, wiresResolver),
      http.put(
        `${API_BASE_URL}/v1/companies/:company_id/payrolls/:payroll_id/cancel`,
        cancelResolver,
      ),
    )
    const { result } = renderHistoryHook()
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    await act(async () => {
      if (result.current.isLoading) throw new Error('Expected ready hook')
      const cancelled = await result.current.actions.onCancel(payroll.payroll_uuid)
      expect(cancelled).toMatchObject({
        payrollId: payroll.payroll_uuid,
        result: { unprocessedPayroll: { payrollUuid: payroll.payroll_uuid, processed: false } },
      })
      expect(cancelled?.result.httpMeta.response.status).toBe(200)
    })
    await waitFor(() => {
      expect(listResolver).toHaveBeenCalledTimes(2)
    })
    expect(wiresResolver).toHaveBeenCalledTimes(2)
    expect(cancelResolver).toHaveBeenCalledTimes(1)
  })
})
