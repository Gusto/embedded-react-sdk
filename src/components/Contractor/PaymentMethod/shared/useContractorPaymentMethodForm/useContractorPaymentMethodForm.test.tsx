import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import {
  useContractorPaymentMethodForm,
  type UseContractorPaymentMethodFormResult,
} from './useContractorPaymentMethodForm'
import { createContractorPaymentMethodSchema } from './contractorPaymentMethodSchema'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import {
  handleCreateContractorBankAccount,
  handleUpdateContractorPaymentMethod,
} from '@/test/mocks/apis/contractor_payment_method'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { PAYMENT_METHODS } from '@/shared/constants'

type ReadyResult = Extract<UseContractorPaymentMethodFormResult, { isLoading: false }>

function assertReady(
  hookResult: UseContractorPaymentMethodFormResult,
): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

const updatedPaymentMethod = {
  version: 'updated-version',
  type: 'Check',
  split_by: 'Percentage',
  splits: [],
}

describe('createContractorPaymentMethodSchema', () => {
  it('accepts a Direct Deposit type', () => {
    const [schema] = createContractorPaymentMethodSchema()
    expect(schema.safeParse({ type: PAYMENT_METHODS.directDeposit }).success).toBe(true)
  })

  it('accepts a Check type', () => {
    const [schema] = createContractorPaymentMethodSchema()
    expect(schema.safeParse({ type: PAYMENT_METHODS.check }).success).toBe(true)
  })
})

describe('useContractorPaymentMethodForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('loads the payment method in update mode and exposes only the Type field', async () => {
    const { result } = renderHook(
      () => useContractorPaymentMethodForm({ contractorId: 'contractor-123' }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.status.mode).toBe('update')
    expect(result.current.data.paymentMethod.type).toBe(PAYMENT_METHODS.directDeposit)
    expect(result.current.status.isDirectDeposit).toBe(true)
    expect(typeof result.current.form.Fields.Type).toBe('function')
  })

  it('reflects the selected type via status.isDirectDeposit', async () => {
    const { result } = renderHook(
      () => useContractorPaymentMethodForm({ contractorId: 'contractor-123' }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      assertReady(result.current)
      result.current.form.hookFormInternals.formMethods.setValue('type', PAYMENT_METHODS.check)
    })

    await waitFor(() => {
      assertReady(result.current)
      expect(result.current.status.isDirectDeposit).toBe(false)
    })
  })

  it('updates the payment method type on submit', async () => {
    let updateBody: Record<string, unknown> | null = null
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(updatedPaymentMethod)
    })
    server.use(handleUpdateContractorPaymentMethod(updateResolver))

    const { result } = renderHook(
      () => useContractorPaymentMethodForm({ contractorId: 'contractor-123' }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      assertReady(result.current)
      result.current.form.hookFormInternals.formMethods.setValue('type', PAYMENT_METHODS.check)
    })

    let submitResult
    await act(async () => {
      assertReady(result.current)
      submitResult = await result.current.actions.onSubmit()
    })

    expect(updateResolver).toHaveBeenCalledTimes(1)
    expect(updateBody).toMatchObject({ type: 'Check' })
    expect(submitResult).toMatchObject({ mode: 'update' })
  })

  it('does not create a bank account on submit', async () => {
    const createResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({ uuid: 'new-bank-uuid' }, { status: 201 }),
    )
    server.use(handleCreateContractorBankAccount(createResolver))

    const { result } = renderHook(
      () => useContractorPaymentMethodForm({ contractorId: 'contractor-123' }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      assertReady(result.current)
      await result.current.actions.onSubmit()
    })

    expect(createResolver).not.toHaveBeenCalled()
  })
})
