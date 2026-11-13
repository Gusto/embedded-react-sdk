import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
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

  it('renders the SDK error card without the companySettingsDashboard flag', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithProviders(<StateTaxes companyId="company-123" onEvent={onEvent} />)

    expect(await screen.findByTestId('internal-error-card')).toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })

  it('opens on a steady-state list without the onboarding warning or Continue button', async () => {
    renderWithProviders(<StateTaxes companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    expect(await screen.findByRole('heading', { name: 'State taxes' })).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /Actions for California/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Self-onboarding employees can change your company tax requirements'),
    ).toBeNull()
    expect(screen.queryByRole('button', { name: 'Continue' })).toBeNull()
  })

  it('returns to the steady-state list after leaving a state’s tax rate history', async () => {
    const user = userEvent.setup()
    renderWithProviders(<StateTaxes companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await user.click(await screen.findByRole('button', { name: /Actions for California/i }))
    await user.click(await screen.findByTestId('manage-tax-rates'))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.COMPANY_STATE_TAX_MANAGE_RATES, {
      state: 'CA',
    })

    await user.click(await screen.findByRole('button', { name: 'Back to states' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.CANCEL, undefined)
    expect(await screen.findByRole('heading', { name: 'State taxes' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue' })).toBeNull()
  })
})
