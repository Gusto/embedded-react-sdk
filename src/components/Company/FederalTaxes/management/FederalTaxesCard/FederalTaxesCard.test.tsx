import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { FederalTaxesCard } from './FederalTaxesCard'
import { server } from '@/test/mocks/server'
import { handleGetCompanyFederalTaxes } from '@/test/mocks/apis/company_federal_taxes'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

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

describe('FederalTaxesCard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(handleGetCompanyFederalTaxes(() => HttpResponse.json(fixtureFederalTaxes)))
  })

  it('renders the SDK error card instead of the card without the companySettingsDashboard flag', async () => {
    // The flag check throws; GustoProvider's top-level ErrorBoundary catches it
    // and renders InternalError in place of the card.
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithProviders(<FederalTaxesCard companyId="company-123" onEvent={onEvent} />)

    expect(await screen.findByTestId('internal-error-card')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()

    consoleErrorSpy.mockRestore()
  })

  it('renders the card title, the federal tax details, and an enabled Edit button once loaded', async () => {
    renderWithProviders(<FederalTaxesCard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    expect(screen.getByRole('heading', { name: 'Federal taxes' })).toBeInTheDocument()
    expect(screen.getByText('foobarbaz')).toBeInTheDocument()
    expect(screen.getByText('Sole proprietor')).toBeInTheDocument()
    expect(screen.getByText('944')).toBeInTheDocument()
  })

  it('reports EIN verification status rather than the EIN itself', async () => {
    renderWithProviders(<FederalTaxesCard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    // has_ein: true, ein_verified: false
    await waitFor(() => {
      expect(screen.getByText('Awaiting verification')).toBeInTheDocument()
    })

    server.use(
      handleGetCompanyFederalTaxes(() =>
        HttpResponse.json({ ...fixtureFederalTaxes, has_ein: false, ein_verified: false }),
      ),
    )
    renderWithProviders(<FederalTaxesCard companyId="company-456" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(screen.getByText('Not provided')).toBeInTheDocument()
    })
  })

  it('emits the edit-requested event with the company id when Edit is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FederalTaxesCard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_MANAGEMENT_FEDERAL_TAXES_EDIT_REQUESTED,
      { companyId: 'company-123' },
    )
  })
})
