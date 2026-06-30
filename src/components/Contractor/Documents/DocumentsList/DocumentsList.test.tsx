import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { DocumentsList } from './DocumentsList'
import { server } from '@/test/mocks/server'
import {
  handleGetContractorDocuments,
  W9_DOCUMENT_UUID,
} from '@/test/mocks/apis/contractor_documents'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { contractorEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Contractor DocumentsList', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  const contractorId = 'contractor-123'

  it('renders the documents with their signing status', async () => {
    renderWithProviders(<DocumentsList contractorId={contractorId} onEvent={vi.fn()} />)

    await screen.findByText('Documents')
    expect(screen.getByRole('button', { name: 'Sign document' })).toBeInTheDocument()
    expect(screen.getByText('Complete')).toBeInTheDocument()
  })

  it('keeps Continue disabled while a document still needs signing', async () => {
    renderWithProviders(<DocumentsList contractorId={contractorId} onEvent={vi.fn()} />)

    await screen.findByText('Documents')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('emits the view event with the document identity when Sign is selected', async () => {
    const onEvent = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<DocumentsList contractorId={contractorId} onEvent={onEvent} />)

    await screen.findByText('Documents')
    await user.click(screen.getByRole('button', { name: 'Sign document' }))

    expect(onEvent).toHaveBeenCalledWith(contractorEvents.CONTRACTOR_VIEW_DOCUMENT_TO_SIGN, {
      uuid: W9_DOCUMENT_UUID,
      title: 'W-9',
    })
  })

  it('enables Continue and emits done once every document is signed', async () => {
    server.use(
      handleGetContractorDocuments(() =>
        HttpResponse.json([
          {
            uuid: W9_DOCUMENT_UUID,
            title: 'W-9',
            name: 'taxpayer_identification_form_w_9',
            requires_signing: false,
            signed_at: '2025-01-01T00:00:00Z',
          },
        ]),
      ),
    )
    const onEvent = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<DocumentsList contractorId={contractorId} onEvent={onEvent} />)

    await screen.findByText('Documents')
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    await waitFor(() => {
      expect(continueButton).toBeEnabled()
    })

    await user.click(continueButton)
    expect(onEvent).toHaveBeenCalledWith(contractorEvents.CONTRACTOR_DOCUMENTS_DONE)
  })
})
