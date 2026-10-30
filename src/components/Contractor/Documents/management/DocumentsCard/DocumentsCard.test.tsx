import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
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
import {
  handleGetContractorForms,
  handleGetContractorFormPdf,
} from '@/test/mocks/apis/contractor_forms'
import { componentEvents } from '@/shared/constants'

function rowFor(text: string): HTMLTableRowElement {
  const row = screen.getByText(text).closest('tr')
  if (!row) throw new Error(`No table row found for "${text}"`)
  return row
}

describe('DocumentsCard', () => {
  const onEvent = vi.fn()
  let openSpy: MockInstance<typeof window.open>

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
  })

  afterEach(() => {
    openSpy.mockRestore()
  })

  it('lists tax forms and documents together, forms first', async () => {
    renderWithProviders(<DocumentsCard contractorId="contractor-123" onEvent={onEvent} />)

    expect(await screen.findByText('Form 1099: 2026')).toBeInTheDocument()
    expect(screen.getByText('W-9')).toBeInTheDocument()
    expect(screen.getByText('Contractor handbook')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'View' }).length).toBe(3)

    const rowTitles = screen
      .getAllByRole('row')
      .flatMap(row => within(row).queryAllByRole('rowheader'))
      .map(header => header.textContent)
    expect(rowTitles).toEqual(['Form 1099: 2026', 'W-9', 'Contractor handbook'])
  })

  it('shows signing status for documents only, since forms cannot be signed', async () => {
    renderWithProviders(<DocumentsCard contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByText('W-9')
    expect(screen.getByText('Not signed')).toBeInTheDocument()
    expect(screen.getByText('Signed')).toBeInTheDocument()

    expect(within(rowFor('Form 1099: 2026')).getAllByRole('gridcell')[1]?.textContent).toBe('–')
    expect(screen.queryByRole('button', { name: /sign/i })).toBeNull()
  })

  it('shows an empty state when the contractor has no forms or documents', async () => {
    server.use(
      handleGetContractorDocuments(() => HttpResponse.json([])),
      handleGetContractorForms(() => HttpResponse.json([])),
    )

    renderWithProviders(<DocumentsCard contractorId="contractor-123" onEvent={onEvent} />)

    expect(await screen.findByText('No documents yet')).toBeInTheDocument()
  })

  it('opens a document row via the document PDF endpoint and fires view events', async () => {
    const documentPdfResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({
        uuid: 'w9-document-uuid',
        document_url: 'https://gusto-test.com/w9.pdf',
      }),
    )
    const formPdfResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({ uuid: 'form-1099-uuid', document_url: 'https://unused' }),
    )
    server.use(
      handleGetContractorDocumentPdf(documentPdfResolver),
      handleGetContractorFormPdf(formPdfResolver),
    )

    const user = userEvent.setup()
    renderWithProviders(<DocumentsCard contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByText('W-9')
    await user.click(within(rowFor('W-9')).getByRole('button', { name: 'View' }))

    await waitFor(() => {
      expect(documentPdfResolver).toHaveBeenCalledTimes(1)
    })
    expect(formPdfResolver).not.toHaveBeenCalled()
    expect(openSpy).toHaveBeenCalledWith(
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

  it('opens a tax form row via the contractor form PDF endpoint and fires view events', async () => {
    let formPdfPath: string | null = null
    const formPdfResolver = vi.fn<HttpResponseResolver>(({ request }) => {
      formPdfPath = new URL(request.url).pathname
      return HttpResponse.json({
        uuid: 'form-1099-uuid',
        document_url: 'https://gusto-test.com/1099.pdf',
      })
    })
    const documentPdfResolver = vi.fn<HttpResponseResolver>(() =>
      HttpResponse.json({ uuid: 'w9-document-uuid', document_url: 'https://unused' }),
    )
    server.use(
      handleGetContractorFormPdf(formPdfResolver),
      handleGetContractorDocumentPdf(documentPdfResolver),
    )

    const user = userEvent.setup()
    renderWithProviders(<DocumentsCard contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByText('Form 1099: 2026')
    await user.click(within(rowFor('Form 1099: 2026')).getByRole('button', { name: 'View' }))

    await waitFor(() => {
      expect(formPdfResolver).toHaveBeenCalledTimes(1)
    })
    expect(documentPdfResolver).not.toHaveBeenCalled()
    expect(formPdfPath).toBe('/v1/contractors/contractor-123/forms/form-1099-uuid/pdf')
    expect(openSpy).toHaveBeenCalledWith(
      'https://gusto-test.com/1099.pdf',
      '_blank',
      'noopener,noreferrer',
    )
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_DOCUMENTS_CARD_VIEW_REQUESTED,
      { contractorId: 'contractor-123', formId: 'form-1099-uuid' },
    )
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_DOCUMENTS_CARD_VIEWED,
      { contractorId: 'contractor-123', formId: 'form-1099-uuid' },
    )
  })

  it('still lists documents when the token lacks the contractor_forms scope', async () => {
    server.use(
      handleGetContractorForms(() =>
        HttpResponse.json(
          { errors: [{ category: 'missing_oauth_scopes', message: 'Missing scopes' }] },
          { status: 403 },
        ),
      ),
    )

    renderWithProviders(<DocumentsCard contractorId="contractor-123" onEvent={onEvent} />)

    expect(await screen.findByText('W-9')).toBeInTheDocument()
    expect(screen.getByText('Contractor handbook')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'View' }).length).toBe(2)
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
