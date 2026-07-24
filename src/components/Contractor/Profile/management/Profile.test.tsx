import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { Profile } from './Profile'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetContractor, handleUpdateContractor } from '@/test/mocks/apis/contractors'
import { componentEvents } from '@/shared/constants'

const contractorWithRequiredFields = {
  uuid: 'contractor-123',
  company_uuid: 'company-123',
  type: 'Individual',
  first_name: 'Ada',
  middle_initial: 'J',
  last_name: 'Lovelace',
  email: 'ada.lovelace@example.com',
  start_date: '2024-03-15',
  version: '1',
  has_ssn: true,
  has_ein: false,
  wage_type: 'Hourly',
  hourly_rate: '65.00',
  is_active: true,
  onboarded: true,
  onboarding_status: 'onboarding_completed',
}

describe('Profile (management block)', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    server.use(handleGetContractor(() => HttpResponse.json(contractorWithRequiredFields)))
  })

  it('renders the card initially with the basic-details title and Edit button', async () => {
    renderWithProviders(<Profile contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    expect(screen.getByText('Basic details')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull()
  })

  it('transitions card → editProfile when the Edit button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Profile contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_PROFILE_EDIT_REQUESTED,
      { contractorId: 'contractor-123' },
    )
  })

  it('returns to the card without an alert when Cancel is clicked from edit', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Profile contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    })

    expect(screen.queryByText('Profile updated')).toBeNull()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_PROFILE_EDIT_CANCELLED,
      undefined,
    )
  })

  it('returns to the card with the profileUpdated alert after a successful save', async () => {
    const user = userEvent.setup()
    server.use(
      handleGetContractor(() => HttpResponse.json(contractorWithRequiredFields)),
      handleUpdateContractor(
        vi.fn<HttpResponseResolver>(async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>
          return HttpResponse.json({
            ...contractorWithRequiredFields,
            ...body,
            version: '2',
          })
        }),
      ),
    )

    renderWithProviders(<Profile contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(
      () => {
        expect(screen.getByText('Profile updated')).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_PROFILE_UPDATED,
      expect.any(Object),
    )
  })
})
