import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { AddressCard } from './AddressCard'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import {
  handleGetContractor,
  handleGetContractorAddress,
} from '@/test/mocks/apis/contractor_address'
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

function mockAddress(overrides: Record<string, unknown> = {}) {
  server.use(
    handleGetContractorAddress(() =>
      HttpResponse.json({
        version: 'contractor-address-version',
        contractor_uuid: 'contractor-123',
        street_1: '999 Kiera Stravenue',
        street_2: 'Suite 541',
        city: 'San Francisco',
        state: 'CA',
        zip: '94107',
        country: 'USA',
        active: true,
        ...overrides,
      }),
    ),
  )
}

describe('AddressCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    mockContractor()
    mockAddress()
  })

  it('renders the Address title, Edit button, and address details once loaded', async () => {
    renderWithProviders(<AddressCard contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    expect(screen.getByText('Address')).toBeInTheDocument()
    expect(screen.getByText('999 Kiera Stravenue')).toBeInTheDocument()
    expect(screen.getByText('Suite 541')).toBeInTheDocument()
    expect(screen.getByText(/San Francisco.*CA.*94107/)).toBeInTheDocument()
  })

  it('omits the second address line when street2 is absent', async () => {
    mockAddress({ street_2: null })

    renderWithProviders(<AddressCard contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByText('999 Kiera Stravenue')).toBeInTheDocument()
    })

    expect(screen.queryByText('Suite 541')).toBeNull()
  })

  it('shows an empty placeholder when the contractor has no address on file', async () => {
    mockAddress({ street_1: null, street_2: null, city: null, state: null, zip: null })

    renderWithProviders(<AddressCard contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    expect(screen.getByText('–')).toBeInTheDocument()
  })

  it('fires CONTRACTOR_MANAGEMENT_ADDRESS_EDIT_REQUESTED with { contractorId } when Edit is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AddressCard contractorId="contractor-123" onEvent={onEvent} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_EDIT_REQUESTED,
      { contractorId: 'contractor-123' },
    )
  })
})
