import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { ManagementContractorList } from './ManagementContractorList'
import { server } from '@/test/mocks/server'
import {
  handleGetContractorsList,
  handleDeleteContractor,
  handleCancelContractorDismissal,
  handleCancelContractorRehire,
  handleScheduleContractorDismissal,
  handleScheduleContractorRehire,
} from '@/test/mocks/apis/contractors'
import { contractorEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const baseContractor = {
  uuid: 'contractor-123',
  company_uuid: 'company-123',
  type: 'Individual',
  first_name: 'Ada',
  last_name: 'Lovelace',
  wage_type: 'Hourly',
  hourly_rate: '50.00',
  is_active: true,
  version: 'version-123',
  onboarded: true,
  onboarding_status: 'onboarding_completed',
}

function mockList(contractors: Record<string, unknown>[]) {
  server.use(
    handleGetContractorsList(() =>
      HttpResponse.json(contractors, {
        headers: { 'x-total-pages': '1', 'x-total-count': String(contractors.length) },
      }),
    ),
  )
}

describe('ManagementContractorList — Active tab', () => {
  it('shows hourly rate and no status badge when nothing is pending', async () => {
    mockList([{ ...baseContractor }])

    renderWithProviders(<ManagementContractorList companyId="company-123" onEvent={() => {}} />)

    await screen.findByText('Ada Lovelace')
    expect(screen.getByText('Hourly — $50.00/hr')).toBeInTheDocument()
  })

  it('shows a "Starts" badge when a rehire is scheduled', async () => {
    mockList([
      {
        ...baseContractor,
        upcoming_employment: { start_date: '2026-09-01' },
        rehire_cancellation_eligible: true,
      },
    ])

    renderWithProviders(<ManagementContractorList companyId="company-123" onEvent={() => {}} />)

    await screen.findByText('Ada Lovelace')
    expect(screen.getByText(/Starts /)).toBeInTheDocument()
  })

  it('shows a "Last day" badge when a dismissal is scheduled', async () => {
    mockList([
      {
        ...baseContractor,
        dismissal_date: '2026-08-15',
        dismissal_cancellation_eligible: true,
      },
    ])

    renderWithProviders(<ManagementContractorList companyId="company-123" onEvent={() => {}} />)

    await screen.findByText('Ada Lovelace')
    expect(screen.getByText(/Last day /)).toBeInTheDocument()
  })

  it('offers "Dismiss contractor" and fires contractor/dismiss without calling the mutation', async () => {
    mockList([{ ...baseContractor }])

    const dismissResolver = vi.fn<HttpResponseResolver>(
      () => new HttpResponse(null, { status: 200 }),
    )
    server.use(handleScheduleContractorDismissal(dismissResolver))

    const onEvent = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<ManagementContractorList companyId="company-123" onEvent={onEvent} />)

    await screen.findByText('Ada Lovelace')
    await user.click(screen.getByRole('button', { name: 'Contractor actions menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Dismiss contractor' }))

    expect(onEvent).toHaveBeenCalledWith(contractorEvents.CONTRACTOR_DISMISS, {
      contractorId: 'contractor-123',
    })
    expect(dismissResolver).not.toHaveBeenCalled()
  })

  it('cancels a scheduled dismissal via the confirm dialog', async () => {
    mockList([
      {
        ...baseContractor,
        dismissal_date: '2026-08-15',
        dismissal_cancellation_eligible: true,
      },
    ])

    const cancelResolver = vi.fn<HttpResponseResolver>(
      () => new HttpResponse(null, { status: 204 }),
    )
    server.use(handleCancelContractorDismissal(cancelResolver))

    const onEvent = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<ManagementContractorList companyId="company-123" onEvent={onEvent} />)

    await screen.findByText('Ada Lovelace')
    await user.click(screen.getByRole('button', { name: 'Contractor actions menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Cancel dismissal' }))

    expect(await screen.findByRole('dialog')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Yes, cancel dismissal' }))

    await waitFor(() => {
      expect(cancelResolver).toHaveBeenCalledTimes(1)
    })
    expect(onEvent).toHaveBeenCalledWith(contractorEvents.CONTRACTOR_DISMISSAL_CANCELLED, {
      contractorId: 'contractor-123',
    })
  })

  it('fires contractor/view for "View details"', async () => {
    mockList([{ ...baseContractor }])

    const onEvent = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<ManagementContractorList companyId="company-123" onEvent={onEvent} />)

    await screen.findByText('Ada Lovelace')
    await user.click(screen.getByRole('button', { name: 'Contractor actions menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'View details' }))

    expect(onEvent).toHaveBeenCalledWith(contractorEvents.CONTRACTOR_VIEW, {
      contractorId: 'contractor-123',
    })
  })
})

describe('ManagementContractorList — Onboarding tab', () => {
  beforeEach(() => {
    mockList([
      {
        ...baseContractor,
        onboarded: false,
        onboarding_status: 'admin_onboarding_incomplete',
      },
    ])
  })

  it('shows a "Continue" button and offers Remove', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ManagementContractorList companyId="company-123" onEvent={() => {}} />)

    await user.click(await screen.findByRole('tab', { name: 'Onboarding' }))
    await screen.findByText('Ada Lovelace')

    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Contractor actions menu' }))
    expect(await screen.findByRole('menuitem', { name: 'Remove' })).toBeInTheDocument()
  })

  it('shows a "Review" button when awaiting self-onboarding review', async () => {
    mockList([
      {
        ...baseContractor,
        onboarded: false,
        onboarding_status: 'self_onboarding_review',
      },
    ])

    const user = userEvent.setup()
    renderWithProviders(<ManagementContractorList companyId="company-123" onEvent={() => {}} />)

    await user.click(await screen.findByRole('tab', { name: 'Onboarding' }))
    await screen.findByText('Ada Lovelace')

    expect(screen.getByRole('button', { name: 'Review' })).toBeInTheDocument()
  })

  it('removes a contractor only after confirming the dialog', async () => {
    const deleteResolver = vi.fn<HttpResponseResolver>(
      () => new HttpResponse(null, { status: 204 }),
    )
    server.use(handleDeleteContractor(deleteResolver))

    const onEvent = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<ManagementContractorList companyId="company-123" onEvent={onEvent} />)

    await user.click(await screen.findByRole('tab', { name: 'Onboarding' }))
    await screen.findByText('Ada Lovelace')
    await user.click(screen.getByRole('button', { name: 'Contractor actions menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Remove' }))

    expect(deleteResolver).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Remove contractor' }))

    await waitFor(() => {
      expect(deleteResolver).toHaveBeenCalledTimes(1)
    })
    expect(onEvent).toHaveBeenCalledWith(contractorEvents.CONTRACTOR_DELETED, {
      contractorId: 'contractor-123',
    })
  })
})

describe('ManagementContractorList — Dismissed tab', () => {
  it('shows the dismissal date column', async () => {
    mockList([
      {
        ...baseContractor,
        is_active: false,
        dismissal_date: '2026-06-01',
      },
    ])

    const user = userEvent.setup()
    renderWithProviders(<ManagementContractorList companyId="company-123" onEvent={() => {}} />)

    await user.click(await screen.findByRole('tab', { name: 'Dismissed' }))
    await screen.findByText('Ada Lovelace')
    expect(screen.getByText('June 1')).toBeInTheDocument()
  })

  it('offers "Rehire contractor" and fires contractor/rehire without calling the mutation', async () => {
    mockList([
      {
        ...baseContractor,
        is_active: false,
        dismissal_date: '2026-06-01',
      },
    ])

    const rehireResolver = vi.fn<HttpResponseResolver>(
      () => new HttpResponse(null, { status: 200 }),
    )
    server.use(handleScheduleContractorRehire(rehireResolver))

    const onEvent = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<ManagementContractorList companyId="company-123" onEvent={onEvent} />)

    await user.click(await screen.findByRole('tab', { name: 'Dismissed' }))
    await screen.findByText('Ada Lovelace')
    await user.click(screen.getByRole('button', { name: 'Contractor actions menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Rehire contractor' }))

    expect(onEvent).toHaveBeenCalledWith(contractorEvents.CONTRACTOR_REHIRE, {
      contractorId: 'contractor-123',
    })
    expect(rehireResolver).not.toHaveBeenCalled()
  })

  it('cancels a scheduled rehire via the confirm dialog', async () => {
    mockList([
      {
        ...baseContractor,
        is_active: false,
        upcoming_employment: { start_date: '2026-09-01' },
        rehire_cancellation_eligible: true,
      },
    ])

    const cancelResolver = vi.fn<HttpResponseResolver>(
      () => new HttpResponse(null, { status: 204 }),
    )
    server.use(handleCancelContractorRehire(cancelResolver))

    const onEvent = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<ManagementContractorList companyId="company-123" onEvent={onEvent} />)

    await user.click(await screen.findByRole('tab', { name: 'Dismissed' }))
    await screen.findByText('Ada Lovelace')
    await user.click(screen.getByRole('button', { name: 'Contractor actions menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Cancel rehire' }))

    expect(await screen.findByRole('dialog')).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Yes, cancel rehire' }))

    await waitFor(() => {
      expect(cancelResolver).toHaveBeenCalledTimes(1)
    })
    expect(onEvent).toHaveBeenCalledWith(contractorEvents.CONTRACTOR_REHIRE_CANCELLED, {
      contractorId: 'contractor-123',
    })
  })
})

describe('ManagementContractorList — tab switching', () => {
  it('requests onboarded_active=true on the Active tab and onboarded=false on the Onboarding tab', async () => {
    let lastUrl = ''
    server.use(
      handleGetContractorsList(({ request }) => {
        lastUrl = request.url
        return HttpResponse.json([], {
          headers: { 'x-total-pages': '1', 'x-total-count': '0' },
        })
      }),
    )

    const user = userEvent.setup()
    renderWithProviders(<ManagementContractorList companyId="company-123" onEvent={() => {}} />)

    await waitFor(() => {
      expect(lastUrl).toContain('onboarded_active=true')
    })

    await user.click(await screen.findByRole('tab', { name: 'Onboarding' }))
    await waitFor(() => {
      expect(lastUrl).toContain('onboarded=false')
    })

    await user.click(await screen.findByRole('tab', { name: 'Dismissed' }))
    await waitFor(() => {
      expect(lastUrl).toContain('terminated=true')
    })
  })

  it('honors the initialTab prop', async () => {
    mockList([
      {
        ...baseContractor,
        onboarded: false,
        onboarding_status: 'admin_onboarding_incomplete',
      },
    ])

    renderWithProviders(
      <ManagementContractorList
        companyId="company-123"
        onEvent={() => {}}
        initialTab="onboarding"
      />,
    )

    expect(
      await screen.findByRole('tab', { name: 'Onboarding', selected: true }),
    ).toBeInTheDocument()
  })
})
