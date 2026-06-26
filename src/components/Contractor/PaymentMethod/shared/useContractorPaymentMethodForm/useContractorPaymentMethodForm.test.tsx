import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import {
  useContractorPaymentMethodForm,
  type UseContractorPaymentMethodFormResult,
} from './useContractorPaymentMethodForm'
import {
  ContractorPaymentMethodErrorCodes,
  createContractorPaymentMethodSchema,
  getExcludedPaymentMethodFields,
} from './contractorPaymentMethodSchema'
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

const createdBankAccount = {
  uuid: 'new-bank-uuid',
  contractor_uuid: 'contractor-123',
  name: 'New Bank',
  routing_number: '266905059',
  hidden_account_number: 'XXXX3123',
  account_type: 'Checking',
}

const updatedPaymentMethod = {
  version: 'updated-version',
  type: 'Direct Deposit',
  split_by: 'Percentage',
  splits: [],
}

describe('createContractorPaymentMethodSchema', () => {
  it('requires bank fields when Direct Deposit is selected', () => {
    const [schema] = createContractorPaymentMethodSchema()
    const result = schema.safeParse({
      type: PAYMENT_METHODS.directDeposit,
      name: '',
      routingNumber: '',
      accountNumber: '',
      accountType: 'Checking',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const fields = new Set(result.error.issues.map(issue => String(issue.path[0])))
    expect(fields).toContain('name')
    expect(fields).toContain('routingNumber')
    expect(fields).toContain('accountNumber')
  })

  it('excludes bank fields from validation when Check is selected', () => {
    const [schema] = createContractorPaymentMethodSchema()
    const result = schema.safeParse({
      type: PAYMENT_METHODS.check,
      name: '',
      routingNumber: '',
      accountNumber: '',
      accountType: 'Checking',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a routing number that is not 9 digits with INVALID_ROUTING_NUMBER', () => {
    const [schema] = createContractorPaymentMethodSchema()
    const result = schema.safeParse({
      type: PAYMENT_METHODS.directDeposit,
      name: 'My Bank',
      routingNumber: '123',
      accountNumber: '123456789',
      accountType: 'Checking',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const routingIssue = result.error.issues.find(
      issue => String(issue.path[0]) === 'routingNumber',
    )
    expect(routingIssue?.message).toBe(ContractorPaymentMethodErrorCodes.INVALID_ROUTING_NUMBER)
  })

  it('validates the account number format when a bank field changes', () => {
    const [schema] = createContractorPaymentMethodSchema({
      existingBankAccount: {
        name: 'BoA',
        routingNumber: '266905059',
        accountType: 'Checking',
        hiddenAccountNumber: 'XXXX1207',
      },
    })
    const result = schema.safeParse({
      type: PAYMENT_METHODS.directDeposit,
      name: 'BoA',
      routingNumber: '266905059',
      accountNumber: 'not-a-number',
      accountType: 'Checking',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const accountIssue = result.error.issues.find(
      issue => String(issue.path[0]) === 'accountNumber',
    )
    expect(accountIssue?.message).toBe(ContractorPaymentMethodErrorCodes.INVALID_ACCOUNT_NUMBER)
  })

  it('does not re-validate the masked account number when nothing changed', () => {
    const [schema] = createContractorPaymentMethodSchema({
      existingBankAccount: {
        name: 'BoA',
        routingNumber: '266905059',
        accountType: 'Checking',
        hiddenAccountNumber: 'XXXX1207',
      },
    })
    const result = schema.safeParse({
      type: PAYMENT_METHODS.directDeposit,
      name: 'BoA',
      routingNumber: '266905059',
      accountNumber: 'XXXX1207',
      accountType: 'Checking',
    })
    expect(result.success).toBe(true)
  })

  it('excludes the bank fields for Check and none for Direct Deposit', () => {
    expect(getExcludedPaymentMethodFields({ type: PAYMENT_METHODS.check })).toEqual([
      'name',
      'routingNumber',
      'accountNumber',
      'accountType',
    ])
    expect(getExcludedPaymentMethodFields({ type: PAYMENT_METHODS.directDeposit })).toEqual([])
  })
})

describe('useContractorPaymentMethodForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('loads the payment method and bank account in update mode', async () => {
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
    expect(result.current.data.bankAccount?.name).toBe('BoA Checking Account')
    expect(result.current.form.Fields.Name).toBeDefined()
    expect(result.current.form.Fields.RoutingNumber).toBeDefined()
    expect(result.current.form.Fields.AccountNumber).toBeDefined()
    expect(result.current.form.Fields.AccountType).toBeDefined()
  })

  it('hides the bank fields when Check is selected', async () => {
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
      expect(result.current.form.Fields.Name).toBeUndefined()
    })
    assertReady(result.current)
    expect(result.current.form.Fields.RoutingNumber).toBeUndefined()
    expect(result.current.form.Fields.AccountNumber).toBeUndefined()
    expect(result.current.form.Fields.AccountType).toBeUndefined()
  })

  it('creates the bank account before updating the payment method on Direct Deposit', async () => {
    const onBankAccountCreated = vi.fn()
    const createResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(createdBankAccount, { status: 201 }),
    )
    const updateResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(updatedPaymentMethod),
    )
    server.use(
      handleCreateContractorBankAccount(createResolver),
      handleUpdateContractorPaymentMethod(updateResolver),
    )

    const { result } = renderHook(
      () => useContractorPaymentMethodForm({ contractorId: 'contractor-123' }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let submitResult
    await act(async () => {
      assertReady(result.current)
      submitResult = await result.current.actions.onSubmit({ onBankAccountCreated })
    })

    expect(createResolver).toHaveBeenCalledTimes(1)
    expect(updateResolver).toHaveBeenCalledTimes(1)
    expect(createResolver.mock.invocationCallOrder[0]!).toBeLessThan(
      updateResolver.mock.invocationCallOrder[0]!,
    )
    expect(onBankAccountCreated).toHaveBeenCalledWith(
      expect.objectContaining({ uuid: 'new-bank-uuid' }),
    )
    expect(submitResult).toMatchObject({ mode: 'update' })
  })

  it('updates the payment method without creating a bank account on Check', async () => {
    let updateBody: Record<string, unknown> | null = null
    const onBankAccountCreated = vi.fn()
    const createResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(createdBankAccount, { status: 201 }),
    )
    const updateResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      updateBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({ ...updatedPaymentMethod, type: 'Check' })
    })
    server.use(
      handleCreateContractorBankAccount(createResolver),
      handleUpdateContractorPaymentMethod(updateResolver),
    )

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

    await act(async () => {
      assertReady(result.current)
      await result.current.actions.onSubmit({ onBankAccountCreated })
    })

    expect(createResolver).not.toHaveBeenCalled()
    expect(onBankAccountCreated).not.toHaveBeenCalled()
    expect(updateResolver).toHaveBeenCalledTimes(1)
    expect(updateBody).toMatchObject({ type: 'Check' })
  })

  it('does not call any mutation when validation fails', async () => {
    const createResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(createdBankAccount, { status: 201 }),
    )
    const updateResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(updatedPaymentMethod),
    )
    server.use(
      handleCreateContractorBankAccount(createResolver),
      handleUpdateContractorPaymentMethod(updateResolver),
    )

    const { result } = renderHook(
      () => useContractorPaymentMethodForm({ contractorId: 'contractor-123' }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      assertReady(result.current)
      result.current.form.hookFormInternals.formMethods.setValue('routingNumber', '123')
    })

    let submitResult
    await act(async () => {
      assertReady(result.current)
      submitResult = await result.current.actions.onSubmit()
    })

    expect(submitResult).toBeUndefined()
    expect(createResolver).not.toHaveBeenCalled()
    expect(updateResolver).not.toHaveBeenCalled()
  })
})
