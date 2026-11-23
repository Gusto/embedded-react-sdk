import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePayrollsGet } from '@gusto/embedded-api/react-query/payrollsGet'
import { useEarningTypesList } from '@gusto/embedded-api/react-query/earningTypesList'
import {
  mutationKeyPayrollsPrepare,
  usePayrollsPrepareMutation,
} from '@gusto/embedded-api/react-query/payrollsPrepare'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import type { PropsWithChildren } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { dependencies } from '../../../package.json'
import { ApiProvider } from './ApiProvider'
import { API_QUERY_NAMESPACE, API_VERSION, SDK_VERSION } from './apiVersion'
import { API_BASE_URL } from '@/test/constants'
import { server } from '@/test/mocks/server'

const companyId = 'company-1'
const payrollId = 'payroll-1'
const companyPath = `${API_BASE_URL}/v1/companies/${companyId}`
const payrollPath = `${companyPath}/payrolls/${payrollId}`

describe('ApiProvider generated queries and mutations', () => {
  it.each([
    { name: 'default client after success', customClient: false, status: 200, refetches: true },
    { name: 'default client after failure', customClient: false, status: 422, refetches: false },
    {
      name: 'caller-owned client after success',
      customClient: true,
      status: 200,
      refetches: false,
    },
  ])(
    'preserves the invalidation contract for $name',
    async ({ customClient, status, refetches }) => {
      let prepared = false
      const payrollResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json({
          payroll_uuid: payrollId,
          employee_compensations: [
            { gross_pay: prepared ? '200.00' : '100.00', deductions: [{ amount: '2.50' }] },
          ],
        }),
      )
      const earningsResolver = vi.fn<HttpResponseResolver>(() =>
        HttpResponse.json({
          custom: [{ uuid: 'bonus', name: 'Bonus', category: 'FlatSumBonus' }],
        }),
      )
      const prepareResolver = vi.fn<HttpResponseResolver>(() => {
        if (status !== 200) return HttpResponse.json({ errors: [] }, { status })
        prepared = true
        return HttpResponse.json({
          payroll_uuid: payrollId,
          employee_compensations: [{ deductions: [{ amount: '2.50' }] }],
        })
      })
      const hostQuery = vi.fn<() => Promise<string>>().mockResolvedValue('host data')
      server.use(
        http.get(payrollPath, payrollResolver),
        http.get(`${companyPath}/earning_types`, earningsResolver),
        http.put(`${payrollPath}/prepare`, prepareResolver),
      )
      const callerClient = customClient ? new QueryClient() : undefined
      const { result, unmount } = renderHook(
        () => ({
          client: useQueryClient(),
          payroll: usePayrollsGet({ companyId, payrollId }, { staleTime: Infinity }),
          earnings: useEarningTypesList({ companyId }, { staleTime: Infinity }),
          host: useQuery({ queryKey: ['host-data'], queryFn: hostQuery, staleTime: Infinity }),
          prepare: usePayrollsPrepareMutation(),
        }),
        {
          wrapper: ({ children }: PropsWithChildren) => (
            <ApiProvider
              url={API_BASE_URL}
              queryClient={callerClient}
              headers={{ Authorization: 'Bearer test-token' }}
              hooks={{
                beforeRequest: [
                  {
                    beforeRequest: (_context, request) => {
                      request.headers.set('X-Custom-Hook', 'present')
                      return request
                    },
                  },
                ],
              }}
            >
              {children}
            </ApiProvider>
          ),
        },
      )

      await waitFor(() => {
        expect(result.current.payroll.isSuccess).toBe(true)
        expect(result.current.earnings.isSuccess).toBe(true)
        expect(result.current.host.isSuccess).toBe(true)
      })
      expect(result.current.payroll.data?.payrollShow?.employeeCompensations).toEqual([
        { grossPay: '100.00', deductions: [{ amount: '2.50' }] },
      ])
      expect(result.current.earnings.data?.earningTypeList?.custom).toEqual([
        { uuid: 'bonus', name: 'Bonus' },
      ])
      const inactiveKey = [API_QUERY_NAMESPACE, 'inactive-query']
      result.current.client.setQueryData(inactiveKey, 'cached')
      const sdkQueries = result.current.client
        .getQueryCache()
        .findAll({ queryKey: [API_QUERY_NAMESPACE] })
      expect(sdkQueries).toHaveLength(3)
      expect(dependencies['@gusto/embedded-api']).toMatch(
        new RegExp(`^npm:${API_QUERY_NAMESPACE}@`),
      )
      expect(mutationKeyPayrollsPrepare()[0]).toBe(API_QUERY_NAMESPACE)

      await act(async () => {
        const mutation = result.current.prepare.mutateAsync({ request: { companyId, payrollId } })
        if (status === 200) await mutation
        else await expect(mutation).rejects.toThrow()
      })

      await waitFor(() => {
        expect(result.current.prepare.status).toBe(status === 200 ? 'success' : 'error')
        expect(result.current.payroll.isFetching).toBe(false)
        expect(result.current.earnings.isFetching).toBe(false)
      })
      expect(payrollResolver).toHaveBeenCalledTimes(refetches ? 2 : 1)
      expect(earningsResolver).toHaveBeenCalledTimes(refetches ? 2 : 1)
      expect(result.current.payroll.data?.payrollShow?.employeeCompensations?.[0]?.grossPay).toBe(
        refetches ? '200.00' : '100.00',
      )
      expect(result.current.client.getQueryState(inactiveKey)?.isInvalidated).toBe(refetches)
      expect(hostQuery).toHaveBeenCalledTimes(1)
      expect(result.current.client.getQueryState(['host-data'])?.isInvalidated).toBe(false)
      expect(prepareResolver).toHaveBeenCalledTimes(1)
      if (status === 200) {
        expect(result.current.prepare.data?.payrollPrepared?.employeeCompensations).toEqual([
          { deductions: [{ amount: 2.5 }] },
        ])
      }
      for (const resolver of [payrollResolver, earningsResolver, prepareResolver]) {
        for (const [info] of resolver.mock.calls) {
          expect(info.request.headers.get('X-Gusto-API-Version')).toBe(API_VERSION)
          expect(info.request.headers.get('X-Gusto-SDK-Version')).toBe(SDK_VERSION)
          expect(info.request.headers.get('Authorization')).toBe('Bearer test-token')
          expect(info.request.headers.get('X-Custom-Hook')).toBe('present')
        }
      }
      unmount()
      result.current.client.clear()
    },
  )
})
