import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, type HttpResponseResolver } from 'msw'
import { Dashboard } from './Dashboard'
import { DashboardFlow } from './DashboardFlow'
import { server } from '@/test/mocks/server'
import { handleGetIndustrySelection } from '@/test/mocks/apis/company'
import { API_BASE_URL } from '@/test/constants'
import {
  basicLocation,
  getLocation,
  handleGetCompanyLocations,
} from '@/test/mocks/apis/company_locations'
import { handleGetCompanyFederalTaxes } from '@/test/mocks/apis/company_federal_taxes'
import { handleGetCompanyBankAccounts } from '@/test/mocks/apis/company_bank_accounts'
import {
  handleGetPaySchedules,
  handleGetPayScheduleAssignments,
} from '@/test/mocks/apis/payschedule'
import { getAllStateTaxRequirementsWithStatus } from '@/test/mocks/apis/company_state_taxes'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const unstableFeatures = { companySettingsDashboard: true }
const unstableFeaturesWithPaySchedules = {
  companySettingsDashboard: true,
  managePaySchedules: true,
}
const unstableFeaturesWithTaxPayments = {
  companySettingsDashboard: true,
  taxPayments: true,
}

const fixturePaySchedule = {
  uuid: 'schedule-1',
  version: 'schedule-version',
  frequency: 'Every other week',
  custom_name: 'Biweekly',
  name: 'Biweekly',
  anchor_pay_date: '2025-01-10',
  anchor_end_of_pay_period: '2025-01-05',
  active: true,
  auto_payroll: false,
}

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
      handleGetCompanyBankAccounts(() =>
        HttpResponse.json([
          {
            uuid: 'bank-1',
            company_uuid: 'company-123',
            account_type: 'Checking',
            routing_number: '851070439',
            hidden_account_number: 'XXXX4087',
            verification_status: 'verified',
            name: 'Employer Funding Account',
          },
        ]),
      ),
      handleGetPayScheduleAssignments(() =>
        HttpResponse.json({ type: 'single', default_pay_schedule_uuid: 'schedule-1' }),
      ),
      handleGetPaySchedules(() => HttpResponse.json([fixturePaySchedule])),
      getAllStateTaxRequirementsWithStatus,
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

    expect(await screen.findByRole('heading', { name: 'Test Company' })).toBeInTheDocument()
    expect(await screen.findByRole('tab', { name: 'Company details' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Pay' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Taxes' })).toBeInTheDocument()

    // Company details is the default tab: its two cards render.
    expect(await screen.findByRole('heading', { name: 'Industry' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Locations' })).toBeInTheDocument()
  })

  it('keeps the tabs and cards usable when the company name fails to load', async () => {
    const user = userEvent.setup()
    const getCompanyResolver = vi.fn<HttpResponseResolver>(() => HttpResponse.error())
    server.use(http.get(`${API_BASE_URL}/v1/companies/:company_id`, getCompanyResolver))

    renderWithProviders(<Dashboard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(getCompanyResolver).toHaveBeenCalled()
    })

    // The heading is the only casualty: each card fetches its own data and survives.
    expect(await screen.findByRole('heading', { name: 'Industry' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Locations' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Test Company' })).toBeNull()

    // The surface also stays interactive, rather than being swapped for the error card.
    await user.click(await screen.findByRole('tab', { name: 'Taxes' }))

    expect(await screen.findByRole('heading', { name: 'Federal taxes' })).toBeInTheDocument()
    expect(screen.queryByTestId('internal-error-card')).toBeNull()
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

  it('switches to the Pay tab and renders the bank account card', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dashboard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await user.click(await screen.findByRole('tab', { name: 'Pay' }))

    expect(onEvent).toHaveBeenCalledWith(componentEvents.COMPANY_DASHBOARD_TAB_CHANGE, {
      tab: 'pay',
    })
    expect(await screen.findByRole('heading', { name: 'Bank account' })).toBeInTheDocument()
  })

  it('renders the Pay schedules card on the Pay tab when managePaySchedules is also on', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dashboard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures: unstableFeaturesWithPaySchedules,
    })

    await user.click(await screen.findByRole('tab', { name: 'Pay' }))

    expect(await screen.findByRole('heading', { name: 'Pay schedules' })).toBeInTheDocument()
    expect(await screen.findByText('Biweekly')).toBeInTheDocument()
  })

  it('omits the Pay schedules card without managePaySchedules, leaving the rest of the tab intact', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dashboard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await user.click(await screen.findByRole('tab', { name: 'Pay' }))

    // The card is omitted rather than throwing: the dashboard still renders, and the
    // rest of the Pay tab is unaffected.
    expect(await screen.findByRole('heading', { name: 'Bank account' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Pay schedules' })).toBeNull()
  })

  it('stacks the Federal and State taxes cards on the Taxes tab', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dashboard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await user.click(await screen.findByRole('tab', { name: 'Taxes' }))

    expect(await screen.findByRole('heading', { name: 'Federal taxes' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'State taxes' })).toBeInTheDocument()
    expect(await screen.findByText('Wyoming')).toBeInTheDocument()
  })

  it('renders the Tax payments card on the Taxes tab when taxPayments is also on', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dashboard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures: unstableFeaturesWithTaxPayments,
    })

    await user.click(await screen.findByRole('tab', { name: 'Taxes' }))

    expect(await screen.findByRole('heading', { name: 'Tax payments' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Manage tax payments' })).toBeInTheDocument()
  })

  it('omits the Tax payments card without taxPayments, leaving the rest of the tab intact', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dashboard companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await user.click(await screen.findByRole('tab', { name: 'Taxes' }))

    // The card is omitted rather than throwing: the dashboard still renders, and the
    // rest of the Taxes tab is unaffected.
    expect(await screen.findByRole('heading', { name: 'Federal taxes' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'State taxes' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Tax payments' })).toBeNull()
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
      expect(screen.getByRole('button', { name: 'Edit industry' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: 'Edit industry' }))

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
      handleGetCompanyBankAccounts(() =>
        HttpResponse.json([
          {
            uuid: 'bank-1',
            company_uuid: 'company-123',
            account_type: 'Checking',
            routing_number: '851070439',
            hidden_account_number: 'XXXX4087',
            verification_status: 'verified',
            name: 'Employer Funding Account',
          },
        ]),
      ),
      handleGetPayScheduleAssignments(() =>
        HttpResponse.json({ type: 'single', default_pay_schedule_uuid: 'schedule-1' }),
      ),
      handleGetPaySchedules(() => HttpResponse.json([fixturePaySchedule])),
      getAllStateTaxRequirementsWithStatus,
    )
  })

  it('routes the Industry card Edit CTA to the Industry spoke and back again', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardFlow companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit industry' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit industry' }))

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
      expect(screen.getByRole('button', { name: 'Manage locations' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage locations' }))

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
      expect(screen.getByRole('button', { name: 'Manage locations' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage locations' }))

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
      expect(screen.getByRole('button', { name: 'Manage locations' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage locations' }))

    await user.click(await screen.findByRole('button', { name: 'Back to company settings' }))

    // The pending-alert slot is only filled by a save, so a look-and-leave visit
    // must not announce a change that never happened.
    expect(await screen.findByRole('tab', { name: 'Company details' })).toBeInTheDocument()
    expect(screen.queryByText('Locations updated')).toBeNull()
  })

  it('leaves the Bank account spoke without an alert when nothing was saved', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardFlow companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await user.click(await screen.findByRole('tab', { name: 'Pay' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage bank account' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage bank account' }))

    // Continue fires COMPANY_BANK_ACCOUNT_DONE whether or not the account changed, so
    // a look-and-leave visit must not announce an update that never happened.
    await user.click(await screen.findByRole('button', { name: 'Continue' }))

    expect(await screen.findByRole('tab', { name: 'Pay' })).toBeInTheDocument()
    expect(screen.queryByText('Bank account updated')).toBeNull()
  })

  it('surfaces the Bank account alert when the user leaves the spoke after a save', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardFlow companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await user.click(await screen.findByRole('tab', { name: 'Pay' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage bank account' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage bank account' }))

    // Replacing the account keeps the spoke open rather than returning to the dashboard...
    await user.click(await screen.findByRole('button', { name: 'Change bank account' }))
    await user.type(await screen.findByLabelText('Routing number'), '851070439')
    await user.type(screen.getByLabelText('Account number'), '1234567890')
    await user.click(screen.getByTestId('bank-account-submit'))

    // ...so the alert only surfaces once the user actually leaves, including via the
    // back header, which announced nothing before.
    await user.click(await screen.findByRole('button', { name: 'Back to company settings' }))

    expect(await screen.findByText('Bank account updated')).toBeInTheDocument()
  })

  it('routes the Pay schedules card Manage CTA to the PaySchedule spoke', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardFlow companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures: unstableFeaturesWithPaySchedules,
    })

    await user.click(await screen.findByRole('tab', { name: 'Pay' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage pay schedules' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage pay schedules' }))

    expect(
      await screen.findByRole('button', { name: 'Back to company settings' }),
    ).toBeInTheDocument()
  })

  it('routes the State taxes card Manage CTA to the StateTaxes spoke', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardFlow companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures,
    })

    await user.click(await screen.findByRole('tab', { name: 'Taxes' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage state taxes' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage state taxes' }))

    expect(
      await screen.findByRole('button', { name: 'Back to company settings' }),
    ).toBeInTheDocument()
  })

  it('routes the Tax payments card Manage CTA to the TaxPayments spoke', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DashboardFlow companyId="company-123" onEvent={onEvent} />, {
      unstableFeatures: unstableFeaturesWithTaxPayments,
    })

    await user.click(await screen.findByRole('tab', { name: 'Taxes' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage tax payments' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Manage tax payments' }))

    expect(
      await screen.findByRole('button', { name: 'Back to company settings' }),
    ).toBeInTheDocument()
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
      expect(screen.getByRole('button', { name: 'Edit federal taxes' })).toBeEnabled()
    })
    await user.click(screen.getByRole('button', { name: 'Edit federal taxes' }))

    expect(
      await screen.findByRole('button', { name: 'Back to company settings' }),
    ).toBeInTheDocument()
  })
})
