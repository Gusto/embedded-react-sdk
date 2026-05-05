import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TimeOffPolicyDetail } from './TimeOffPolicyDetail'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

const mockRemoveEmployees = vi.fn()
const mockUpdateBalance = vi.fn()

const basePolicyData = {
  uuid: 'policy-123',
  companyUuid: 'company-456',
  name: 'Vacation Policy',
  policyType: 'vacation',
  accrualMethod: 'per_hour_worked',
  accrualRate: '2.0',
  accrualRateUnit: '20.0',
  policyResetDate: '01-01',
  isActive: true,
  paidOutOnTermination: true,
  maxAccrualHoursPerYear: null,
  maxHours: '240',
  carryoverLimitHours: null,
  accrualWaitingPeriodDays: null,
  complete: true,
  version: 'version-abc',
  employees: [
    { uuid: 'emp-1', balance: '80' },
    { uuid: 'emp-2', balance: '120.5' },
    { uuid: 'emp-3', balance: null },
  ],
}

let mockPolicyData = { ...basePolicyData }

vi.mock('@gusto/embedded-api/react-query/timeOffPoliciesGet', () => ({
  useTimeOffPoliciesGetSuspense: () => ({
    data: { timeOffPolicy: mockPolicyData },
  }),
}))

vi.mock('@gusto/embedded-api/react-query/timeOffPoliciesRemoveEmployees', () => ({
  useTimeOffPoliciesRemoveEmployeesMutation: () => ({
    mutateAsync: mockRemoveEmployees,
    isPending: false,
  }),
}))

vi.mock('@gusto/embedded-api/react-query/timeOffPoliciesUpdateBalance', () => ({
  useTimeOffPoliciesUpdateBalanceMutation: () => ({
    mutateAsync: mockUpdateBalance,
    isPending: false,
  }),
}))

describe('TimeOffPolicyDetail', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockRemoveEmployees.mockResolvedValue({ timeOffPolicy: mockPolicyData })
    mockUpdateBalance.mockResolvedValue({ timeOffPolicy: mockPolicyData })
    mockPolicyData = { ...basePolicyData }
  })

  function renderComponent(props = {}) {
    return renderWithProviders(
      <TimeOffPolicyDetail onEvent={onEvent} policyId="policy-123" {...props} />,
    )
  }

  describe('rendering', () => {
    it('renders the policy title from API data', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Vacation Policy' })).toBeInTheDocument()
      })
    })

    it('renders the details tab with accrual information', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Based on hours worked')).toBeInTheDocument()
      })
      expect(screen.getByText('January 1')).toBeInTheDocument()
    })

    it('renders the settings card for non-unlimited policies', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Policy settings')).toBeInTheDocument()
      })
      expect(screen.getByText('240 hour(s)')).toBeInTheDocument()
    })

    it('hides settings card for unlimited policies', async () => {
      mockPolicyData = { ...basePolicyData, accrualMethod: 'unlimited' }
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Details')).toBeInTheDocument()
      })
      expect(screen.queryByText('Policy settings')).not.toBeInTheDocument()
    })

    it('renders action buttons', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add employee/i })).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: /edit policy/i })).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('emits TIME_OFF_BACK_TO_LIST when back is clicked', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /time off policies/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /time off policies/i }))
      expect(onEvent).toHaveBeenCalledWith(componentEvents.TIME_OFF_BACK_TO_LIST)
    })
  })

  describe('employee removal', () => {
    it('calls the remove API when confirming single removal from employees tab', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Vacation Policy' })).toBeInTheDocument()
      })

      const tabSelect = screen.getByRole('button', { name: /Vacation Policy/i })
      await user.click(tabSelect)
      const employeesOption = await screen.findByRole('option', { name: 'Employees' })
      await user.click(employeesOption)

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /actions/i }).length).toBeGreaterThan(0)
      })

      const hamburgerButtons = screen.getAllByRole('button', { name: /actions/i })
      await user.click(hamburgerButtons[0]!)

      const removeOption = await screen.findByText('Remove employee')
      await user.click(removeOption)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Remove' }))

      await waitFor(() => {
        expect(mockRemoveEmployees).toHaveBeenCalledWith({
          request: {
            timeOffPolicyUuid: 'policy-123',
            requestBody: { employees: [{ uuid: 'emp-1' }] },
          },
        })
      })
    })
  })

  describe('balance editing', () => {
    it('opens the edit balance modal from the employee menu', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Vacation Policy' })).toBeInTheDocument()
      })

      const tabSelect = screen.getByRole('button', { name: /Vacation Policy/i })
      await user.click(tabSelect)
      const employeesOption = await screen.findByRole('option', { name: 'Employees' })
      await user.click(employeesOption)

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /actions/i }).length).toBeGreaterThan(0)
      })

      const hamburgerButtons = screen.getAllByRole('button', { name: /actions/i })
      await user.click(hamburgerButtons[0]!)

      const editOption = await screen.findByText('Edit balance')
      await user.click(editOption)

      await waitFor(() => {
        expect(screen.getByText(/edit.*time off balance/i)).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('should not have accessibility violations on details tab', async () => {
      const { container } = renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Vacation Policy' })).toBeInTheDocument()
      })

      await expectNoAxeViolations(container)
    })
  })
})
