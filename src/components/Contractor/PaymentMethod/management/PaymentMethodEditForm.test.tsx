import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { PaymentMethodEditForm } from './PaymentMethodEditForm'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleCreateContractorBankAccount } from '@/test/mocks/apis/contractor_payment_method'
import { componentEvents } from '@/shared/constants'

describe('PaymentMethodEditForm', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('pre-fills fields from the loaded bank account', async () => {
    renderWithProviders(<PaymentMethodEditForm contractorId="contractor-123" onEvent={onEvent} />)

    expect(await screen.findByDisplayValue('BoA Checking Account')).toBeInTheDocument()
    expect(screen.getByDisplayValue('266905059')).toBeInTheDocument()
    expect(screen.getByDisplayValue('XXXX1207')).toBeInTheDocument()
  })

  it('blocks submission when the account nickname is cleared', async () => {
    const createResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({ uuid: 'new', name: 'x', account_type: 'Checking' }, { status: 201 }),
    )
    server.use(handleCreateContractorBankAccount(createResolver))

    const user = userEvent.setup()
    renderWithProviders(<PaymentMethodEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByDisplayValue('BoA Checking Account')
    await user.clear(screen.getByLabelText('Account nickname'))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText('Account nickname is required')).toBeInTheDocument()
    })
    expect(createResolver).not.toHaveBeenCalled()
  })

  it('saves successfully and fires CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_SUBMITTED', async () => {
    const createdAccount = {
      uuid: 'new-bank-uuid',
      contractor_uuid: 'contractor-123',
      name: 'New Nickname',
      routing_number: '266905059',
      hidden_account_number: 'XXXX1207',
      account_type: 'Checking',
    }
    const createResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json(createdAccount, { status: 201 }),
    )
    server.use(handleCreateContractorBankAccount(createResolver))

    const user = userEvent.setup()
    renderWithProviders(<PaymentMethodEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByDisplayValue('BoA Checking Account')
    await user.clear(screen.getByLabelText('Account nickname'))
    await user.type(screen.getByLabelText('Account nickname'), 'New Nickname')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(createResolver).toHaveBeenCalledTimes(1)
    })
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_SUBMITTED,
      expect.objectContaining({ name: 'New Nickname' }),
    )
  })

  it('fires CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_CANCELLED when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaymentMethodEditForm contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByDisplayValue('BoA Checking Account')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_CANCELLED,
    )
  })
})
