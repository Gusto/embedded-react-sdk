import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { PolicyList } from './PolicyList'
import { server } from '@/test/mocks/server'
import { componentEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { API_BASE_URL } from '@/test/constants'

const mockPolicies = [
  {
    uuid: 'policy-1',
    company_uuid: 'company-123',
    name: 'Vacation',
    policy_type: 'vacation',
    accrual_method: 'per_pay_period',
    accrual_rate: '40.0',
    accrual_rate_unit: null,
    paid_out_on_termination: true,
    accrual_waiting_period_days: 0,
    carryover_limit_hours: null,
    max_accrual_hours_per_year: null,
    max_hours: null,
    complete: true,
    is_active: true,
    employees: [
      { uuid: 'emp-1', full_name: 'Alice' },
      { uuid: 'emp-2', full_name: 'Bob' },
    ],
  },
  {
    uuid: 'policy-2',
    company_uuid: 'company-123',
    name: 'Sick Leave',
    policy_type: 'sick',
    accrual_method: 'unlimited',
    accrual_rate: null,
    accrual_rate_unit: null,
    paid_out_on_termination: false,
    accrual_waiting_period_days: null,
    carryover_limit_hours: null,
    max_accrual_hours_per_year: null,
    max_hours: null,
    complete: false,
    is_active: true,
    employees: [],
  },
]

const mockEmployees = [
  {
    uuid: 'emp-1',
    first_name: 'Alice',
    last_name: 'Smith',
    email: 'alice@example.com',
  },
  {
    uuid: 'emp-2',
    first_name: 'Bob',
    last_name: 'Jones',
    email: 'bob@example.com',
  },
  {
    uuid: 'emp-3',
    first_name: 'Charlie',
    last_name: 'Brown',
    email: 'charlie@example.com',
  },
]

describe('PolicyList', () => {
  const onEvent = vi.fn()
  const user = userEvent.setup()
  const defaultProps = {
    companyId: 'company-123',
    onEvent,
  }

  beforeEach(() => {
    setupApiTestMocks()
    onEvent.mockClear()

    server.use(
      http.get(`${API_BASE_URL}/v1/companies/:companyUuid/time_off_policies`, () => {
        return HttpResponse.json(mockPolicies)
      }),
      http.get(`${API_BASE_URL}/v1/companies/:companyId/employees`, () => {
        return HttpResponse.json(mockEmployees)
      }),
    )
  })

  describe('rendering', () => {
    it('renders the page title', async () => {
      renderWithProviders(<PolicyList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Time Off Policies')).toBeInTheDocument()
      })
    })

    it('renders policy names in the table', async () => {
      renderWithProviders(<PolicyList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Vacation')).toBeInTheDocument()
      })
      expect(screen.getByText('Sick Leave')).toBeInTheDocument()
    })

    it('renders the create policy button when policies exist', async () => {
      renderWithProviders(<PolicyList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Create policy' })).toBeInTheDocument()
      })
    })

    it('renders enrolled display for policies with employees', async () => {
      renderWithProviders(<PolicyList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('2 employees')).toBeInTheDocument()
      })
    })

    it('renders dash for policies with no enrolled employees', async () => {
      renderWithProviders(<PolicyList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('\u2013')).toBeInTheDocument()
      })
    })

    it('renders "All employees" when all active employees are enrolled', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:companyId/employees`, () => {
          return HttpResponse.json(mockEmployees.slice(0, 2))
        }),
      )

      renderWithProviders(<PolicyList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('All employees')).toBeInTheDocument()
      })
    })

    it('renders Finish setup button for incomplete policies', async () => {
      renderWithProviders(<PolicyList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Finish setup' })).toBeInTheDocument()
      })
    })
  })

  describe('empty state', () => {
    it('renders empty state when no policies exist', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:companyUuid/time_off_policies`, () => {
          return HttpResponse.json([])
        }),
      )

      renderWithProviders(<PolicyList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText("You don't have any time off policies")).toBeInTheDocument()
      })
      expect(screen.getByText('Manage employee time off by creating a policy.')).toBeInTheDocument()
    })

    it('renders create policy button in empty state', async () => {
      server.use(
        http.get(`${API_BASE_URL}/v1/companies/:companyUuid/time_off_policies`, () => {
          return HttpResponse.json([])
        }),
      )

      renderWithProviders(<PolicyList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Create policy' })).toBeInTheDocument()
      })
    })
  })

  describe('navigation events', () => {
    it('emits TIME_OFF_CREATE_POLICY event when create policy button is clicked', async () => {
      renderWithProviders(<PolicyList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Create policy' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Create policy' }))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.TIME_OFF_CREATE_POLICY)
    })

    it('emits TIME_OFF_VIEW_POLICY event when edit policy is clicked from menu', async () => {
      renderWithProviders(<PolicyList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Vacation')).toBeInTheDocument()
      })

      const menuButtons = screen.getAllByRole('button', { name: 'Open menu' })
      await user.click(menuButtons[0]!)

      await waitFor(() => {
        expect(screen.getByText('Edit policy')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Edit policy'))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.TIME_OFF_VIEW_POLICY, {
        policyId: 'policy-1',
        policyType: 'vacation',
      })
    })

    it('emits TIME_OFF_VIEW_POLICY event when finish setup is clicked', async () => {
      renderWithProviders(<PolicyList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Finish setup' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Finish setup' }))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.TIME_OFF_VIEW_POLICY, {
        policyId: 'policy-2',
        policyType: 'sick',
      })
    })
  })

  describe('delete policy', () => {
    it('opens delete confirmation dialog when delete is clicked from menu', async () => {
      renderWithProviders(<PolicyList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Vacation')).toBeInTheDocument()
      })

      const menuButtons = screen.getAllByRole('button', { name: 'Open menu' })
      await user.click(menuButtons[0]!)

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: 'Delete policy' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('menuitem', { name: 'Delete policy' }))

      await waitFor(() => {
        expect(
          screen.getByText('Are you sure you want to delete the policy "Vacation"?'),
        ).toBeInTheDocument()
      })
    })

    it('calls deactivate API and shows success alert on confirm', async () => {
      server.use(
        http.put(`${API_BASE_URL}/v1/time_off_policies/:timeOffPolicyUuid/deactivate`, () => {
          return HttpResponse.json({
            uuid: 'policy-1',
            company_uuid: 'company-123',
            name: 'Vacation',
            policy_type: 'vacation',
            accrual_method: 'per_pay_period',
            is_active: false,
            employees: [],
          })
        }),
      )

      renderWithProviders(<PolicyList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Vacation')).toBeInTheDocument()
      })

      const menuButtons = screen.getAllByRole('button', { name: 'Open menu' })
      await user.click(menuButtons[0]!)

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: 'Delete policy' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('menuitem', { name: 'Delete policy' }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const dialog = screen.getByRole('dialog')
      await user.click(within(dialog).getByRole('button', { name: 'Delete policy' }))

      await waitFor(() => {
        expect(screen.getByText('Policy "Vacation" deleted successfully')).toBeInTheDocument()
      })
    })

    it('closes dialog when cancel is clicked', async () => {
      renderWithProviders(<PolicyList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Vacation')).toBeInTheDocument()
      })

      const menuButtons = screen.getAllByRole('button', { name: 'Open menu' })
      await user.click(menuButtons[0]!)

      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: 'Delete policy' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('menuitem', { name: 'Delete policy' }))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })
})
