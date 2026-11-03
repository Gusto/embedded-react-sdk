import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { LocationsCard } from './LocationsCard'
import { server } from '@/test/mocks/server'
import { basicLocation, handleGetCompanyLocations } from '@/test/mocks/apis/company_locations'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('LocationsCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(handleGetCompanyLocations(() => HttpResponse.json([basicLocation])))
  })

  it('renders the card title, each address, and its designation badges once loaded', async () => {
    renderWithProviders(<LocationsCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    expect(screen.getByRole('heading', { name: 'Locations' })).toBeInTheDocument()
    expect(screen.getByText('123 Main St, Apt 101')).toBeInTheDocument()
    expect(screen.getByText('Anytown, ABC 12345')).toBeInTheDocument()
    // basicLocation is mailing_address: true, filing_address: false
    expect(screen.getByText('Mailing')).toBeInTheDocument()
    expect(screen.queryByText('Filing')).toBeNull()
  })

  it('emits the edit-requested event with the company id when Manage is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LocationsCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Manage' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_MANAGEMENT_LOCATIONS_EDIT_REQUESTED,
      { companyId: 'company-123' },
    )
  })

  it('renders the empty state when the company has no locations', async () => {
    server.use(handleGetCompanyLocations(() => HttpResponse.json([])))

    renderWithProviders(<LocationsCard companyId="company-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('No locations yet')).toBeInTheDocument()
    })
  })
})
