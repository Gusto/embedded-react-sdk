import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, type HttpResponseResolver } from 'msw'
import { ContractorList } from './index'
import { server } from '@/test/mocks/server'
import {
  handleGetContractorsList,
  handleUpdateContractorOnboardingStatus,
} from '@/test/mocks/apis/contractors'
import { contractorEvents, ContractorOnboardingStatus } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const baseContractor = {
  uuid: 'contractor-123',
  company_uuid: 'company-123',
  type: 'Individual',
  first_name: 'Ada',
  last_name: 'Lovelace',
  wage_type: 'Hourly',
  hourly_rate: '50.00',
  start_date: '2024-01-01',
  is_active: true,
  version: 'version-123',
  onboarded: false,
}

function mockContractorWithStatus(onboardingStatus: string, onboarded = false) {
  server.use(
    handleGetContractorsList(() =>
      HttpResponse.json([{ ...baseContractor, onboarding_status: onboardingStatus, onboarded }], {
        headers: { 'x-total-pages': '1', 'x-total-count': '1' },
      }),
    ),
  )
}

describe('ContractorList hamburger menu edit/review CTA', () => {
  beforeEach(() => {
    mockContractorWithStatus('admin_onboarding_incomplete')
  })

  it('labels the menu action "Edit" while onboarding is still incomplete', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContractorList companyId="company-123" onEvent={() => {}} />)

    await screen.findByText('Ada Lovelace')
    await user.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(await screen.findByRole('menuitem', { name: 'Edit' })).toBeTruthy()
  })

  it('labels the menu action "Review" when the contractor is awaiting self-onboarding review', async () => {
    mockContractorWithStatus('self_onboarding_review')

    const user = userEvent.setup()
    renderWithProviders(<ContractorList companyId="company-123" onEvent={() => {}} />)

    await screen.findByText('Ada Lovelace')
    await user.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(await screen.findByRole('menuitem', { name: 'Review' })).toBeTruthy()
  })

  it('labels the menu action "Edit" for admin-facilitated onboarding review (admin entered the data)', async () => {
    mockContractorWithStatus('admin_onboarding_review')

    const user = userEvent.setup()
    renderWithProviders(<ContractorList companyId="company-123" onEvent={() => {}} />)

    await screen.findByText('Ada Lovelace')
    await user.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(await screen.findByRole('menuitem', { name: 'Edit' })).toBeTruthy()
  })

  it('labels the menu action "Edit" once onboarding is complete', async () => {
    mockContractorWithStatus('onboarding_completed', true)

    const user = userEvent.setup()
    renderWithProviders(<ContractorList companyId="company-123" onEvent={() => {}} />)

    await screen.findByText('Ada Lovelace')
    await user.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(await screen.findByRole('menuitem', { name: 'Edit' })).toBeTruthy()
  })
})

describe('ContractorList cancel self-onboarding action', () => {
  it.each(['self_onboarding_invited', 'self_onboarding_started'])(
    'offers "Cancel self-onboarding" but not "Edit" for %s',
    async status => {
      mockContractorWithStatus(status)

      const user = userEvent.setup()
      renderWithProviders(<ContractorList companyId="company-123" onEvent={() => {}} />)

      await screen.findByText('Ada Lovelace')
      await user.click(screen.getByRole('button', { name: 'Open menu' }))

      expect(await screen.findByRole('menuitem', { name: 'Cancel self-onboarding' })).toBeTruthy()
      // Editing is blocked mid self-onboarding — the admin must cancel it first.
      expect(screen.queryByRole('menuitem', { name: 'Edit' })).not.toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument()
    },
  )

  it.each(['admin_onboarding_incomplete', 'self_onboarding_not_invited', 'self_onboarding_review'])(
    'does not offer "Cancel self-onboarding" for %s',
    async status => {
      mockContractorWithStatus(status)

      const user = userEvent.setup()
      renderWithProviders(<ContractorList companyId="company-123" onEvent={() => {}} />)

      await screen.findByText('Ada Lovelace')
      await user.click(screen.getByRole('button', { name: 'Open menu' }))

      await screen.findByRole('menuitem', { name: /Edit|Review/ })
      expect(
        screen.queryByRole('menuitem', { name: 'Cancel self-onboarding' }),
      ).not.toBeInTheDocument()
    },
  )

  it('reverts the contractor to admin onboarding and emits the status-updated event', async () => {
    mockContractorWithStatus('self_onboarding_invited')

    let requestBody: Record<string, unknown> | null = null
    const cancelResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
      requestBody = (await request.json()) as Record<string, unknown>
      return HttpResponse.json({
        uuid: 'contractor-123',
        onboarding_status: ContractorOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
        onboarding_steps: [],
      })
    })
    server.use(handleUpdateContractorOnboardingStatus(cancelResolver))

    const onEvent = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<ContractorList companyId="company-123" onEvent={onEvent} />)

    await screen.findByText('Ada Lovelace')
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Cancel self-onboarding' }))

    await waitFor(() => {
      expect(cancelResolver).toHaveBeenCalledTimes(1)
    })
    expect(requestBody).toMatchObject({
      onboarding_status: ContractorOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
    })
    expect(onEvent).toHaveBeenCalledWith(
      contractorEvents.CONTRACTOR_SELF_ONBOARDING_CANCELLED,
      expect.objectContaining({
        onboardingStatus: ContractorOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
      }),
    )
  })
})
