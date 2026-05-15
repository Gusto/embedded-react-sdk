import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { usePaymentMethodForm, type UsePaymentMethodFormResult } from './usePaymentMethodForm'
import {
  PaymentMethodFormErrorCodes,
  createPaymentMethodFormSchema,
} from './usePaymentMethodFormSchema'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { API_BASE_URL } from '@/test/constants'

type ReadyResult = Extract<UsePaymentMethodFormResult, { isLoading: false }>

function assertReady(hookResult: UsePaymentMethodFormResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

describe('createPaymentMethodFormSchema', () => {
  it('accepts a valid Direct Deposit payload', () => {
    const [schema] = createPaymentMethodFormSchema()
    const result = schema.safeParse({ type: 'Direct Deposit' })
    expect(result.success).toBe(true)
  })

  it('accepts a valid Check payload', () => {
    const [schema] = createPaymentMethodFormSchema()
    const result = schema.safeParse({ type: 'Check' })
    expect(result.success).toBe(true)
  })

  it('rejects an empty type with REQUIRED', () => {
    const [schema] = createPaymentMethodFormSchema()
    const result = schema.safeParse({ type: '' })
    expect(result.success).toBe(false)
    if (result.success) return
    const issue = result.error.issues.find(i => String(i.path[0]) === 'type')
    expect(issue?.message).toBe(PaymentMethodFormErrorCodes.REQUIRED)
  })

  it('metadata reports type as required', () => {
    const [, { getFieldsMetadata }] = createPaymentMethodFormSchema()
    expect(getFieldsMetadata().type.isRequired).toBe(true)
  })
})

describe('usePaymentMethodForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('loads the existing payment method and reports update mode', async () => {
    const { result } = renderHook(() => usePaymentMethodForm({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.status.mode).toBe('update')
    expect(result.current.data.paymentMethod.type).toBe('Direct Deposit')
    expect(result.current.form.Fields.Type).toBeDefined()
  })

  it('PUTs only { version, type: Check } when switching to Check', async () => {
    let putBody: Record<string, unknown> | null = null
    const putResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      putBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({
        version: 'next-version',
        type: putBody.type as string,
      })
    })

    server.use(http.put(`${API_BASE_URL}/v1/employees/:employee_id/payment_method`, putResolver))

    const { result } = renderHook(
      () =>
        usePaymentMethodForm({
          employeeId: 'employee-123',
          defaultValues: { type: 'Check' },
        }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let submitResult
    await act(async () => {
      assertReady(result.current)
      submitResult = await result.current.actions.onSubmit()
    })

    expect(putResolver).toHaveBeenCalledTimes(1)
    expect(putBody).toMatchObject({ type: 'Check' })
    expect(putBody).not.toHaveProperty('splits')
    expect(putBody).not.toHaveProperty('split_by')
    expect(submitResult).toMatchObject({ mode: 'update', data: { type: 'Check' } })
  })

  it('preserves splits and splitBy in the PUT body when staying on Direct Deposit', async () => {
    let putBody: Record<string, unknown> | null = null
    const putResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      putBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({
        version: 'next-version',
        type: 'Direct Deposit',
        split_by: 'Percentage',
        splits: (putBody as Record<string, unknown>).splits,
      })
    })

    server.use(http.put(`${API_BASE_URL}/v1/employees/:employee_id/payment_method`, putResolver))

    const { result } = renderHook(
      () =>
        usePaymentMethodForm({
          employeeId: 'employee-123',
          defaultValues: { type: 'Direct Deposit' },
        }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      assertReady(result.current)
      await result.current.actions.onSubmit()
    })

    const finalBody = putBody as Record<string, unknown> | null
    expect(finalBody).toMatchObject({
      type: 'Direct Deposit',
      split_by: 'Percentage',
    })
    expect(Array.isArray(finalBody?.splits)).toBe(true)
  })
})
