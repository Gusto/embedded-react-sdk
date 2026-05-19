import { renderHook, act, render, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { useSplitPaymentsForm, type UseSplitPaymentsFormResult } from './useSplitPaymentsForm'
import {
  SplitPaymentsFormErrorCodes,
  createSplitPaymentsFormSchema,
} from './useSplitPaymentsFormSchema'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { API_BASE_URL } from '@/test/constants'
import { SPLIT_BY } from '@/shared/constants'

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
    })
    expect(result.success).toBe(true)
  })

  it('emits PERCENTAGE_TOTAL_MISMATCH at the synthetic percentageTotal path when sum != 100', () => {
    const [schema] = createSplitPaymentsFormSchema()
    const result = schema.safeParse({
      splitBy: 'Percentage',
      splitAmount: { 'bank-1': 30, 'bank-2': 40 },
      priority: { 'bank-1': 1, 'bank-2': 2 },
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const syntheticIssue = result.error.issues.find(i => i.path[0] === 'percentageTotal')
    expect(syntheticIssue?.message).toBe(SplitPaymentsFormErrorCodes.PERCENTAGE_TOTAL_MISMATCH)
    // No per-field PERCENTAGE_TOTAL_MISMATCH — the invariant is surfaced
    // only via `status.hasPercentageImbalance` so it does not pollute
    // per-split error slots.
    const perFieldMismatches = result.error.issues.filter(
      i =>
        i.path[0] === 'splitAmount' &&
        i.message === SplitPaymentsFormErrorCodes.PERCENTAGE_TOTAL_MISMATCH,
    )
    expect(perFieldMismatches).toHaveLength(0)
  })

  it('skips PERCENTAGE_TOTAL_MISMATCH when per-field errors are present', () => {
    const [schema] = createSplitPaymentsFormSchema()
    const result = schema.safeParse({
      splitBy: 'Percentage',
      splitAmount: { 'bank-1': 60, 'bank-2': null },
      priority: { 'bank-1': 1, 'bank-2': 2 },
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const imbalance = result.error.issues.find(i => i.path[0] === 'percentageTotal')
    const required = result.error.issues.find(
      i => i.path[0] === 'splitAmount' && i.path[1] === 'bank-2',
    )
    expect(imbalance).toBeUndefined()
    expect(required?.message).toBe(SplitPaymentsFormErrorCodes.REQUIRED)
  })

  it('preprocesses NaN to null on splitAmount values so REQUIRED fires (no raw NaN error)', () => {
    const [schema] = createSplitPaymentsFormSchema()
    const result = schema.safeParse({
      splitBy: 'Percentage',
      splitAmount: { 'bank-1': 60, 'bank-2': NaN },
      priority: { 'bank-1': 1, 'bank-2': 2 },
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const issue = result.error.issues.find(
      i => i.path[0] === 'splitAmount' && i.path[1] === 'bank-2',
    )
    expect(issue?.message).toBe(SplitPaymentsFormErrorCodes.REQUIRED)
    expect(result.error.issues.some(i => i.message.toLowerCase().includes('nan'))).toBe(false)
  })

  it('fails with INVALID_PERCENTAGE when a single split is out of range or fractional', () => {
    const [schema] = createSplitPaymentsFormSchema()
    const result = schema.safeParse({
      splitBy: 'Percentage',
      splitAmount: { 'bank-1': 150.5, 'bank-2': -10 },
      priority: { 'bank-1': 1, 'bank-2': 2 },
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
    })
    expect(result.success).toBe(true)
  })

  it('fails with DUPLICATE_PRIORITIES when two splits share a priority in Amount mode', () => {
    const [schema] = createSplitPaymentsFormSchema()
    const result = schema.safeParse({
      splitBy: 'Amount',
      splitAmount: { 'bank-1': 100, 'bank-2': null },
      priority: { 'bank-1': 1, 'bank-2': 1 },
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const dupIssue = result.error.issues.find(i => i.path[0] === 'priority')
    expect(dupIssue?.message).toBe(SplitPaymentsFormErrorCodes.DUPLICATE_PRIORITIES)
  })

  it('fails with REQUIRED for a null splitAmount in Percentage mode', () => {
    const [schema] = createSplitPaymentsFormSchema()
    const result = schema.safeParse({
      splitBy: 'Percentage',
      splitAmount: { 'bank-1': 60, 'bank-2': null },
      priority: { 'bank-1': 1, 'bank-2': 2 },
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const bank2Issue = result.error.issues.find(
      i => i.path[0] === 'splitAmount' && i.path[1] === 'bank-2',
    )
    expect(bank2Issue?.message).toBe(SplitPaymentsFormErrorCodes.REQUIRED)
  })

  it('fails with REQUIRED for a null non-remainder splitAmount in Amount mode', () => {
    const [schema] = createSplitPaymentsFormSchema()
    const result = schema.safeParse({
      splitBy: 'Amount',
      splitAmount: { 'bank-1': null, 'bank-2': null },
      priority: { 'bank-1': 1, 'bank-2': 2 },
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const bank1Issue = result.error.issues.find(
      i => i.path[0] === 'splitAmount' && i.path[1] === 'bank-1',
    )
    expect(bank1Issue?.message).toBe(SplitPaymentsFormErrorCodes.REQUIRED)
    const bank2Issue = result.error.issues.find(
      i => i.path[0] === 'splitAmount' && i.path[1] === 'bank-2',
    )
    expect(bank2Issue).toBeUndefined()
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
    expect(result.current.status.splitBy).toBe('Percentage')
    expect(result.current.data.splits).toHaveLength(2)
    expect(result.current.data.bankAccounts).toHaveLength(2)
  })

  it('exposes Fields.splits entries with identity and label data only', async () => {
    mockTwoBankAccounts()
    const { result } = renderHook(() => useSplitPaymentsForm({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    const entries = result.current.form.Fields.splits
    expect(entries).toHaveLength(2)
    expect(entries[0]).toMatchObject({
      uuid: 'bank-1',
      name: 'Chase',
      hiddenAccountNumber: 'XXXX0000',
    })
    expect(typeof entries[0]?.Field).toBe('function')
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

  it('blocks the mutation and flips hasPercentageImbalance after submit when sum != 100', async () => {
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

    // With validationMode: 'onSubmit' (default), the imbalance is invisible
    // until the user tries to submit. This matches the rest of our forms.
    assertReady(result.current)
    expect(result.current.status.hasPercentageImbalance).toBe(false)
    expect(result.current.status.percentageTotal).toBe(70)

    let submitResult
    await act(async () => {
      assertReady(result.current)
      submitResult = await result.current.actions.onSubmit()
    })

    expect(putResolver).not.toHaveBeenCalled()
    expect(submitResult).toBeUndefined()

    await waitFor(() => {
      assertReady(result.current)
      expect(result.current.status.hasPercentageImbalance).toBe(true)
    })
  })

  it('clears hasPercentageImbalance as the user corrects the total', async () => {
    const BAD_PAYMENT_METHOD = {
      ...PERCENTAGE_60_40,
      splits: [
        { ...PERCENTAGE_60_40.splits[0], split_amount: 30 },
        { ...PERCENTAGE_60_40.splits[1], split_amount: 40 },
      ],
    }
    mockTwoBankAccounts(BAD_PAYMENT_METHOD)

    const { result } = renderHook(() => useSplitPaymentsForm({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)

    await act(async () => {
      assertReady(result.current)
      await result.current.actions.onSubmit()
    })

    await waitFor(() => {
      assertReady(result.current)
      expect(result.current.status.hasPercentageImbalance).toBe(true)
    })

    act(() => {
      assertReady(result.current)
      result.current.form.hookFormInternals.formMethods.setValue(
        'splitAmount',
        { 'bank-1': 60, 'bank-2': 40 },
        { shouldDirty: true },
      )
    })

    // The hook re-triggers the synthetic PERCENTAGE_TOTAL_PATH on every
    // splitAmount change after the first submit, so the imbalance clears
    // without an external trigger() call — matching real UI behavior where
    // NumberInput's onChange triggers RHF's reValidate cycle.
    await waitFor(() => {
      assertReady(result.current)
      expect(result.current.status.hasPercentageImbalance).toBe(false)
    })
  })

  it('clears hasPercentageImbalance when the user toggles to Amount mode', async () => {
    const BAD_PAYMENT_METHOD = {
      ...PERCENTAGE_60_40,
      splits: [
        { ...PERCENTAGE_60_40.splits[0], split_amount: 30 },
        { ...PERCENTAGE_60_40.splits[1], split_amount: 40 },
      ],
    }
    mockTwoBankAccounts(BAD_PAYMENT_METHOD)

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

    await waitFor(() => {
      assertReady(result.current)
      expect(result.current.status.hasPercentageImbalance).toBe(true)
    })

    act(() => {
      assertReady(result.current)
      result.current.form.hookFormInternals.formMethods.setValue('splitBy', SPLIT_BY.amount)
    })

    await waitFor(() => {
      assertReady(result.current)
      expect(result.current.status.hasPercentageImbalance).toBe(false)
    })
  })

  it('suppresses hasPercentageImbalance while a percentage input is blank (NaN)', async () => {
    mockTwoBankAccounts()
    const { result } = renderHook(() => useSplitPaymentsForm({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.status.hasPercentageImbalance).toBe(false)

    act(() => {
      assertReady(result.current)
      result.current.form.hookFormInternals.formMethods.setValue('splitAmount.bank-1', NaN, {
        shouldDirty: true,
      })
    })

    await waitFor(() => {
      assertReady(result.current)
      expect(result.current.status.hasPercentageImbalance).toBe(false)
    })
    expect(Number.isFinite(result.current.status.percentageTotal)).toBe(true)
    expect(result.current.status.percentageTotal).toBe(40)
  })

  it('suppresses hasPercentageImbalance while a percentage input is null', async () => {
    mockTwoBankAccounts()
    const { result } = renderHook(() => useSplitPaymentsForm({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)

    act(() => {
      assertReady(result.current)
      result.current.form.hookFormInternals.formMethods.setValue(
        'splitAmount',
        { 'bank-1': 60, 'bank-2': null },
        { shouldDirty: true },
      )
    })

    await waitFor(() => {
      assertReady(result.current)
      expect(result.current.status.hasPercentageImbalance).toBe(false)
    })
    expect(result.current.status.percentageTotal).toBe(60)
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

  it('reorderSplits(uuids) rewrites priorities and re-anchors the remainder', async () => {
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
          split_amount: 50000,
        },
        {
          uuid: 'bank-2',
          name: 'Wells Fargo',
          hidden_account_number: 'XXXX1111',
          priority: 2,
          split_amount: null,
        },
      ],
    }
    mockTwoBankAccounts(AMOUNT_PAYMENT_METHOD)

    const { result } = renderHook(() => useSplitPaymentsForm({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.data.remainderId).toBe('bank-2')

    act(() => {
      assertReady(result.current)
      result.current.actions.reorderSplits(['bank-2', 'bank-1'])
    })

    await waitFor(() => {
      assertReady(result.current)
      expect(result.current.data.remainderId).toBe('bank-1')
    })

    const values = result.current.form.hookFormInternals.formMethods.getValues()
    expect(values.priority).toEqual({ 'bank-1': 2, 'bank-2': 1 })
    // The new remainder's amount is null; the previous remainder is cleared to 0.
    expect(values.splitAmount['bank-1']).toBeNull()
    expect(values.splitAmount['bank-2']).toBe(0)
  })

  it('reorderSplits ignores calls whose uuid set does not match the known splits', async () => {
    mockTwoBankAccounts()
    const { result } = renderHook(() => useSplitPaymentsForm({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    const priorityBefore = {
      ...result.current.form.hookFormInternals.formMethods.getValues().priority,
    }

    act(() => {
      assertReady(result.current)
      result.current.actions.reorderSplits(['bank-2', 'unknown-uuid'])
    })

    const priorityAfter = result.current.form.hookFormInternals.formMethods.getValues().priority
    expect(priorityAfter).toEqual(priorityBefore)
  })

  it('marks every splitAmount.<uuid> as required in Percentage mode', async () => {
    mockTwoBankAccounts()
    const { result } = renderHook(() => useSplitPaymentsForm({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    const metadata = result.current.form.fieldsMetadata
    expect(metadata['splitAmount.bank-1']).toMatchObject({
      isRequired: true,
      isDisabled: false,
    })
    expect(metadata['splitAmount.bank-2']).toMatchObject({
      isRequired: true,
      isDisabled: false,
    })
  })

  it('marks the remainder split as required-but-disabled in Amount mode', async () => {
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
          split_amount: 50000,
        },
        {
          uuid: 'bank-2',
          name: 'Wells Fargo',
          hidden_account_number: 'XXXX1111',
          priority: 2,
          split_amount: null,
        },
      ],
    }
    mockTwoBankAccounts(AMOUNT_PAYMENT_METHOD)
    const { result } = renderHook(() => useSplitPaymentsForm({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    const metadata = result.current.form.fieldsMetadata
    expect(metadata['splitAmount.bank-1']).toMatchObject({
      isRequired: true,
      isDisabled: false,
    })
    expect(metadata['splitAmount.bank-2']).toMatchObject({
      isRequired: true,
      isDisabled: true,
    })
  })

  it('submits onSubmit with a REQUIRED form error when a non-remainder amount is cleared', async () => {
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
          split_amount: 50000,
        },
        {
          uuid: 'bank-2',
          name: 'Wells Fargo',
          hidden_account_number: 'XXXX1111',
          priority: 2,
          split_amount: null,
        },
      ],
    }
    mockTwoBankAccounts(AMOUNT_PAYMENT_METHOD)

    const putResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json({}))
    server.use(http.put(`${API_BASE_URL}/v1/employees/:employee_id/payment_method`, putResolver))

    const { result } = renderHook(() => useSplitPaymentsForm({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      assertReady(result.current)
      result.current.form.hookFormInternals.formMethods.setValue(
        'splitAmount',
        { 'bank-1': null, 'bank-2': null },
        { shouldDirty: true },
      )
    })

    let submitResult
    await act(async () => {
      assertReady(result.current)
      submitResult = await result.current.actions.onSubmit()
    })

    expect(putResolver).not.toHaveBeenCalled()
    expect(submitResult).toBeUndefined()

    assertReady(result.current)
    const bank1State =
      result.current.form.hookFormInternals.formMethods.getFieldState('splitAmount.bank-1')
    const bank2State =
      result.current.form.hookFormInternals.formMethods.getFieldState('splitAmount.bank-2')
    expect(bank1State.error?.message).toBe(SplitPaymentsFormErrorCodes.REQUIRED)
    expect(bank2State.error).toBeUndefined()
  })

  it('renders a percent-formatted input when in Percentage mode via the bound Field', async () => {
    mockTwoBankAccounts()
    const { result } = renderHook(() => useSplitPaymentsForm({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    const firstSplit = result.current.form.Fields.splits[0]
    if (!firstSplit) throw new Error('expected at least one split entry')
    const SplitField = firstSplit.Field

    const { container } = render(
      <GustoTestProvider>
        <SDKFormProvider formHookResult={result.current}>
          <SplitField label="bank-1 percentage" />
        </SDKFormProvider>
      </GustoTestProvider>,
    )

    // Hidden input mirrors the form path; visible input shows the value with a `%` adornment.
    await waitFor(() => {
      expect(container.querySelector('input[name="splitAmount.bank-1"]')).toBeInTheDocument()
    })
    expect(container.textContent).toContain('%')
  })
})
