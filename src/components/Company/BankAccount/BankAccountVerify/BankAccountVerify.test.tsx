import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BankAccountVerify } from './BankAccountVerify'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { companyEvents, componentEvents } from '@/shared/constants'
import { server } from '@/test/mocks/server'
import { putCompanyBankAccountVerify } from '@/test/mocks/apis/company_bank_accounts'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Company BankAccounts Verify', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  beforeEach(() => {
    setupApiTestMocks()
    server.use(putCompanyBankAccountVerify)
    renderWithProviders(
      <BankAccountVerify companyId="company-123" bankAccountId="bank-123" onEvent={onEvent} />,
    )
  })

  it('renders empty form', async () => {
    await waitFor(() => {
      expect(screen.getByTestId('bank-account-verify-submit')).toBeInTheDocument()
    })
  })
  it('fires cancel event', async () => {
    const cancelButton = screen.getByTestId('bank-account-verify-cancel')
    expect(cancelButton).toBeInTheDocument()
    await user.click(cancelButton)
    expect(onEvent).toHaveBeenCalledWith(componentEvents.CANCEL)
  })

  it('fires submission with correct payload', async () => {
    const submitButton = await screen.findByTestId('bank-account-verify-submit')
    expect(submitButton).toBeInTheDocument()
    await user.type(screen.getByLabelText('Test deposit #1'), '0.61')
    await user.type(screen.getByLabelText('Test deposit #2'), '0.78')
    await user.click(submitButton)

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        companyEvents.COMPANY_BANK_ACCOUNT_VERIFIED,
        expect.anything(),
      )
    })
  })
})
