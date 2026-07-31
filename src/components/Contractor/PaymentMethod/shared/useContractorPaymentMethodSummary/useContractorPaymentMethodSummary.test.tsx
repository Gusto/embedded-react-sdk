import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { useContractorPaymentMethodSummary } from './useContractorPaymentMethodSummary'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { server } from '@/test/mocks/server'
import {
  handleGetContractorPaymentMethod,
  handleUpdateContractorPaymentMethod,
} from '@/test/mocks/apis/contractor_payment_method'
import { setupApiTestMocks } from '@/test/mocks/apiServer'

describe('useContractorPaymentMethodSummary', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('starts in the loading branch and resolves into the ready branch with the payment method and bank account', async () => {
    const { result } = renderHook(
      () => useContractorPaymentMethodSummary({ contractorId: 'contractor-123' }),
      { wrapper: GustoTestProvider },
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    if (result.current.isLoading) return

    expect(result.current.data.paymentMethod).toMatchObject({ type: 'Direct Deposit' })
    expect(result.current.data.bankAccount).toMatchObject({
      name: 'BoA Checking Account',
      hiddenAccountNumber: 'XXXX1207',
    })
    expect(result.current.status).toMatchObject({ isFetching: false, isPending: false })
  })

  it('reverts the payment method to Check via onRemoveBankAccount', async () => {
    const updateResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({ version: 'updated-version', type: 'Check', splits: [] }),
    )
    server.use(handleUpdateContractorPaymentMethod(updateResolver))

    const { result } = renderHook(
      () => useContractorPaymentMethodSummary({ contractorId: 'contractor-123' }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    if (result.current.isLoading) return
    const ready = result.current

    let submitResult: unknown
    await act(async () => {
      submitResult = await ready.actions.onRemoveBankAccount()
    })

    expect(updateResolver).toHaveBeenCalledTimes(1)
    expect(submitResult).toEqual(
      expect.objectContaining({ mode: 'update', data: expect.objectContaining({ type: 'Check' }) }),
    )
  })

  it('surfaces a query failure through errorHandling.errors', async () => {
    server.use(
      handleGetContractorPaymentMethod(() =>
        HttpResponse.json(
          { errors: [{ category: 'server_error', message: 'Boom' }] },
          { status: 500 },
        ),
      ),
    )

    const { result } = renderHook(
      () => useContractorPaymentMethodSummary({ contractorId: 'contractor-123' }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
    })

    expect(result.current.isLoading).toBe(true)
  })
})
