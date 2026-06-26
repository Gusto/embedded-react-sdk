import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { PaymentMethod } from './PaymentMethod'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import {
  handleCreateContractorBankAccount,
  handleUpdateContractorPaymentMethod,
} from '@/test/mocks/apis/contractor_payment_method'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

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

describe('Contractor PaymentMethod', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    renderWithProviders(<PaymentMethod contractorId="contractor-123" onEvent={onEvent} />)
  })

  it('renders with mock payment method information', async () => {
    const directDepositRadio = await screen.findByLabelText('Direct deposit')
    expect(directDepositRadio).toBeInTheDocument()

    const nameField = await screen.findByLabelText('Account nickname')
    expect(nameField).toHaveValue('BoA Checking Account')
  })

  it('shows bank account fields when Direct Deposit is selected', async () => {
    expect(await screen.findByLabelText('Account nickname')).toBeInTheDocument()
    expect(screen.getByLabelText('Routing number')).toBeInTheDocument()
    expect(screen.getByLabelText('Account number')).toBeInTheDocument()
    expect(screen.getByLabelText('Checking')).toBeInTheDocument()
    expect(screen.getByLabelText('Savings')).toBeInTheDocument()
  })

  it('hides bank account fields when Check is selected', async () => {
    const checkRadio = await screen.findByLabelText('Check')
    await user.click(checkRadio)

    await waitFor(() => {
      expect(screen.queryByLabelText('Account nickname')).not.toBeInTheDocument()
    })
    expect(screen.queryByLabelText('Routing number')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Account number')).not.toBeInTheDocument()
  })

  it('fails to submit with touched bank information and incorrect account number', async () => {
    const routingField = await screen.findByLabelText('Routing number')
    await user.type(routingField, '123456789')

    const submitButton = screen.getByRole('button', { name: 'Continue' })
    await user.click(submitButton)

    expect(onEvent).not.toHaveBeenCalled()
  })

  it('blocks submit when the account nickname is cleared', async () => {
    const nameField = await screen.findByLabelText('Account nickname')
    await user.clear(nameField)

    const submitButton = screen.getByRole('button', { name: 'Continue' })
    await user.click(submitButton)

    await screen.findByText('Account nickname is required')
    expect(onEvent).not.toHaveBeenCalled()
  })

  it('blocks submit when the routing number is invalid', async () => {
    const routingField = await screen.findByLabelText('Routing number')
    await user.clear(routingField)
    await user.type(routingField, '123')

    const submitButton = screen.getByRole('button', { name: 'Continue' })
    await user.click(submitButton)

    await screen.findByText('Routing number is required (9-digits)')
    expect(onEvent).not.toHaveBeenCalled()
  })

  it('submits with correct bank account information', async () => {
    const field = await screen.findByLabelText('Account number')
    await user.clear(field)
    await user.type(field, '123123123')

    const submitButton = screen.getByRole('button', { name: 'Continue' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.CONTRACTOR_PAYMENT_METHOD_UPDATED,
        expect.any(Object),
      )
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.CONTRACTOR_BANK_ACCOUNT_CREATED,
        expect.any(Object),
      )
      expect(onEvent).toHaveBeenCalledWith(componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE)
    })
  })

  it('submits a Direct Deposit unchanged without re-validating the masked account number', async () => {
    let createBody: Record<string, unknown> | null = null
    const createResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      createBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json(createdBankAccount, { status: 201 })
    })
    const updateResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(updatedPaymentMethod),
    )
    server.use(
      handleCreateContractorBankAccount(createResolver),
      handleUpdateContractorPaymentMethod(updateResolver),
    )

    await screen.findByLabelText('Account nickname')
    const submitButton = screen.getByRole('button', { name: 'Continue' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE)
    })
    // The unchanged masked account number passes through without a format error
    // because the dirty-check skips re-validating it.
    expect(createResolver).toHaveBeenCalledTimes(1)
    expect(updateResolver).toHaveBeenCalledTimes(1)
    expect(createBody).toMatchObject({ name: 'BoA Checking Account' })
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_BANK_ACCOUNT_CREATED,
      expect.any(Object),
    )
  })

  it('submits Check without creating a bank account', async () => {
    let updateBody: Record<string, unknown> | null = null
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

    const checkRadio = await screen.findByLabelText('Check')
    await user.click(checkRadio)

    const submitButton = screen.getByRole('button', { name: 'Continue' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(componentEvents.CONTRACTOR_PAYMENT_METHOD_DONE)
    })
    expect(createResolver).not.toHaveBeenCalled()
    expect(updateResolver).toHaveBeenCalledTimes(1)
    expect(updateBody).toMatchObject({ type: 'Check' })
    expect(onEvent).not.toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_BANK_ACCOUNT_CREATED,
      expect.anything(),
    )
  })

  it('creates the bank account before updating the payment method', async () => {
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

    const field = await screen.findByLabelText('Account number')
    await user.clear(field)
    await user.type(field, '123123123')

    const submitButton = screen.getByRole('button', { name: 'Continue' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(updateResolver).toHaveBeenCalledTimes(1)
    })
    expect(createResolver).toHaveBeenCalledTimes(1)
    expect(createResolver.mock.invocationCallOrder[0]!).toBeLessThan(
      updateResolver.mock.invocationCallOrder[0]!,
    )
  })
})
