import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { PaymentMethod } from './PaymentMethod'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import {
  handleGetContractorPaymentMethod,
  handleCreateContractorBankAccount,
} from '@/test/mocks/apis/contractor_payment_method'
import { componentEvents } from '@/shared/constants'

describe('PaymentMethod (management block)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    server.use(
      handleGetContractorPaymentMethod(() =>
        HttpResponse.json({ version: 'v1', type: 'Check', splits: [] }),
      ),
    )
  })

  it('renders the card initially with the Payment title and Add bank account button', async () => {
    renderWithProviders(<PaymentMethod contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add bank account' })).toBeEnabled()
    })

    expect(screen.getByText('Payment')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull()
  })

  it('transitions card → editPaymentMethod when Add bank account is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaymentMethod contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add bank account' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Add bank account' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_CARD_ADD_REQUESTED,
      { contractorId: 'contractor-123' },
    )
  })

  it('returns to the card with the bankAccountAdded alert after a successful save', async () => {
    const createdAccount = {
      uuid: 'new-bank-uuid',
      contractor_uuid: 'contractor-123',
      name: 'New Bank',
      routing_number: '266905059',
      hidden_account_number: 'XXXX3123',
      account_type: 'Checking',
    }
    server.use(
      handleCreateContractorBankAccount(
        vi.fn<HttpResponseResolver>(() => HttpResponse.json(createdAccount, { status: 201 })),
      ),
    )

    const user = userEvent.setup()
    renderWithProviders(<PaymentMethod contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add bank account' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Add bank account' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(
      () => {
        expect(screen.getByText('Bank account added')).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_SUBMITTED,
      expect.any(Object),
    )
  })
})
