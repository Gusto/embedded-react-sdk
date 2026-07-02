import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { SelfOnboardingFlow } from './SelfOnboardingFlow'
import { server } from '@/test/mocks/server'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import {
  handleGetContractorDocuments,
  W9_DOCUMENT_UUID,
} from '@/test/mocks/apis/contractor_documents'
import { handleGetContractorAddress } from '@/test/mocks/apis/contractor_address'
import { contractorEvents } from '@/shared/constants'

describe('Contractor SelfOnboardingFlow', () => {
  beforeEach(() => {
    setupApiTestMocks()
    // A contractor address already on file (with a version) so the address step
    // pre-fills and can issue its update-only PUT.
    server.use(
      handleGetContractorAddress(() =>
        HttpResponse.json({
          version: 'contractor-address-version',
          street_1: '123 Any St',
          street_2: '',
          city: 'Redmond',
          state: 'CA',
          zip: '94107',
          country: 'USA',
        }),
      ),
    )
    // Present every document as already signed so the document step's Continue
    // is enabled without walking the (separately tested) signing sub-flow.
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
  })

  it('walks the contractor from the landing page through to the summary', async () => {
    const user = userEvent.setup()
    const onEvent = vi.fn()

    renderWithProviders(
      <SelfOnboardingFlow companyId="company-123" contractorId="contractor_id" onEvent={onEvent} />,
    )

    // Landing
    await user.click(await screen.findByRole('button', { name: /get started/i }))

    // Profile (self-onboarding, isAdmin=false)
    await screen.findByText('Complete your profile')
    await user.type(await screen.findByLabelText('Social Security Number'), '123-45-6789')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    // Address (pre-filled from the address on file)
    await screen.findByRole('heading', { name: 'Home address' })
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    // Payment method
    await screen.findByRole('heading', { name: 'Contractor payment details' })
    await user.click(screen.getByRole('radio', { name: 'Check' }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    // Documents (all already signed)
    await screen.findByText('Documents')
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    await waitFor(() => {
      expect(continueButton).toBeEnabled()
    })
    await user.click(continueButton)

    // Summary
    await screen.findByText("You're all set!")

    // Completing the summary forwards the terminal event to the partner.
    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(onEvent).toHaveBeenCalledWith(
      contractorEvents.CONTRACTOR_SELF_ONBOARDING_DONE,
      expect.objectContaining({ contractorId: 'contractor_id' }),
    )
  }, 20000)
})
