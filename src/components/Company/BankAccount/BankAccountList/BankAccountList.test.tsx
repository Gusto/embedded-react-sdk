import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { BankAccountList } from './BankAccountList'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import {
  getCompanyBankAccounts,
  getEmptyCompanyBankAccounts,
  handleGetCompanyBankAccounts,
} from '@/test/mocks/apis/company_bank_accounts'
import { server } from '@/test/mocks/server'
import { companyEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const mockAccount = {
  uuid: '1263eae5-4411-48d9-bd6d-18ed93082e65',
  company_uuid: 'e2c4c0ce-2986-48b9-86cf-ec27f6ed9a36',
  account_type: 'Checking',
  routing_number: '851070439',
  hidden_account_number: 'XXXX4087',
  verification_status: 'awaiting_deposits',
  verification_type: 'bank_deposits',
  name: 'Employer Funding Account',
}
describe('BankAccounts', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  beforeEach(() => {
    setupApiTestMocks()
    server.use(getCompanyBankAccounts)
    renderWithProviders(<BankAccountList companyId="company-123" onEvent={onEvent} />)
  })

  it('renders empty list of bank accounts', async () => {
    server.use(getEmptyCompanyBankAccounts)
    await waitFor(() => {
      expect(screen.getByTestId('internal-error-card')).toBeInTheDocument()
    })
  })
  it('renders a list of bank accounts', async () => {
    await waitFor(() => {
      expect(screen.getByText('851070439')).toBeInTheDocument()
    })
  })

  it('renders verification pending alert', async () => {
    server.use(handleGetCompanyBankAccounts(() => HttpResponse.json([mockAccount])))
    await waitFor(async () => {
      expect(screen.getByText('Verification pending')).toBeInTheDocument()
      const verifyButton = await screen.findByRole('button', { name: 'Verify bank account' })
      expect(verifyButton).toBeDisabled()
    })
  })
  it('renders ready for verification alert and passes verify event on cta click', async () => {
    server.use(
      handleGetCompanyBankAccounts(() =>
        HttpResponse.json([{ ...mockAccount, verification_status: 'ready_for_verification' }]),
      ),
    )
    await waitFor(async () => {
      expect(screen.getByText('Verify your bank account')).toBeInTheDocument()
      const verifyButton = await screen.findByRole('button', { name: 'Verify bank account' })
      expect(verifyButton).not.toBeDisabled()
      await user.click(verifyButton)
      expect(onEvent).toHaveBeenCalledWith(
        companyEvents.COMPANY_BANK_ACCOUNT_VERIFY,
        expect.anything(),
      )
    })
  })

  it('fires continue event when "continue" is clicked', async () => {
    const continueButton = await screen.findByRole('button', { name: 'Continue' })
    await user.click(continueButton)

    expect(onEvent).toHaveBeenCalledWith(companyEvents.COMPANY_BANK_ACCOUNT_DONE)
  })
  it('fires change bank account event when "change bank account" is clicked', async () => {
    const changeButton = await screen.findByRole('button', { name: 'Change bank account' })
    await user.click(changeButton)

    expect(onEvent).toHaveBeenCalledWith(companyEvents.COMPANY_BANK_ACCOUNT_CHANGE)
  })
})
