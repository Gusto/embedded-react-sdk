import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { DocumentsCard } from './DocumentsCard'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import {
  handleGetContractorDocuments,
  handleGetContractorDocumentPdf,
} from '@/test/mocks/apis/contractor_documents'
import { componentEvents } from '@/shared/constants'

const originalOpen = window.open

describe('DocumentsCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    window.open = vi.fn()
  })

  afterEach(() => {
    window.open = originalOpen
  })

  it('renders the documents table with title and description columns', async () => {
    renderWithProviders(<DocumentsCard contractorId="contractor-123" onEvent={onEvent} />)

    expect(await screen.findByText('W-9')).toBeInTheDocument()
    expect(screen.getByText('Contractor handbook')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'View' }).length).toBe(2)
  })

  it('shows an empty state when the contractor has no documents', async () => {
    server.use(handleGetContractorDocuments(() => HttpResponse.json([])))

    renderWithProviders(<DocumentsCard contractorId="contractor-123" onEvent={onEvent} />)

    expect(await screen.findByText('No documents yet')).toBeInTheDocument()
  })

  it('fetches the PDF, opens it in a new tab, and fires view events', async () => {
    const pdfResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({
        uuid: 'w9-document-uuid',
        document_url: 'https://gusto-test.com/w9.pdf',
      }),
    )
    server.use(handleGetContractorDocumentPdf(pdfResolver))

    const user = userEvent.setup()
    renderWithProviders(<DocumentsCard contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByText('W-9')
    const [viewButton] = screen.getAllByRole('button', { name: 'View' })
    await user.click(viewButton!)

    await waitFor(() => {
      expect(pdfResolver).toHaveBeenCalledTimes(1)
    })
    expect(window.open).toHaveBeenCalledWith(
      'https://gusto-test.com/w9.pdf',
      '_blank',
      'noopener,noreferrer',
    )
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_DOCUMENTS_CARD_VIEW_REQUESTED,
      { contractorId: 'contractor-123', documentUuid: 'w9-document-uuid' },
    )
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_DOCUMENTS_CARD_VIEWED,
      { contractorId: 'contractor-123', documentUuid: 'w9-document-uuid' },
    )
  })
})
