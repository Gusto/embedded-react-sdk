import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { ProfileCard } from './ProfileCard'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetContractor } from '@/test/mocks/apis/contractors'
import { componentEvents } from '@/shared/constants'

function mockContractor(overrides: Record<string, unknown> = {}) {
  server.use(
    handleGetContractor(() =>
      HttpResponse.json({
        uuid: 'contractor-123',
        company_uuid: 'company-123',
        type: 'Individual',
        first_name: 'Ada',
        last_name: 'Lovelace',
        start_date: '2024-03-15',
        has_ssn: true,
        has_ein: false,
        email: 'ada.lovelace@example.com',
        wage_type: 'Hourly',
        is_active: true,
        version: 'version-123',
        onboarded: true,
        onboarding_status: 'onboarding_completed',
        ...overrides,
      }),
    ),
  )
}

describe('ProfileCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    mockContractor()
  })

  it('renders the basic-details title and Edit button once the contractor loads', async () => {
    renderWithProviders(<ProfileCard contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    expect(screen.getByText('Basic details')).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('XXX-XX-XXXX')).toBeInTheDocument()
  })

  it('shows the EIN label and masked value for a business contractor', async () => {
    mockContractor({
      type: 'Business',
      business_name: 'Pacific Design Co.',
      first_name: null,
      last_name: null,
      has_ssn: false,
      has_ein: true,
      ein: 'XX-XXX4879',
    })

    renderWithProviders(<ProfileCard contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('Pacific Design Co.')).toBeInTheDocument()
    })

    expect(screen.getByText('Employer Identification Number (EIN)')).toBeInTheDocument()
    expect(screen.getByText('XX-XXX4879')).toBeInTheDocument()
  })

  it('fires CONTRACTOR_MANAGEMENT_PROFILE_EDIT_REQUESTED with { contractorId } when Edit is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ProfileCard contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_PROFILE_EDIT_REQUESTED,
      { contractorId: 'contractor-123' },
    )
  })
})
