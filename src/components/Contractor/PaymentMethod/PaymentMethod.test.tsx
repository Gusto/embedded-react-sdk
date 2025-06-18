import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaymentMethod } from './PaymentMethod'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

describe('Contractor PaymentMethod', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    renderWithProviders(<PaymentMethod contractorId="contractor-123" onEvent={onEvent} />)
  })

  it('renders with mock payment method information', async () => {
    await waitFor(() => {
      expect(screen.getByLabelText('Direct deposit')).toBeInTheDocument()

      const nameField = screen.getByLabelText('Account nickname')
      expect(nameField).toHaveValue('BoA Checking Account')
    })
  })

  it('fails to submit with touched bank information and incorrect account number', async () => {
    const nameField = await screen.findByLabelText('Routing number')
    await user.type(nameField, '123456789')

    const submitButton = screen.getByRole('button', { name: 'Continue' })
    await user.click(submitButton)

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
})
