import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { DocumentSigner } from './DocumentSigner'
import { server } from '@/test/mocks/server'
import {
  handleGetContractorDocuments,
  handleSignContractorDocument,
  W9_DOCUMENT_UUID,
} from '@/test/mocks/apis/contractor_documents'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { contractorEvents, componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('Contractor DocumentSigner', () => {
  beforeEach(() => {
    setupApiTestMocks()
  })

  const contractorId = 'contractor-123'

  function renderSigner(onEvent = vi.fn()) {
    renderWithProviders(<DocumentSigner contractorId={contractorId} onEvent={onEvent} />)
    return onEvent
  }

  async function goToSignatureForm(user: ReturnType<typeof userEvent.setup>) {
    await screen.findByText('Documents')
    await user.click(screen.getByRole('button', { name: 'Sign document' }))
    await screen.findByRole('button', { name: 'Sign' })
  }

  it('starts on the document list', async () => {
    renderSigner()

    await screen.findByText('Documents')
    expect(screen.getByRole('button', { name: 'Sign document' })).toBeInTheDocument()
  })

  it('routes to the signature form when a document is selected', async () => {
    const user = userEvent.setup()
    renderSigner()

    await goToSignatureForm(user)

    expect(screen.getByRole('button', { name: 'Sign' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
  })

  it('returns to the document list when the signature form is cancelled', async () => {
    const user = userEvent.setup()
    renderSigner()

    await goToSignatureForm(user)
    await user.click(screen.getByRole('button', { name: 'Back' }))

    await screen.findByText('Documents')
    expect(screen.getByRole('button', { name: 'Sign document' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
  })

  it('signs the document and returns to the list, forwarding the signed event', async () => {
    const signResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({
        uuid: W9_DOCUMENT_UUID,
        title: 'W-9',
        requires_signing: false,
        signed_at: '2025-06-26T00:00:00Z',
      }),
    )
    server.use(handleSignContractorDocument(signResolver))

    const user = userEvent.setup()
    const onEvent = renderSigner()

    await goToSignatureForm(user)
    await user.click(screen.getByRole('radio', { name: 'C-Corporation' }))
    await user.type(screen.getByLabelText('Signature'), 'Klay Thompson')
    await user.click(
      screen.getByRole('checkbox', { name: 'I agree to electronically sign this form.' }),
    )
    await user.click(screen.getByRole('button', { name: 'Sign' }))

    await waitFor(() => {
      expect(signResolver).toHaveBeenCalledTimes(1)
    })

    expect(onEvent).toHaveBeenCalledWith(
      contractorEvents.CONTRACTOR_SIGN_DOCUMENT,
      expect.objectContaining({ uuid: W9_DOCUMENT_UUID }),
    )
    await screen.findByText('Documents')
    expect(screen.getByRole('button', { name: 'Sign document' })).toBeInTheDocument()
  })

  it('forwards the done event when all documents are signed and the user continues', async () => {
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
    const user = userEvent.setup()
    const onEvent = renderSigner()

    await screen.findByText('Documents')
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    await waitFor(() => {
      expect(continueButton).toBeEnabled()
    })

    await user.click(continueButton)
    expect(onEvent).toHaveBeenCalledWith(componentEvents.CONTRACTOR_DOCUMENTS_DONE, undefined)
  })
})
