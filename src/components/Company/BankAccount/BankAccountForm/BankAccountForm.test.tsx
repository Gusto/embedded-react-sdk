import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BankAccountForm } from './BankAccountForm'
import { GustoTestApiProvider } from '@/test/GustoTestApiProvider'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { companyEvents } from '@/shared/constants'
import { server } from '@/test/mocks/server'
import { postCompanyBankAccount } from '@/test/mocks/apis/company_bank_accounts'

describe('Company BankAccounts Form', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  beforeEach(() => {
    setupApiTestMocks()
    server.use(postCompanyBankAccount)
    render(
      <GustoTestApiProvider>
        <BankAccountForm companyId="company-123" onEvent={onEvent} />
      </GustoTestApiProvider>,
    )
  })

  it('renders empty form', async () => {
    await waitFor(() => {
      expect(screen.getByTestId('bank-account-submit')).toBeInTheDocument()
    })
  })

  it('fires submission with correct payload', async () => {
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
})
