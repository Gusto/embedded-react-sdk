import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { useBankForm, type UseBankFormResult } from './useBankForm'
import { BankFormErrorCodes, createBankFormSchema } from './useBankFormSchema'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { API_BASE_URL } from '@/test/constants'

type ReadyResult = Extract<UseBankFormResult, { isLoading: false }>

function assertReady(hookResult: UseBankFormResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

describe('createBankFormSchema', () => {
  it('requires name, routingNumber, accountNumber, accountType on submit', () => {
    const [schema] = createBankFormSchema()
    const result = schema.safeParse({
      name: '',
      routingNumber: '',
      accountNumber: '',
      accountType: 'Checking' as const,
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const fields = new Set(result.error.issues.map(issue => String(issue.path[0])))
    expect(fields).toContain('name')
    expect(fields).toContain('routingNumber')
    expect(fields).toContain('accountNumber')
    expect(result.error.issues.find(issue => String(issue.path[0]) === 'name')?.message).toBe(
      BankFormErrorCodes.REQUIRED,
    )
  })

  it('rejects routing numbers that are not 9 digits with INVALID_ROUTING_NUMBER', () => {
    const [schema] = createBankFormSchema()
    const result = schema.safeParse({
      name: 'My Bank',
      routingNumber: '123',
      accountNumber: '123456789',
      accountType: 'Checking' as const,
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const routingIssue = result.error.issues.find(
      issue => String(issue.path[0]) === 'routingNumber',
    )
    expect(routingIssue?.message).toBe(BankFormErrorCodes.INVALID_ROUTING_NUMBER)
  })

  it('rejects non-numeric account numbers with INVALID_ACCOUNT_NUMBER', () => {
    const [schema] = createBankFormSchema()
    const result = schema.safeParse({
      name: 'My Bank',
      routingNumber: '011401533',
      accountNumber: 'abc',
      accountType: 'Checking' as const,
    })
    expect(result.success).toBe(false)
    if (result.success) return
    const accountIssue = result.error.issues.find(
      issue => String(issue.path[0]) === 'accountNumber',
    )
    expect(accountIssue?.message).toBe(BankFormErrorCodes.INVALID_ACCOUNT_NUMBER)
  })

  it('accepts a valid payload', () => {
    const [schema] = createBankFormSchema()
    const result = schema.safeParse({
      name: 'Main Account',
      routingNumber: '011401533',
      accountNumber: '123456789',
      accountType: 'Savings' as const,
    })
    expect(result.success).toBe(true)
  })

  it('metadata reports every field as required by default', () => {
    const [, { getFieldsMetadata }] = createBankFormSchema()
    const metadata = getFieldsMetadata()
    expect(metadata.name.isRequired).toBe(true)
    expect(metadata.routingNumber.isRequired).toBe(true)
    expect(metadata.accountNumber.isRequired).toBe(true)
    expect(metadata.accountType.isRequired).toBe(true)
  })
})

describe('useBankForm', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  it('starts in create mode with no entity data', async () => {
    const { result } = renderHook(() => useBankForm({ employeeId: 'employee-123' }), {
      wrapper: GustoTestProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    assertReady(result.current)
    expect(result.current.status.mode).toBe('create')
    expect(result.current.status.isPending).toBe(false)
    expect(result.current.form.Fields.Name).toBeDefined()
    expect(result.current.form.Fields.RoutingNumber).toBeDefined()
    expect(result.current.form.Fields.AccountNumber).toBeDefined()
    expect(result.current.form.Fields.AccountType).toBeDefined()
  })

  it('POSTs /v1/employees/:id/bank_accounts and returns the created bank account', async () => {
    let createBody: Record<string, unknown> | null = null
    const createResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      createBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(
        {
          uuid: 'new-account-uuid',
          employee_uuid: 'employee-123',
          account_type: createBody.account_type as string,
          name: createBody.name as string,
          routing_number: createBody.routing_number as string,
          hidden_account_number: 'XXXX6789',
        },
        { status: 201 },
      )
    })

    server.use(http.post(`${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`, createResolver))

    const { result } = renderHook(
      () =>
        useBankForm({
          employeeId: 'employee-123',
          defaultValues: {
            name: 'My Bank',
            routingNumber: '011401533',
            accountNumber: '123456789',
            accountType: 'Savings',
          },
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

    expect(createResolver).toHaveBeenCalledTimes(1)
    expect(createBody).toMatchObject({
      name: 'My Bank',
      routing_number: '011401533',
      account_number: '123456789',
      account_type: 'Savings',
    })
    expect(submitResult).toMatchObject({
      mode: 'create',
      data: { uuid: 'new-account-uuid' },
    })
  })

  it('does not call the mutation when validation fails', async () => {
    const createResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.json({}, { status: 201 }))
    server.use(http.post(`${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`, createResolver))

    const { result } = renderHook(() => useBankForm({ employeeId: 'employee-123' }), {
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

    expect(createResolver).not.toHaveBeenCalled()
    expect(submitResult).toBeUndefined()
  })

  it('routes the create call to the override employeeId when supplied via submit options', async () => {
    let capturedPath: string | null = null
    const createResolver = vi.fn<HttpResponseResolver>(({ request }) => {
      capturedPath = new URL(request.url).pathname
      return HttpResponse.json(
        {
          uuid: 'new-account-uuid',
          employee_uuid: 'override-employee',
          account_type: 'Checking',
          name: 'A',
          routing_number: '011401533',
          hidden_account_number: 'XXXX9999',
        },
        { status: 201 },
      )
    })

    server.use(http.post(`${API_BASE_URL}/v1/employees/:employee_id/bank_accounts`, createResolver))

    const { result } = renderHook(
      () =>
        useBankForm({
          defaultValues: {
            name: 'A',
            routingNumber: '011401533',
            accountNumber: '123456789',
            accountType: 'Checking',
          },
        }),
      { wrapper: GustoTestProvider },
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      assertReady(result.current)
      await result.current.actions.onSubmit({ employeeId: 'override-employee' })
    })

    expect(capturedPath).toBe('/v1/employees/override-employee/bank_accounts')
  })
})
