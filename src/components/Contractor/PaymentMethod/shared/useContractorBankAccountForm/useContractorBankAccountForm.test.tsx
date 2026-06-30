import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import {
  useContractorBankAccountForm,
  type UseContractorBankAccountFormResult,
} from './useContractorBankAccountForm'
import {
  ContractorBankAccountErrorCodes,
  createContractorBankAccountSchema,
} from './useContractorBankAccountFormSchema'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { handleCreateContractorBankAccount } from '@/test/mocks/apis/contractor_payment_method'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'

type ReadyResult = Extract<UseContractorBankAccountFormResult, { isLoading: false }>

function assertReady(
  hookResult: UseContractorBankAccountFormResult,
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

describe('createContractorBankAccountSchema', () => {
  it('requires all bank fields', () => {
    const [schema] = createContractorBankAccountSchema()
    const result = schema.safeParse({
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

  it('rejects a routing number that is not 9 digits with INVALID_ROUTING_NUMBER', () => {
    const [schema] = createContractorBankAccountSchema()
    const result = schema.safeParse({
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
    expect(routingIssue?.message).toBe(ContractorBankAccountErrorCodes.INVALID_ROUTING_NUMBER)
  })

  it('validates the account number format when a value is entered', () => {
    const [schema] = createContractorBankAccountSchema()
    const result = schema.safeParse({
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
    expect(accountIssue?.message).toBe(ContractorBankAccountErrorCodes.INVALID_ACCOUNT_NUMBER)
  })

  it('accepts the existing masked account number unchanged as the keep-existing sentinel', () => {
    const [schema] = createContractorBankAccountSchema({ existingAccountNumberMask: 'XXXX1207' })
    const result = schema.safeParse({
      name: 'BoA',
      routingNumber: '266905059',
      accountNumber: 'XXXX1207',
      accountType: 'Checking',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a masked value that does not match the existing account mask', () => {
    const [schema] = createContractorBankAccountSchema({ existingAccountNumberMask: 'XXXX1207' })
    const result = schema.safeParse({
      name: 'BoA',
      routingNumber: '266905059',
      accountNumber: 'XXXX0000',
      accountType: 'Checking',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const accountIssue = result.error.issues.find(
      issue => String(issue.path[0]) === 'accountNumber',
    )
    expect(accountIssue?.message).toBe(ContractorBankAccountErrorCodes.INVALID_ACCOUNT_NUMBER)
  })

  it('still requires the account number when a bank account already exists', () => {
    const [schema] = createContractorBankAccountSchema({ existingAccountNumberMask: 'XXXX1207' })
    const result = schema.safeParse({
      name: 'BoA',
      routingNumber: '266905059',
      accountNumber: '',
      accountType: 'Checking',
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const accountIssue = result.error.issues.find(
      issue => String(issue.path[0]) === 'accountNumber',
    )
    expect(accountIssue?.message).toBe(ContractorBankAccountErrorCodes.REQUIRED)
  })
})

describe('useContractorBankAccountForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('prefills name/routing and seeds the account number with the masked token', async () => {
    const { result } = renderHook(
      () => useContractorBankAccountForm({ contractorId: 'contractor-123' }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.status.mode).toBe('create')
    expect(result.current.data.bankAccount?.hiddenAccountNumber).toBe('XXXX1207')
    const { getValues } = result.current.form.hookFormInternals.formMethods
    expect(getValues('name')).toBe('BoA Checking Account')
    // The masked token is seeded so it can be submitted as the keep-existing sentinel.
    expect(getValues('accountNumber')).toBe('XXXX1207')
  })

  it('submits the masked token unchanged to keep the existing account', async () => {
    let createBody: Record<string, unknown> | null = null
    const createResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      createBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(createdBankAccount, { status: 201 })
    })
    server.use(handleCreateContractorBankAccount(createResolver))

    const { result } = renderHook(
      () => useContractorBankAccountForm({ contractorId: 'contractor-123' }),
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

    expect(createResolver).toHaveBeenCalledTimes(1)
    expect(createBody).toMatchObject({
      name: 'BoA Checking Account',
      account_number: 'XXXX1207',
    })
    expect(submitResult).toMatchObject({ mode: 'create' })
  })

  it('creates the bank account with the entered account number on submit', async () => {
    let createBody: Record<string, unknown> | null = null
    const createResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      createBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(createdBankAccount, { status: 201 })
    })
    server.use(handleCreateContractorBankAccount(createResolver))

    const { result } = renderHook(
      () => useContractorBankAccountForm({ contractorId: 'contractor-123' }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      assertReady(result.current)
      result.current.form.hookFormInternals.formMethods.setValue('accountNumber', '123123123')
    })

    let submitResult
    await act(async () => {
      assertReady(result.current)
      submitResult = await result.current.actions.onSubmit()
    })

    expect(createResolver).toHaveBeenCalledTimes(1)
    expect(createBody).toMatchObject({ name: 'BoA Checking Account', account_number: '123123123' })
    expect(submitResult).toMatchObject({ mode: 'create' })
  })

  it('does not submit when validation fails', async () => {
    const createResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(createdBankAccount, { status: 201 }),
    )
    server.use(handleCreateContractorBankAccount(createResolver))

    const { result } = renderHook(
      () => useContractorBankAccountForm({ contractorId: 'contractor-123' }),
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
  })
})
