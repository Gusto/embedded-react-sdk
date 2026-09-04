import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { ContractorListFlow } from './ContractorListFlow'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { server } from '@/test/mocks/server'
import { handleGetContractor, handleGetContractorsList } from '@/test/mocks/apis/contractors'

const contractorFixture = {
  uuid: 'contractor-123',
  company_uuid: '123',
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

describe('ContractorListFlow', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
    server.use(
      handleGetContractorsList(() =>
        HttpResponse.json([contractorFixture], {
          headers: { 'x-total-pages': '1', 'x-total-count': '1' },
        }),
      ),
      handleGetContractor(() => HttpResponse.json(contractorFixture)),
    )
  })

  it('renders the management list initially', async () => {
    renderWithProviders(<ContractorListFlow companyId="123" onEvent={onEvent} />)

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Active' })).toBeInTheDocument()
  })

  it('navigates to the dashboard on "View details" and back to the list on "Back to contractors"', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContractorListFlow companyId="123" onEvent={onEvent} />)

    await user.click(await screen.findByRole('button', { name: 'Actions for Ada Lovelace' }))
    await user.click(await screen.findByRole('menuitem', { name: 'View details' }))

    expect(await screen.findByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith('contractor/view', { contractorId: 'contractor-123' })

    await user.click(await screen.findByRole('button', { name: 'Back to contractors' }))

    expect(await screen.findByRole('tab', { name: 'Active' })).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith('contractor/returnToList', undefined)
  })

  it('does not offer "Dismiss contractor" — no dismissal flow exists yet', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContractorListFlow companyId="123" onEvent={onEvent} />)

    await user.click(await screen.findByRole('button', { name: 'Actions for Ada Lovelace' }))

    expect(screen.queryByRole('menuitem', { name: 'Dismiss contractor' })).not.toBeInTheDocument()
  })

  it('routes "Add contractor" directly to the Profile step (skipping OnboardingFlow\'s own list), and Cancel returns to this list', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContractorListFlow companyId="123" onEvent={onEvent} />)

    await user.click(await screen.findByRole('button', { name: 'Add contractor' }))

    expect(onEvent).toHaveBeenCalledWith('contractor/create', undefined)
    expect(await screen.findByRole('heading', { name: 'Contractor profile' })).toBeInTheDocument()
    // Regression guard: only one header should render here. Mounting OnboardingFlow as a
    // nested <Flow> previously produced two "Back to contractors" buttons — this list's own
    // minimal back header stacked on top of OnboardingFlow's own progress-header CTA.
    expect(screen.getAllByRole('button', { name: 'Back to contractors' })).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Back to contractors' }))

    expect(await screen.findByRole('tab', { name: 'Active' })).toBeInTheDocument()
    expect(onEvent).toHaveBeenCalledWith('CANCEL', undefined)
  })

  it('routes an onboarding-tab row\'s "Continue" directly to the Profile step, pre-filled for that contractor', async () => {
    const user = userEvent.setup()
    server.use(
      handleGetContractorsList(() =>
        HttpResponse.json(
          [
            {
              ...contractorFixture,
              onboarded: false,
              onboarding_status: 'admin_onboarding_incomplete',
            },
          ],
          { headers: { 'x-total-pages': '1', 'x-total-count': '1' } },
        ),
      ),
    )
    renderWithProviders(<ContractorListFlow companyId="123" onEvent={onEvent} />)

    await user.click(await screen.findByRole('tab', { name: 'Onboarding' }))
    await user.click(await screen.findByRole('button', { name: 'Continue' }))

    expect(onEvent).toHaveBeenCalledWith('contractor/update', { contractorId: 'contractor-123' })
    expect(await screen.findByRole('heading', { name: 'Contractor profile' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Back to contractors' })).toHaveLength(1)
  })
})
