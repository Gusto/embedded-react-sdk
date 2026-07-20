import { describe, test, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { ContractorSubmit } from './Submit'
import { server } from '@/test/mocks/server'
import { handleGetContractor } from '@/test/mocks/apis/contractors'
import { handleGetContractorOnboardingStatus } from '@/test/mocks/apis/contractors'
import { handleGetContractorDocuments } from '@/test/mocks/apis/contractors'
import { handleGetContractorDocumentPdf } from '@/test/mocks/apis/contractor_documents'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('ContractorSubmit', () => {
  const mockOnEvent = vi.fn()

  test('hides documents section when contractor has signed W-9', () => {
    server.use(
      handleGetContractor(() =>
        HttpResponse.json({
          uuid: 'contractor-uuid',
          type: 'Individual',
          first_name: 'Test',
          last_name: 'Contractor',
        }),
      ),
      handleGetContractorOnboardingStatus(() =>
        HttpResponse.json({
          uuid: 'status-uuid',
          onboarding_status: 'admin_onboarding_review',
          onboarding_steps: [],
        }),
      ),
      handleGetContractorDocuments(() =>
        HttpResponse.json([
          {
            uuid: 'doc-uuid',
            name: 'taxpayer_identification_form_w_9',
            requires_signing: true,
            signed_at: '2025-01-15T12:00:00Z',
          },
        ]),
      ),
    )

    renderWithProviders(<ContractorSubmit contractorId="contractor-uuid" onEvent={mockOnEvent} />)

    // Documents section should NOT render when W-9 is signed
    expect(screen.queryByText('Documents')).not.toBeInTheDocument()
  })

  test('shows documents section when contractor has not signed W-9', async () => {
    server.use(
      handleGetContractor(() =>
        HttpResponse.json({
          uuid: 'contractor-uuid',
          type: 'Individual',
          first_name: 'Test',
          last_name: 'Contractor',
        }),
      ),
      handleGetContractorOnboardingStatus(() =>
        HttpResponse.json({
          uuid: 'status-uuid',
          onboarding_status: 'admin_onboarding_review',
          onboarding_steps: [],
        }),
      ),
      handleGetContractorDocuments(() =>
        HttpResponse.json([
          {
            uuid: 'doc-uuid',
            name: 'taxpayer_identification_form_w_9',
            requires_signing: true,
            signed_at: null,
          },
        ]),
      ),
      handleGetContractorDocumentPdf(() =>
        HttpResponse.json({
          uuid: 'doc-uuid',
          document_url: 'https://example.com/w9.pdf',
        }),
      ),
    )

    renderWithProviders(<ContractorSubmit contractorId="contractor-uuid" onEvent={mockOnEvent} />)

    // Documents section SHOULD render when W-9 is not signed
    expect(await screen.findByText('Documents')).toBeInTheDocument()
  })

  test('hides documents section when there are no documents to collect', () => {
    server.use(
      handleGetContractor(() =>
        HttpResponse.json({
          uuid: 'contractor-uuid',
          type: 'Individual',
          first_name: 'Test',
          last_name: 'Contractor',
        }),
      ),
      handleGetContractorOnboardingStatus(() =>
        HttpResponse.json({
          uuid: 'status-uuid',
          onboarding_status: 'admin_onboarding_review',
          onboarding_steps: [],
        }),
      ),
      handleGetContractorDocuments(() => HttpResponse.json([])),
    )

    renderWithProviders(<ContractorSubmit contractorId="contractor-uuid" onEvent={mockOnEvent} />)

    // No documents section when there are no documents to collect
    expect(screen.queryByText('Documents')).not.toBeInTheDocument()
  })
})
