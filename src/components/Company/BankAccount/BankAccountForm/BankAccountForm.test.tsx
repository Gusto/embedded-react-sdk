import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BankAccountForm } from './BankAccountForm'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { companyEvents } from '@/shared/constants'
import { server } from '@/test/mocks/server'
import { postCompanyBankAccount } from '@/test/mocks/apis/company_bank_accounts'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Company BankAccounts Form', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    setupApiTestMocks()
    server.use(postCompanyBankAccount)
  })

  it('renders empty form', async () => {
    renderWithProviders(<BankAccountForm companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByTestId('bank-account-submit')).toBeInTheDocument()
    })
  })

  it('fires submission with correct payload', async () => {
    renderWithProviders(<BankAccountForm companyId="company-123" onEvent={onEvent} />)

    const submitButton = await screen.findByTestId('bank-account-submit')
    expect(submitButton).toBeInTheDocument()
    await user.type(screen.getByLabelText('Routing number'), '123123123')
    await user.type(screen.getByLabelText('Account number'), '123456789')
    await user.click(submitButton)

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        companyEvents.COMPANY_BANK_ACCOUNT_CREATED,
        expect.anything(),
      )
    })
  })

  it('shows cancel button when editing and calls the onEvent with the correct event', async () => {
    renderWithProviders(<BankAccountForm companyId="company-123" onEvent={onEvent} isEditing />)

    const cancelButton = await screen.findByText('Cancel')
    expect(cancelButton).toBeInTheDocument()
    await user.click(cancelButton)
    expect(onEvent).toHaveBeenCalledWith(companyEvents.COMPANY_BANK_ACCOUNT_CANCEL)
  })
})
