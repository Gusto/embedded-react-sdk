import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { Dashboard } from './Dashboard'
import { DashboardFlow } from './DashboardFlow'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetContractor, handleUpdateContractor } from '@/test/mocks/apis/contractors'
import {
  handleGetContractorAddress,
  handleUpdateContractorAddress,
} from '@/test/mocks/apis/contractor_address'
import {
  handleGetContractorPaymentMethod,
  handleCreateContractorBankAccount,
} from '@/test/mocks/apis/contractor_payment_method'
import { componentEvents } from '@/shared/constants'

const contractorFixture = {
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
  hourly_rate: '45.00',
  is_active: true,
  version: 'version-123',
  onboarded: true,
  onboarding_status: 'onboarding_completed',
}

describe('Dashboard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    server.use(handleGetContractor(() => HttpResponse.json(contractorFixture)))
  })

  it('renders the header and the Details tab by default', async () => {
    renderWithProviders(<Dashboard contractorId="contractor-123" onEvent={onEvent} />)

    expect(await screen.findByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument()
    expect(screen.getByText('Contractor')).toBeInTheDocument()
    expect(await screen.findByText('Address')).toBeInTheDocument()
  })

  it('switches to the Pay tab and fires the tab-change event', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dashboard contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByRole('heading', { name: 'Ada Lovelace' })
    await user.click(screen.getByRole('tab', { name: 'Pay' }))

    expect(await screen.findByText('Payment')).toBeInTheDocument()
    expect(screen.getByText('Compensation')).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith(componentEvents.CONTRACTOR_DASHBOARD_TAB_CHANGE, {
      tab: 'pay',
    })
  })

  it('switches to the Documents tab', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dashboard contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByRole('heading', { name: 'Ada Lovelace' })
    await user.click(screen.getByRole('tab', { name: 'Documents' }))

    expect(await screen.findByText('Documents')).toBeInTheDocument()
  })
})

describe('DashboardFlow', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    server.use(handleGetContractor(() => HttpResponse.json(contractorFixture)))
  })

  it('edits the profile and returns to the dashboard with the profileUpdated alert', async () => {
    server.use(
      handleUpdateContractor(
        vi.fn<HttpResponseResolver>(async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>
          return HttpResponse.json({ ...contractorFixture, ...body, version: 'v2' })
        }),
      ),
    )

    const user = userEvent.setup()
    renderWithProviders(<DashboardFlow contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByRole('heading', { name: 'Ada Lovelace' })
    await screen.findByText('Address')
    const [profileEditButton] = screen.getAllByRole('button', { name: 'Edit' })
    await user.click(profileEditButton!)

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
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_PROFILE_UPDATED,
      expect.any(Object),
    )
  })

  it('edits the address, returns to the dashboard on the Details tab with the addressUpdated alert', async () => {
    server.use(
      handleGetContractorAddress(() =>
        HttpResponse.json({
          version: 'addr-v1',
          street_1: '999 Kiera Stravenue',
          city: 'San Francisco',
          state: 'CA',
          zip: '94107',
          country: 'USA',
        }),
      ),
      handleUpdateContractorAddress(
        vi.fn<HttpResponseResolver>(async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>
          return HttpResponse.json({ version: 'addr-v2', country: 'USA', ...body })
        }),
      ),
    )

    const user = userEvent.setup()
    renderWithProviders(<DashboardFlow contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByText('999 Kiera Stravenue')
    const [, addressEditButton] = screen.getAllByRole('button', { name: 'Edit' })
    await user.click(addressEditButton!)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(
      () => {
        expect(screen.getByText('Address updated')).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
    expect(screen.getByRole('tab', { name: 'Details', selected: true })).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_UPDATED,
      expect.any(Object),
    )
  })

  it('adds a bank account from the Pay tab and returns with the bankAccountAdded alert', async () => {
    server.use(
      handleGetContractorPaymentMethod(() =>
        HttpResponse.json({ version: 'pm-v1', type: 'Check', splits: [] }),
      ),
      handleCreateContractorBankAccount(
        vi.fn<HttpResponseResolver>(() =>
          HttpResponse.json(
            {
              uuid: 'new-bank-uuid',
              contractor_uuid: 'contractor-123',
              name: 'New Bank',
              routing_number: '266905059',
              hidden_account_number: 'XXXX3123',
              account_type: 'Checking',
            },
            { status: 201 },
          ),
        ),
      ),
    )

    const user = userEvent.setup()
    renderWithProviders(<DashboardFlow contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByRole('heading', { name: 'Ada Lovelace' })
    await user.click(screen.getByRole('tab', { name: 'Pay' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add bank account' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Add bank account' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(
      () => {
        expect(screen.getByText('Bank account added')).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
    expect(screen.getByRole('tab', { name: 'Pay', selected: true })).toBeInTheDocument()
  })

  it('edits compensation from the Pay tab and returns with the compensationUpdated alert', async () => {
    server.use(
      handleUpdateContractor(
        vi.fn<HttpResponseResolver>(async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>
          return HttpResponse.json({ ...contractorFixture, ...body, version: 'v2' })
        }),
      ),
    )

    const user = userEvent.setup()
    renderWithProviders(<DashboardFlow contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByRole('heading', { name: 'Ada Lovelace' })
    await user.click(screen.getByRole('tab', { name: 'Pay' }))
    await user.click(await screen.findByRole('button', { name: 'Edit' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(
      () => {
        expect(screen.getByText('Compensation updated')).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
  })

  it('dismisses the success alert', async () => {
    server.use(
      handleUpdateContractor(
        vi.fn<HttpResponseResolver>(async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>
          return HttpResponse.json({ ...contractorFixture, ...body, version: 'v2' })
        }),
      ),
    )

    const user = userEvent.setup()
    renderWithProviders(<DashboardFlow contractorId="contractor-123" onEvent={onEvent} />)

    await screen.findByRole('heading', { name: 'Ada Lovelace' })
    await screen.findByText('Address')
    const [profileEditButton] = screen.getAllByRole('button', { name: 'Edit' })
    await user.click(profileEditButton!)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Save' }))

    const alert = await screen.findByText('Profile updated')
    await user.click(screen.getByRole('button', { name: /dismiss/i }))

    await waitFor(() => {
      expect(alert).not.toBeInTheDocument()
    })
    expect(onEvent).toHaveBeenCalledWith(componentEvents.CONTRACTOR_DASHBOARD_ALERT_DISMISSED, null)
  })
})
