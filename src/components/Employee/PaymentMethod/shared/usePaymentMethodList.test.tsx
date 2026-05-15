import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { usePaymentMethodList, type UsePaymentMethodListResult } from './usePaymentMethodList'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { API_BASE_URL } from '@/test/constants'

type ReadyResult = Extract<UsePaymentMethodListResult, { isLoading: false }>

function assertReady(hookResult: UsePaymentMethodListResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

const checkPaymentMethod = {
  version: 'version-1',
  type: 'Check',
}

const directDepositPaymentMethod = {
  version: 'version-2',
  type: 'Direct Deposit',
  split_by: 'Percentage',
  splits: [
    {
      uuid: 'account-1',
      name: 'Checking',
      hidden_account_number: 'XXXX1234',
      priority: 1,
      split_amount: 60,
    },
    {
      uuid: 'account-2',
      name: 'Savings',
      hidden_account_number: 'XXXX5678',
      priority: 2,
      split_amount: 40,
    },
  ],
}

const bankAccountsFixture = [
  {
    uuid: 'account-1',
    employee_uuid: 'employee-123',
    account_type: 'Checking',
    name: 'Checking',
    routing_number: '011401533',
    hidden_account_number: 'XXXX1234',
  },
  {
    uuid: 'account-2',
    employee_uuid: 'employee-123',
    account_type: 'Savings',
    name: 'Savings',
    routing_number: '011401533',
    hidden_account_number: 'XXXX5678',
  },
]

describe('usePaymentMethodList', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/payment_method`, () =>
        HttpResponse.json(directDepositPaymentMethod),
      ),
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`, () =>
        HttpResponse.json(bankAccountsFixture),
      ),
    )
  })

  it('starts in the loading state and resolves to ready with paymentMethod + bankAccounts', async () => {
    const { result } = renderHook(() => usePaymentMethodList({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.errorHandling.errors).toEqual([])

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.data.paymentMethod.type).toBe('Direct Deposit')
    expect(result.current.data.bankAccounts).toHaveLength(2)
    expect(result.current.data.bankAccounts[0]?.uuid).toBe('account-1')
    expect(result.current.status.isPending).toBe(false)
    expect(result.current.status.isFetching).toBe(false)
    expect(result.current.status.deletePendingBankAccountUuid).toBeUndefined()
    expect(result.current.actions.onDelete).toBeDefined()
    expect(result.current.errorHandling).toBeDefined()
  })

  it('actions.onDelete sends DELETE and returns a HookSubmitResult', async () => {
    let deletePath: string | null = null
    const deleteResolver = vi.fn<HttpResponseResolver>(({ request }) => {
      deletePath = new URL(request.url).pathname
      return new HttpResponse(null, { status: 204 })
    })
    server.use(
      http.delete(
        `${API_BASE_URL}/v1/employees/:employee_id/bank_accounts/:bank_account_id`,
        deleteResolver,
      ),
    )

    const { result } = renderHook(() => usePaymentMethodList({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let submitResult
    await act(async () => {
      assertReady(result.current)
      submitResult = await result.current.actions.onDelete('account-2')
    })

    expect(deleteResolver).toHaveBeenCalledTimes(1)
    expect(deletePath).toBe('/v1/employees/employee-123/bank_accounts/account-2')
    expect(submitResult).toMatchObject({ mode: 'update' })
  })

  it('surfaces a delete failure through errorHandling.errors', async () => {
    server.use(
      http.delete(`${API_BASE_URL}/v1/employees/:employee_id/bank_accounts/:bank_account_id`, () =>
        HttpResponse.json(
          { error_key: 'server_error', errors: [{ message: 'Boom' }] },
          { status: 500 },
        ),
      ),
    )

    const { result } = renderHook(() => usePaymentMethodList({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      assertReady(result.current)
      await result.current.actions.onDelete('account-2')
    })

    await waitFor(() => {
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })
  })

  it('returns the loading branch when the single-account direct deposit is normalized on mount', async () => {
    server.use(
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/payment_method`, () =>
        HttpResponse.json(checkPaymentMethod),
      ),
      http.get(`${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`, () =>
        HttpResponse.json([]),
      ),
    )

    const { result } = renderHook(() => usePaymentMethodList({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.data.paymentMethod.type).toBe('Check')
    expect(result.current.data.bankAccounts).toHaveLength(0)
  })
})
