import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BankAccount } from './BankAccount'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { getCompanyBankAccounts } from '@/test/mocks/apis/company_bank_accounts'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { companyEvents } from '@/shared/constants'

describe('BankAccount', () => {
  beforeEach(() => {
    setupApiTestMocks()
    server.use(getCompanyBankAccounts)
  })

  it('remains editable after the "done" event instead of getting stuck on the list view', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()

    renderWithProviders(<BankAccount companyId="company-123" onEvent={onEvent} />)

    const continueButton = await screen.findByRole('button', { name: 'Continue' })
    await user.click(continueButton)
    expect(onEvent).toHaveBeenCalledWith(companyEvents.COMPANY_BANK_ACCOUNT_DONE, undefined)

    const changeButton = await screen.findByRole('button', { name: 'Change bank account' })
    await user.click(changeButton)

    await waitFor(() => {
      expect(screen.getByLabelText('Routing number')).toBeInTheDocument()
    })
  })
})
