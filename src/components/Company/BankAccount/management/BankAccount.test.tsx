import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { BankAccount } from './BankAccount'
import { server } from '@/test/mocks/server'
import {
  handleGetCompanyBankAccounts,
  handlePutCompanyBankAccountVerify,
} from '@/test/mocks/apis/company_bank_accounts'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const COMPANY_ID = 'company-123'
const unstableFeatures = { companySettingsDashboard: true }

const readyForVerification = {
  uuid: '1263eae5-4411-48d9-bd6d-18ed93082e65',
  company_uuid: COMPANY_ID,
  account_type: 'Checking',
  routing_number: '851070439',
  hidden_account_number: 'XXXX4087',
  verification_status: 'ready_for_verification',
  verification_type: 'bank_deposits',
  name: 'Employer Funding Account',
}

async function openEditor(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Manage bank account' })).toBeEnabled()
  })
  await user.click(screen.getByRole('button', { name: 'Manage bank account' }))
}

describe('CompanyManagement.BankAccount', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      handleGetCompanyBankAccounts(() => HttpResponse.json([readyForVerification])),
      handlePutCompanyBankAccountVerify(() =>
        HttpResponse.json({ ...readyForVerification, verification_status: 'verified' }),
      ),
    )
  })

  it('renders the SDK error card instead of the block without the companySettingsDashboard flag', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithProviders(<BankAccount companyId={COMPANY_ID} onEvent={onEvent} />)

    expect(await screen.findByTestId('internal-error-card')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Manage bank account' })).toBeNull()

    consoleErrorSpy.mockRestore()
  })

  it('opens on the card and swaps to the account view without an onboarding Continue', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BankAccount companyId={COMPANY_ID} onEvent={onEvent} />, {
      unstableFeatures,
    })

    await openEditor(user)

    // Change and Verify both survive; only the onboarding Continue is dropped.
    expect(await screen.findByRole('button', { name: /Change bank account/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Verify bank account/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue' })).toBeNull()
  })

  it('returns the verification screen to the account view on cancel, not to the card', async () => {
    // The sub-flow transitions on a bare CANCEL to return the micro-deposit form to the
    // account view, and Flow re-emits that upward. If the block's machine declared its own
    // CANCEL transition, backing out of verification would close the whole block.
    const user = userEvent.setup()
    renderWithProviders(<BankAccount companyId={COMPANY_ID} onEvent={onEvent} />, {
      unstableFeatures,
    })

    await openEditor(user)
    await user.click(await screen.findByRole('button', { name: /Verify bank account/i }))
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))

    // Back on the account view, still inside the block.
    expect(await screen.findByRole('button', { name: /Change bank account/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Manage bank account' })).toBeNull()
  })

  it('returns without an alert when nothing was saved during the visit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BankAccount companyId={COMPANY_ID} onEvent={onEvent} />, {
      unstableFeatures,
    })

    await openEditor(user)
    await user.click(await screen.findByRole('button', { name: 'Back to bank account' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage bank account' })).toBeInTheDocument()
    })
    expect(screen.queryByText('Bank account updated.')).toBeNull()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_MANAGEMENT_BANK_ACCOUNT_EDIT_CANCELLED,
      undefined,
    )
  })
})
