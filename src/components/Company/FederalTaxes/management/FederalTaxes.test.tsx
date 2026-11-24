import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { FederalTaxes } from './FederalTaxes'
import { server } from '@/test/mocks/server'
import {
  handleGetCompanyFederalTaxes,
  handleUpdateCompanyFederalTaxes,
} from '@/test/mocks/apis/company_federal_taxes'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const COMPANY_ID = 'company-123'

const fixtureFederalTaxes = {
  version: '36d35e28689e641e9e153f0324c2625a',
  tax_payer_type: 'Sole proprietor',
  taxable_as_scorp: false,
  filing_form: '944',
  has_ein: true,
  ein_verified: false,
  legal_name: 'foobarbaz',
}

const unstableFeatures = { companySettingsDashboard: true }

async function openEditor(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Edit federal taxes' })).toBeEnabled()
  })
  await user.click(screen.getByRole('button', { name: 'Edit federal taxes' }))
  await screen.findByText('Federal Tax Information')
}

describe('CompanyManagement.FederalTaxes', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      handleGetCompanyFederalTaxes(() => HttpResponse.json(fixtureFederalTaxes)),
      handleUpdateCompanyFederalTaxes(() => HttpResponse.json(fixtureFederalTaxes)),
    )
  })

  it('renders the SDK error card instead of the block without the companySettingsDashboard flag', async () => {
    // The flag check throws above BaseBoundaries; GustoProvider's top-level ErrorBoundary
    // catches it and renders InternalError in place of the block.
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithProviders(<FederalTaxes companyId={COMPANY_ID} onEvent={onEvent} />)

    expect(await screen.findByTestId('internal-error-card')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit federal taxes' })).toBeNull()

    consoleErrorSpy.mockRestore()
  })

  it('opens on the card', async () => {
    renderWithProviders(<FederalTaxes companyId={COMPANY_ID} onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit federal taxes' })).toBeEnabled()
    })
    expect(screen.getByText('foobarbaz')).toBeInTheDocument()
  })

  it('returns from the editor to the card via its own back header, not a generic cancel', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FederalTaxes companyId={COMPANY_ID} onEvent={onEvent} />, {
      unstableFeatures,
    })

    await openEditor(user)
    await user.click(await screen.findByRole('button', { name: 'Back to federal taxes' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit federal taxes' })).toBeInTheDocument()
    })
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_MANAGEMENT_FEDERAL_TAXES_EDIT_CANCELLED,
      undefined,
    )
  })

  it('saves, raises both the onboarding and management events, and shows a dismissible alert', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FederalTaxes companyId={COMPANY_ID} onEvent={onEvent} />, {
      unstableFeatures,
    })

    await openEditor(user)

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(onEvent).toHaveBeenCalledWith(
        componentEvents.COMPANY_MANAGEMENT_FEDERAL_TAXES_UPDATED,
        expect.anything(),
      )
    })
    // The wrapper adds a signal rather than replacing one, so a partner listening for the
    // onboarding events keeps hearing them.
    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_FEDERAL_TAXES_UPDATED,
      expect.anything(),
    )
    expect(onEvent).toHaveBeenCalledWith(componentEvents.COMPANY_FEDERAL_TAXES_DONE, undefined)

    expect(await screen.findByText('Federal tax settings updated.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit federal taxes' })).toBeInTheDocument()
  })
})
