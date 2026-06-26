import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContractorDocumentSigner } from './ContractorDocumentSigner'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('ContractorDocumentSigner orchestration', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  const contractorId = 'contractor-123'

  it('opens the signature form for the chosen document and returns on Back', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContractorDocumentSigner contractorId={contractorId} onEvent={vi.fn()} />)

    await screen.findByText('Documents')
    await user.click(screen.getByRole('button', { name: 'Sign document' }))

    await screen.findByRole('button', { name: 'Sign' })
    await user.click(screen.getByRole('button', { name: 'Back' }))

    await screen.findByRole('button', { name: 'Continue' })
  })

  it('returns to the list after a document is signed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContractorDocumentSigner contractorId={contractorId} onEvent={vi.fn()} />)

    await screen.findByText('Documents')
    await user.click(screen.getByRole('button', { name: 'Sign document' }))

    await screen.findByRole('button', { name: 'Sign' })
    await user.click(screen.getByRole('radio', { name: 'C-Corporation' }))
    await user.type(screen.getByLabelText('Signature'), 'Klay Thompson')
    await user.click(
      screen.getByRole('checkbox', { name: 'I agree to electronically sign this form.' }),
    )
    await user.click(screen.getByRole('button', { name: 'Sign' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    })
  })
})
