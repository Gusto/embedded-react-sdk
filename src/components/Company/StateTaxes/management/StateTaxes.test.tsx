import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StateTaxes } from './StateTaxes'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const unstableFeatures = { companySettingsDashboard: true }

describe('CompanyManagement.StateTaxes', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()
  })

  async function openEditor(user: ReturnType<typeof userEvent.setup>) {
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage state taxes' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage state taxes' }))
  }

  it('renders the SDK error card without the companySettingsDashboard flag', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithProviders(<StateTaxes companyId="company-123" onEvent={onEvent} />)

    expect(await screen.findByTestId('internal-error-card')).toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })

  it('opens the editor on a steady-state list without the onboarding warning or Continue button', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StateTaxes companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await openEditor(user)

    expect(await screen.findByRole('heading', { name: 'State taxes' })).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /Actions for California/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Self-onboarding employees can change your company tax requirements'),
    ).toBeNull()
    expect(screen.queryByRole('button', { name: 'Continue' })).toBeNull()
  })

  it('returns an inner state’s tax rate history to the list on cancel, not to the card', async () => {
    // The surface's own machine transitions on bare CANCEL to return a state's rate history to
    // the list, and Flow re-emits that upward. If the block's machine declared its own CANCEL
    // transition, backing out of one state would close the whole block.
    const user = userEvent.setup()
    renderWithProviders(<StateTaxes companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await openEditor(user)
    await user.click(await screen.findByRole('button', { name: /Actions for California/i }))
    await user.click(await screen.findByTestId('manage-tax-rates'))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.COMPANY_STATE_TAX_MANAGE_RATES, {
      state: 'CA',
    })

    await user.click(await screen.findByRole('button', { name: 'Back to states' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.CANCEL, undefined)
    expect(await screen.findByRole('heading', { name: 'State taxes' })).toBeInTheDocument()
    // Still inside the block, on the list — not back on the card.
    expect(screen.queryByRole('button', { name: 'Manage state taxes' })).toBeNull()
  })

  it('opens on the card and returns to it via the back header', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StateTaxes companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await openEditor(user)
    await user.click(await screen.findByRole('button', { name: 'Back to state taxes' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage state taxes' })).toBeInTheDocument()
    })
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_MANAGEMENT_STATE_TAXES_EDIT_CANCELLED,
      undefined,
    )
  })
})
