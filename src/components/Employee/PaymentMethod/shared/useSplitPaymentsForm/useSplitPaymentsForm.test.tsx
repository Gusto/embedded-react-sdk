import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { useSplitPaymentsForm, type UseSplitPaymentsFormResult } from './useSplitPaymentsForm'
import {
  SplitPaymentsFormErrorCodes,
  createSplitPaymentsFormSchema,
} from './useSplitPaymentsFormSchema'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { API_BASE_URL } from '@/test/constants'

type ReadyResult = Extract<UseSplitPaymentsFormResult, { isLoading: false }>

function assertReady(hookResult: UseSplitPaymentsFormResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

const TWO_BANK_ACCOUNTS = [
  {
    uuid: 'bank-1',
    employee_uuid: 'employee-123',
    account_type: 'Checking',
    name: 'Chase',
    routing_number: '011401533',
    hidden_account_number: 'XXXX0000',
  },
  {
    uuid: 'bank-2',
    employee_uuid: 'employee-123',
    account_type: 'Savings',
    name: 'Wells Fargo',
    routing_number: '121000248',
    hidden_account_number: 'XXXX1111',
  },
]

const PERCENTAGE_60_40 = {
  version: 'v1',
  type: 'Direct Deposit',
  split_by: 'Percentage',
  splits: [
    {
      uuid: 'bank-1',
      name: 'Chase',
      hidden_account_number: 'XXXX0000',
      priority: 1,
      split_amount: 60,
    },
    {
      uuid: 'bank-2',
      name: 'Wells Fargo',
      hidden_account_number: 'XXXX1111',
      priority: 2,
      split_amount: 40,
    },
  ],
}

const mockTwoBankAccounts = (paymentMethod: Record<string, unknown> = PERCENTAGE_60_40) => {
  server.use(
    http.get(`${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`, () =>
      HttpResponse.json(TWO_BANK_ACCOUNTS),
    ),
    http.get(`${API_BASE_URL}/v1/employees/:employee_id/payment_method`, () =>
      HttpResponse.json(paymentMethod),
    ),
  )
}

describe('createSplitPaymentsFormSchema', () => {
  it('passes when percentages sum to 100', () => {
    const [schema] = createSplitPaymentsFormSchema()
    const result = schema.safeParse({
      splitBy: 'Percentage',
      splitAmount: { 'bank-1': 60, 'bank-2': 40 },
      priority: { 'bank-1': 1, 'bank-2': 2 },
      remainder: '',
    })
    expect(result.success).toBe(true)
  })

  it('fails with PERCENTAGE_TOTAL_MISMATCH when percentages do not sum to 100', () => {
    const [schema] = createSplitPaymentsFormSchema()
    const result = schema.safeParse({
      splitBy: 'Percentage',
      splitAmount: { 'bank-1': 30, 'bank-2': 40 },
      priority: { 'bank-1': 1, 'bank-2': 2 },
      remainder: '',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const totalIssue = result.error.issues.find(
      issue => issue.path.length === 1 && issue.path[0] === 'splitAmount',
    )
    expect(totalIssue?.message).toBe(SplitPaymentsFormErrorCodes.PERCENTAGE_TOTAL_MISMATCH)
  })

  it('fails with INVALID_PERCENTAGE when a single split is out of range or fractional', () => {
    const [schema] = createSplitPaymentsFormSchema()
    const result = schema.safeParse({
      splitBy: 'Percentage',
      splitAmount: { 'bank-1': 150.5, 'bank-2': -10 },
      priority: { 'bank-1': 1, 'bank-2': 2 },
      remainder: '',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const perFieldIssues = result.error.issues.filter(
      issue => issue.path[0] === 'splitAmount' && issue.path.length === 2,
    )
    expect(perFieldIssues.length).toBeGreaterThan(0)
    expect(
      perFieldIssues.every(i => i.message === SplitPaymentsFormErrorCodes.INVALID_PERCENTAGE),
    ).toBe(true)
  })

  it('passes in Amount mode when each amount is >= 0 and priorities are unique', () => {
    const [schema] = createSplitPaymentsFormSchema()
    const result = schema.safeParse({
      splitBy: 'Amount',
      splitAmount: { 'bank-1': 100, 'bank-2': null },
      priority: { 'bank-1': 1, 'bank-2': 2 },
      remainder: 'bank-2',
    })
    expect(result.success).toBe(true)
  })

  it('fails with DUPLICATE_PRIORITIES when two splits share a priority in Amount mode', () => {
    const [schema] = createSplitPaymentsFormSchema()
    const result = schema.safeParse({
      splitBy: 'Amount',
      splitAmount: { 'bank-1': 100, 'bank-2': null },
      priority: { 'bank-1': 1, 'bank-2': 1 },
      remainder: 'bank-2',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const dupIssue = result.error.issues.find(i => i.path[0] === 'priority')
    expect(dupIssue?.message).toBe(SplitPaymentsFormErrorCodes.DUPLICATE_PRIORITIES)
  })
})

describe('useSplitPaymentsForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('loads payment method + bank accounts and reports update mode', async () => {
    mockTwoBankAccounts()
    const { result } = renderHook(() => useSplitPaymentsForm({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.status.mode).toBe('update')
    expect(result.current.data.splitBy).toBe('Percentage')
    expect(result.current.data.splits).toHaveLength(2)
    expect(result.current.data.bankAccounts).toHaveLength(2)
  })

  it('preserves saved splitAmount distribution on mount (bug fix: no reset on first render)', async () => {
    mockTwoBankAccounts()
    const { result } = renderHook(() => useSplitPaymentsForm({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    const values = result.current.form.hookFormInternals.formMethods.getValues()
    expect(values.splitAmount).toEqual({ 'bank-1': 60, 'bank-2': 40 })
  })

  it('PUTs preserved splits payload when saving valid percentages', async () => {
    let putBody: Record<string, unknown> | null = null
    const putResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      putBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({
        version: 'v2',
        type: 'Direct Deposit',
        split_by: 'Percentage',
        splits: (putBody as Record<string, unknown>).splits,
      })
    })

    mockTwoBankAccounts()
    server.use(http.put(`${API_BASE_URL}/v1/employees/:employee_id/payment_method`, putResolver))

    const { result } = renderHook(() => useSplitPaymentsForm({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let submitResult
    await act(async () => {
      assertReady(result.current)
      submitResult = await result.current.actions.onSubmit()
    })

    expect(putResolver).toHaveBeenCalledTimes(1)
    const finalBody = putBody as Record<string, unknown> | null
    expect(finalBody).toMatchObject({
      type: 'Direct Deposit',
      split_by: 'Percentage',
    })
    expect(Array.isArray(finalBody?.splits)).toBe(true)
    expect(submitResult).toMatchObject({ mode: 'update' })
  })

  it('blocks the mutation when percentages do not sum to 100', async () => {
    const BAD_PAYMENT_METHOD = {
      ...PERCENTAGE_60_40,
      splits: [
        { ...PERCENTAGE_60_40.splits[0], split_amount: 30 },
        { ...PERCENTAGE_60_40.splits[1], split_amount: 40 },
      ],
    }
    mockTwoBankAccounts(BAD_PAYMENT_METHOD)

    const putResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json({}))
    server.use(http.put(`${API_BASE_URL}/v1/employees/:employee_id/payment_method`, putResolver))

    const { result } = renderHook(() => useSplitPaymentsForm({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let submitResult
    await act(async () => {
      assertReady(result.current)
      submitResult = await result.current.actions.onSubmit()
    })

    expect(putResolver).not.toHaveBeenCalled()
    expect(submitResult).toBeUndefined()
  })

  it('converts amount-mode dollars to cents in the PUT body', async () => {
    const AMOUNT_PAYMENT_METHOD = {
      version: 'v1',
      type: 'Direct Deposit',
      split_by: 'Amount',
      splits: [
        {
          uuid: 'bank-1',
          name: 'Chase',
          hidden_account_number: 'XXXX0000',
          priority: 1,
          split_amount: 50000, // 500.00 in cents
        },
        {
          uuid: 'bank-2',
          name: 'Wells Fargo',
          hidden_account_number: 'XXXX1111',
          priority: 2,
          split_amount: null, // remainder
        },
      ],
    }
    let putBody: Record<string, unknown> | null = null
    const putResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      putBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({
        version: 'v2',
        type: 'Direct Deposit',
        split_by: 'Amount',
        splits: (putBody as Record<string, unknown>).splits,
      })
    })

    mockTwoBankAccounts(AMOUNT_PAYMENT_METHOD)
    server.use(http.put(`${API_BASE_URL}/v1/employees/:employee_id/payment_method`, putResolver))

    const { result } = renderHook(() => useSplitPaymentsForm({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      assertReady(result.current)
      await result.current.actions.onSubmit()
    })

    expect(putResolver).toHaveBeenCalledTimes(1)
    const finalBody = putBody as {
      splits?: Array<{ uuid: string; split_amount: number | null }>
    } | null
    const chaseSplit = finalBody?.splits?.find(s => s.uuid === 'bank-1')
    const wellsSplit = finalBody?.splits?.find(s => s.uuid === 'bank-2')
    // 500 dollars from the form should round-trip back to 50000 cents in the request body.
    expect(chaseSplit?.split_amount).toBe(50000)
    expect(wellsSplit?.split_amount).toBeNull()
  })
})
