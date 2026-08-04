import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { HistoricalPaymentAmounts } from './HistoricalPaymentAmounts'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { handleGetContractorsList } from '@/test/mocks/apis/contractors'
import { componentEvents } from '@/shared/constants'

const COMPANY_ID = 'company-123'
const CHECK_DATE = '2026-07-15'

const hourlyContractor = {
  uuid: 'contractor-1',
  company_uuid: COMPANY_ID,
  wage_type: 'Hourly',
  type: 'Individual',
  first_name: 'Ada',
  last_name: 'Lovelace',
  is_active: true,
  onboarding_status: 'onboarding_completed',
  hourly_rate: '50.00',
  payment_method: 'Direct Deposit',
}

const unselectedContractor = {
  uuid: 'contractor-2',
  company_uuid: COMPANY_ID,
  wage_type: 'Fixed',
  type: 'Individual',
  first_name: 'Grace',
  last_name: 'Hopper',
  is_active: true,
  onboarding_status: 'onboarding_completed',
  payment_method: 'Check',
}

const renderScreen = (contractorIds: string[], onEvent = vi.fn()) => {
  server.use(
    handleGetContractorsList(() =>
      HttpResponse.json([hourlyContractor, unselectedContractor], {
        headers: { 'x-total-pages': '1', 'x-total-count': '2' },
      }),
    ),
  )
  renderWithProviders(
    <HistoricalPaymentAmounts
      companyId={COMPANY_ID}
      contractorIds={contractorIds}
      checkDate={CHECK_DATE}
      onEvent={onEvent}
    />,
  )
  return { onEvent }
}

describe('HistoricalPaymentAmounts', () => {
  it('renders only the selected contractors, fixed to the Historical Payment method', async () => {
    renderScreen(['contractor-1'])

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })
    expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument()
    expect(screen.getByText('Historical Payment')).toBeInTheDocument()
  })

  it('renders its own empty state when no selected contractors remain', async () => {
    renderScreen([])

    await waitFor(() => {
      expect(screen.getByText('No contractors selected')).toBeInTheDocument()
    })
  })

  it('disables Continue until a payment total is greater than zero', async () => {
    const user = userEvent.setup()
    renderScreen(['contractor-1'])

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Edit contractor payment' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit contractor payment' }))
    await user.type(screen.getByLabelText('Hours'), '10')
    await user.click(screen.getByRole('button', { name: 'Done' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    })
  })

  it('hides the payment method picker in the edit modal', async () => {
    const user = userEvent.setup()
    renderScreen(['contractor-1'])

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Edit contractor payment' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit contractor payment' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Hours')).toBeInTheDocument()
    })
    expect(screen.queryByText('Payment Method')).not.toBeInTheDocument()
  })

  it('emits amountsSubmitted with the touched contractor payments and check date', async () => {
    const user = userEvent.setup()
    const { onEvent } = renderScreen(['contractor-1'])

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Edit contractor payment' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit contractor payment' }))
    await user.type(screen.getByLabelText('Hours'), '10')
    await user.click(screen.getByRole('button', { name: 'Done' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_AMOUNTS_SUBMITTED,
      {
        checkDate: CHECK_DATE,
        contractorPayments: [
          expect.objectContaining({
            contractorUuid: 'contractor-1',
            hours: '10',
            paymentMethod: 'Historical Payment',
          }),
        ],
      },
    )
  })
})
