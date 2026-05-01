import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { StateTaxesList } from './StateTaxesList'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { server } from '@/test/mocks/server'
import { getEmptyAllStateTaxRequirements } from '@/test/mocks/apis/company_state_taxes'
import { API_BASE_URL } from '@/test/constants'

vi.mock('@/hooks/useContainerBreakpoints/useContainerBreakpoints', async () => {
  const actual = await vi.importActual('@/hooks/useContainerBreakpoints/useContainerBreakpoints')
  return {
    ...actual,
    default: () => ['base', 'small', 'medium'],
    useContainerBreakpoints: () => ['base', 'small', 'medium'],
  }
})

describe('StateTaxesList', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  beforeEach(() => {
    setupApiTestMocks()
    render(
      <GustoTestProvider>
        <StateTaxesList companyId="company-123" onEvent={onEvent} />
      </GustoTestProvider>,
    )
  })

  it('renders empty list of state taxes', async () => {
    server.use(getEmptyAllStateTaxRequirements)
    await waitFor(() => {
      expect(screen.getByTestId('emptydata')).toBeInTheDocument()
    })
  })

  it('renders list of state taxes', async () => {
    await waitFor(() => {
      expect(screen.getByText('California')).toBeInTheDocument()
      expect(screen.getByText('Washington')).toBeInTheDocument()
    })
  })

  it('fires continue event when "continue" is clicked', async () => {
    await waitFor(() => {
      const skeletonElements = document.querySelectorAll(
        'section[aria-busy="true"][aria-label="Loading component..."]',
      )
      expect(skeletonElements.length).toBe(0)
    })

    const continueButton = await screen.findByRole('button', { name: 'Continue' })
    await user.click(continueButton)

    expect(onEvent).toHaveBeenCalledWith(componentEvents.COMPANY_STATE_TAX_DONE)
  })

  it('fires edit state tax event when "edit" is clicked for California', async () => {
    const editButton = await screen.findByText('Edit')
    await user.click(editButton)

    expect(onEvent).toHaveBeenCalledWith(componentEvents.COMPANY_STATE_TAX_EDIT, {
      state: 'CA',
    })
  })

  describe('backward compatibility: setup_complete without setup_status', () => {
    it('shows "Complete" badge when setup_complete is true and setup_status is absent', async () => {
      await waitFor(() => {
        expect(screen.getByText('Complete')).toBeInTheDocument()
        expect(screen.getByText('Edit')).toBeInTheDocument()
      })
    })

    it('shows "In progress" badge when setup_complete is false and setup_status is absent', async () => {
      await waitFor(() => {
        expect(screen.getByText('In progress')).toBeInTheDocument()
        expect(screen.getByText('Continue setup')).toBeInTheDocument()
      })
    })
  })
})

function renderWithSingleState(state: object, onEvent = vi.fn()) {
  setupApiTestMocks()
  server.use(
    http.get(`${API_BASE_URL}/v1/companies/:company_id/tax_requirements`, () =>
      HttpResponse.json([state]),
    ),
  )
  render(
    <GustoTestProvider>
      <StateTaxesList companyId="company-123" onEvent={onEvent} />
    </GustoTestProvider>,
  )
  return { onEvent }
}

describe('setup_status: not_started', () => {
  const wyoming = { state: 'WY', setup_complete: false, setup_status: 'not_started' }

  it('shows "Not started" badge and "Start setup" button', async () => {
    renderWithSingleState(wyoming)
    await waitFor(() => {
      expect(screen.getByText('Wyoming')).toBeInTheDocument()
      expect(screen.getByText('Not started')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Start setup' })).toBeInTheDocument()
    })
  })

  it('fires COMPANY_STATE_TAX_EDIT with state "WY" when "Start setup" is clicked', async () => {
    const { onEvent } = renderWithSingleState(wyoming)
    const user = userEvent.setup()
    const startButton = await screen.findByRole('button', { name: 'Start setup' })
    await user.click(startButton)
    expect(onEvent).toHaveBeenCalledWith(componentEvents.COMPANY_STATE_TAX_EDIT, { state: 'WY' })
  })
})

describe('setup_status: in_progress', () => {
  const florida = { state: 'FL', setup_complete: false, setup_status: 'in_progress' }

  it('shows "In progress" badge and "Continue setup" button', async () => {
    renderWithSingleState(florida)
    await waitFor(() => {
      expect(screen.getByText('Florida')).toBeInTheDocument()
      expect(screen.getByText('In progress')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Continue setup' })).toBeInTheDocument()
    })
  })

  it('fires COMPANY_STATE_TAX_EDIT with state "FL" when "Continue setup" is clicked', async () => {
    const { onEvent } = renderWithSingleState(florida)
    const user = userEvent.setup()
    const continueButton = await screen.findByRole('button', { name: 'Continue setup' })
    await user.click(continueButton)
    expect(onEvent).toHaveBeenCalledWith(componentEvents.COMPANY_STATE_TAX_EDIT, { state: 'FL' })
  })
})

describe('setup_status: complete + default_rates_applied', () => {
  const georgia = {
    state: 'GA',
    setup_complete: true,
    setup_status: 'complete',
    default_rates_applied: true,
    ready_to_run_payroll: false,
  }

  it('shows "Complete" badge, "Default tax rates applied" subtext, and "Edit" button', async () => {
    renderWithSingleState(georgia)
    await waitFor(() => {
      expect(screen.getByText('Georgia')).toBeInTheDocument()
      expect(screen.getByText('Complete')).toBeInTheDocument()
      expect(screen.getByText('Default tax rates applied')).toBeInTheDocument()
      expect(screen.queryByText('Ready to run payroll')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    })
  })
})

describe('setup_status: complete + ready_to_run_payroll', () => {
  const california = {
    state: 'CA',
    setup_complete: true,
    setup_status: 'complete',
    default_rates_applied: false,
    ready_to_run_payroll: true,
  }

  it('shows "Complete" badge, "Ready to run payroll" badge, and "Edit" button', async () => {
    renderWithSingleState(california)
    await waitFor(() => {
      expect(screen.getByText('California')).toBeInTheDocument()
      expect(screen.getByText('Complete')).toBeInTheDocument()
      expect(screen.getByText('Ready to run payroll')).toBeInTheDocument()
      expect(screen.queryByText('Default tax rates applied')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    })
  })
})

describe('StateTaxesList with legacy setup_complete field only', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:company_id/tax_requirements`, () =>
        HttpResponse.json([
          { state: 'TX', setup_complete: true },
          { state: 'NY', setup_complete: false },
        ]),
      ),
    )
    render(
      <GustoTestProvider>
        <StateTaxesList companyId="company-123" onEvent={onEvent} />
      </GustoTestProvider>,
    )
  })

  it('falls back to "Complete" + "Edit" for setup_complete: true', async () => {
    await waitFor(() => {
      expect(screen.getByText('Texas')).toBeInTheDocument()
      expect(screen.getByText('Complete')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    })
  })

  it('falls back to "In progress" + "Continue setup" for setup_complete: false', async () => {
    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument()
      expect(screen.getByText('In progress')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Continue setup' })).toBeInTheDocument()
    })
  })
})
