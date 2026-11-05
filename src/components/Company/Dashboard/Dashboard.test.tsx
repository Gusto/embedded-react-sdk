import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { Dashboard } from './Dashboard'
import { DashboardFlow } from './DashboardFlow'
import { server } from '@/test/mocks/server'
import { handleGetIndustrySelection } from '@/test/mocks/apis/company'
import {
  basicLocation,
  getLocation,
  handleGetCompanyLocations,
} from '@/test/mocks/apis/company_locations'
import { handleGetCompanyFederalTaxes } from '@/test/mocks/apis/company_federal_taxes'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const unstableFeatures = { companySettingsDashboard: true }

describe('Company Dashboard', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      handleGetIndustrySelection(() =>
        HttpResponse.json({
          company_uuid: 'company-123',
          naics_code: '541511',
          title: 'Custom Computer Programming Services',
          sic_codes: ['7371'],
        }),
      ),
      handleGetCompanyLocations(() => HttpResponse.json([basicLocation])),
      getLocation,
      handleGetCompanyFederalTaxes(() =>
        HttpResponse.json({
          version: 'federal-tax-version',
          tax_payer_type: 'Sole proprietor',
          filing_form: '944',
          has_ein: true,
          ein_verified: true,
          legal_name: 'Test Company Legal',
        }),
      ),
    )
  })

  it('renders the SDK error card instead of the dashboard without the companySettingsDashboard flag', async () => {
    // The flag check throws; GustoProvider's top-level ErrorBoundary catches it
    // and renders InternalError in place of the dashboard.
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    renderWithProviders(<Dashboard companyId="company-123" onEvent={onEvent} />)

    expect(await screen.findByTestId('internal-error-card')).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Company details' })).toBeNull()

    consoleErrorSpy.mockRestore()
  })

  it('renders the company header and both tabs, defaulting to Company details', async () => {
    renderWithProviders(<Dashboard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    expect(await screen.findByRole('tab', { name: 'Company details' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Taxes' })).toBeInTheDocument()

    // Company details is the default tab: its two cards render.
    expect(await screen.findByRole('heading', { name: 'Industry' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Locations' })).toBeInTheDocument()
  })

  it('switches to the Taxes tab and emits the tab-change event', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dashboard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await user.click(await screen.findByRole('tab', { name: 'Taxes' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.COMPANY_DASHBOARD_TAB_CHANGE, {
      tab: 'taxes',
    })

    expect(await screen.findByRole('heading', { name: 'Federal taxes' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Industry' })).toBeNull()
  })

  it('honours a controlled selectedTab', async () => {
    renderWithProviders(
      <Dashboard companyId="company-123" onEvent={onEvent} selectedTab="taxes" />,
      { unstableFeatures },
    )

    expect(await screen.findByRole('heading', { name: 'Federal taxes' })).toBeInTheDocument()
  })

  it('forwards a card edit-requested event to onEvent', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dashboard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(onEvent).toHaveBeenCalledWith(
      componentEvents.COMPANY_MANAGEMENT_INDUSTRY_EDIT_REQUESTED,
      { companyId: 'company-123' },
    )
  })
})

describe('Company DashboardFlow', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      handleGetIndustrySelection(() =>
        HttpResponse.json({
          company_uuid: 'company-123',
          naics_code: '541511',
          title: 'Custom Computer Programming Services',
          sic_codes: ['7371'],
        }),
      ),
      handleGetCompanyLocations(() => HttpResponse.json([basicLocation])),
      getLocation,
      handleGetCompanyFederalTaxes(() =>
        HttpResponse.json({
          version: 'federal-tax-version',
          tax_payer_type: 'Sole proprietor',
          filing_form: '944',
          has_ein: true,
          ein_verified: true,
          legal_name: 'Test Company Legal',
        }),
      ),
    )
  })

  it('routes the Industry card Edit CTA to the Industry spoke and back again', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardFlow companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    // The spoke is the full Industry component, identified by its selector.
    expect(
      await screen.findByRole('combobox', { name: /Select your company's industry/i }),
    ).toBeInTheDocument()

    // The dashboard-owned back affordance is the reliable way out of a spoke.
    await user.click(screen.getByRole('button', { name: 'Back to company settings' }))

    expect(await screen.findByRole('tab', { name: 'Company details' })).toBeInTheDocument()
  })

  it('routes the Locations card Manage CTA to the Locations spoke', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardFlow companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage' }))

    expect(
      await screen.findByRole('button', { name: 'Back to company settings' }),
    ).toBeInTheDocument()
  })

  it('surfaces the Locations alert when the user leaves the spoke after a save', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardFlow companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage' }))

    // Saving an address keeps the spoke open rather than returning to the dashboard...
    // The list's rows arrive after its chrome, so wait for the row menu itself.
    await screen.findByRole('button', { name: 'Continue' })
    await user.click(await screen.findByRole('button', { name: 'Location actions' }))
    await user.click(await screen.findByTestId('edit-location'))

    // The edit form loads the address before it can be submitted.
    await screen.findByLabelText('Street 1')
    await user.click(await screen.findByTestId('location-submit'))

    // ...so the alert only appears once the user actually leaves it.
    await user.click(await screen.findByRole('button', { name: 'Continue' }))

    expect(await screen.findByText('Locations updated')).toBeInTheDocument()
  })

  it('leaves the Locations spoke without an alert when nothing was saved', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardFlow companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage' }))

    await user.click(await screen.findByRole('button', { name: 'Back to company settings' }))

    // The pending-alert slot is only filled by a save, so a look-and-leave visit
    // must not announce a change that never happened.
    expect(await screen.findByRole('tab', { name: 'Company details' })).toBeInTheDocument()
    expect(screen.queryByText('Locations updated')).toBeNull()
  })

  // Covers routing into the spoke only; driving a real federal-taxes save through the
  // form to assert the success alert is out of scope here.
  it('routes the Federal taxes card Edit CTA to its spoke from the Taxes tab', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardFlow companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await user.click(await screen.findByRole('tab', { name: 'Taxes' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(
      await screen.findByRole('button', { name: 'Back to company settings' }),
    ).toBeInTheDocument()
  })
})
