import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StateTaxesCard } from './StateTaxesCard'
import { server } from '@/test/mocks/server'
import {
  getAllStateTaxRequirementsWithStatus,
  getEmptyAllStateTaxRequirements,
} from '@/test/mocks/apis/company_state_taxes'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const unstableFeatures = { companySettingsDashboard: true }

describe('StateTaxesCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(getAllStateTaxRequirementsWithStatus)
  })

  it('renders the SDK error card instead of the card without the companySettingsDashboard flag', async () => {
    // The flag check throws; GustoProvider's top-level ErrorBoundary catches it
    // and renders InternalError in place of the card.
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithProviders(<StateTaxesCard companyId="company-123" onEvent={onEvent} />)

    expect(await screen.findByTestId('internal-error-card')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Manage state taxes' })).toBeNull()

    consoleErrorSpy.mockRestore()
  })

  it('names each state and reports its setup status', async () => {
    renderWithProviders(<StateTaxesCard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage state taxes' })).toBeEnabled()
    })

    expect(screen.getByRole('heading', { name: 'State taxes' })).toBeInTheDocument()

    // The fixture covers every setup status plus both supplementary flags.
    expect(await screen.findByText('Wyoming')).toBeInTheDocument()
    expect(screen.getByText('Not started')).toBeInTheDocument()
    expect(screen.getByText('Florida')).toBeInTheDocument()
    expect(screen.getByText('In progress')).toBeInTheDocument()
    expect(screen.getByText('Georgia')).toBeInTheDocument()
    expect(screen.getByText('Default rates applied')).toBeInTheDocument()
    expect(screen.getByText('California')).toBeInTheDocument()
    expect(screen.getByText('Ready to run payroll')).toBeInTheDocument()
  })

  it('emits the edit-requested event with the company id when Manage is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StateTaxesCard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage state taxes' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Manage state taxes' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_MANAGEMENT_STATE_TAXES_EDIT_REQUESTED,
      { companyId: 'company-123' },
    )
  })

  it('renders the empty state when the company has no state tax requirements', async () => {
    server.use(getEmptyAllStateTaxRequirements)

    renderWithProviders(<StateTaxesCard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(screen.getByText('No state taxes yet')).toBeInTheDocument()
    })
  })
})
