import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { PaymentMethodCard } from './PaymentMethodCard'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import {
  handleGetContractorPaymentMethod,
  handleUpdateContractorPaymentMethod,
} from '@/test/mocks/apis/contractor_payment_method'
import { componentEvents } from '@/shared/constants'

describe('PaymentMethodCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  it('renders the bank account table when the contractor is on Direct Deposit', async () => {
    renderWithProviders(<PaymentMethodCard contractorId="contractor-123" onEvent={onEvent} />)

    expect(await screen.findByText('BoA Checking Account')).toBeInTheDocument()
    expect(screen.getByText('XXXX1207')).toBeInTheDocument()
    expect(screen.getByText('266905059')).toBeInTheDocument()
  })

  it('renders the Check summary and Add bank account button when the contractor is on Check', async () => {
    server.use(
      handleGetContractorPaymentMethod(() =>
        HttpResponse.json({ version: 'v1', type: 'Check', splits: [] }),
      ),
    )

    renderWithProviders(<PaymentMethodCard contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add bank account' })).toBeEnabled()
    })
    expect(screen.getByText('Check')).toBeInTheDocument()
  })

  it('fires CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_CARD_ADD_REQUESTED when Add bank account is clicked', async () => {
    server.use(
      handleGetContractorPaymentMethod(() =>
        HttpResponse.json({ version: 'v1', type: 'Check', splits: [] }),
      ),
    )
    const user = userEvent.setup()
    renderWithProviders(<PaymentMethodCard contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add bank account' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Add bank account' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_CARD_ADD_REQUESTED,
      { contractorId: 'contractor-123' },
    )
  })

  it('fires CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_CARD_EDIT_REQUESTED when Edit is chosen from the row menu', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaymentMethodCard contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByText('BoA Checking Account')
    await user.click(screen.getByRole('button', { name: 'Bank account actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_CARD_EDIT_REQUESTED,
      { contractorId: 'contractor-123' },
    )
  })

  it('removes the bank account and fires CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_CARD_REMOVED after confirming', async () => {
    const updateResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({ version: 'v2', type: 'Check', splits: [] }),
    )
    server.use(handleUpdateContractorPaymentMethod(updateResolver))

    const user = userEvent.setup()
    renderWithProviders(<PaymentMethodCard contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByText('BoA Checking Account')
    await user.click(screen.getByRole('button', { name: 'Bank account actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Remove account' }))

    await user.click(await screen.findByRole('button', { name: 'Remove' }))

    await waitFor(() => {
      expect(updateResolver).toHaveBeenCalledTimes(1)
    })
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_CARD_REMOVED,
      expect.objectContaining({ type: 'Check' }),
    )
  })
})
