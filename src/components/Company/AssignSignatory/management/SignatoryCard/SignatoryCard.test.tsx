import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { SignatoryCard } from './SignatoryCard'
import { server } from '@/test/mocks/server'
import { handleGetAllSignatories } from '@/test/mocks/apis/company_signatories'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const fixtureSignatory = {
  uuid: 'signatory-1',
  first_name: 'Ada',
  last_name: 'Lovelace',
  email: 'ada@example.com',
  title: 'PRESIDENT',
  identity_verification_status: 'Pass',
  version: 'signatory-version',
}

describe('SignatoryCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(handleGetAllSignatories(() => HttpResponse.json([fixtureSignatory])))
  })

  it('renders the signatory with a translated title and their verification status', async () => {
    renderWithProviders(<SignatoryCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit signatory' })).toBeEnabled()
    })

    expect(screen.getByRole('heading', { name: 'Signatory' })).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('President')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('emits the edit-requested event with the signatory id when Edit is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignatoryCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit signatory' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Edit signatory' }))

    // The identifier is what lets the edit screen amend this record rather than
    // replacing it, so it travels with the event.
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_MANAGEMENT_SIGNATORY_EDIT_REQUESTED,
      { companyId: 'company-123', signatoryId: 'signatory-1' },
    )
  })

  it('renders the empty state with an Assign CTA when no signatory is on file', async () => {
    const user = userEvent.setup()
    server.use(handleGetAllSignatories(() => HttpResponse.json([])))

    renderWithProviders(<SignatoryCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('No signatory assigned')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Assign signatory' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_MANAGEMENT_SIGNATORY_EDIT_REQUESTED,
      { companyId: 'company-123', signatoryId: undefined },
    )
  })

  it('shows a pending badge and a free-text title the label map does not cover', async () => {
    server.use(
      handleGetAllSignatories(() =>
        HttpResponse.json([
          {
            ...fixtureSignatory,
            title: 'Chief Executive Officer',
            identity_verification_status: null,
          },
        ]),
      ),
    )

    renderWithProviders(<SignatoryCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Verification pending')).toBeInTheDocument()
    })
    expect(screen.getByText('Chief Executive Officer')).toBeInTheDocument()
  })
})
