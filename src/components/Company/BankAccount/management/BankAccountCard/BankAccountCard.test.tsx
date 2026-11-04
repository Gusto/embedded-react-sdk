import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { BankAccountCard } from './BankAccountCard'
import { server } from '@/test/mocks/server'
import { handleGetCompanyBankAccounts } from '@/test/mocks/apis/company_bank_accounts'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const fixtureBankAccount = {
  uuid: '1263eae5-4411-48d9-bd6d-18ed93082e65',
  company_uuid: 'company-123',
  account_type: 'Checking',
  routing_number: '851070439',
  hidden_account_number: 'XXXX4087',
  verification_status: 'verified',
  verification_type: 'bank_deposits',
  name: 'Employer Funding Account',
}

describe('BankAccountCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(handleGetCompanyBankAccounts(() => HttpResponse.json([fixtureBankAccount])))
  })

  it('renders the masked account details and verification status once loaded', async () => {
    renderWithProviders(<BankAccountCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    expect(screen.getByRole('heading', { name: 'Bank account' })).toBeInTheDocument()
    expect(screen.getByText('Employer Funding Account')).toBeInTheDocument()
    expect(screen.getByText('XXXX4087')).toBeInTheDocument()
    expect(screen.getByText('851070439')).toBeInTheDocument()
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('emits the edit-requested event with the company id when Manage is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BankAccountCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Manage' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_MANAGEMENT_BANK_ACCOUNT_EDIT_REQUESTED,
      { companyId: 'company-123' },
    )
  })

  it('renders the empty state with an Add CTA when no account is on file', async () => {
    server.use(handleGetCompanyBankAccounts(() => HttpResponse.json([])))

    renderWithProviders(<BankAccountCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('No bank account yet')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Add bank account' })).toBeInTheDocument()
  })

  it('reflects a pending micro-deposit verification', async () => {
    server.use(
      handleGetCompanyBankAccounts(() =>
        HttpResponse.json([{ ...fixtureBankAccount, verification_status: 'awaiting_deposits' }]),
      ),
    )

    renderWithProviders(<BankAccountCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Verification pending')).toBeInTheDocument()
    })
  })
})
