import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PolicySettings } from './PolicySettings'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

const mockUpdateTimeOffPolicy = vi.fn()

const basePolicyData: Record<string, unknown> = {
  uuid: 'policy-123',
  companyUuid: 'company-456',
  name: 'Vacation Policy',
  policyType: 'vacation',
  accrualMethod: 'per_hour_worked',
  isActive: true,
  employees: [],
  version: 'version-abc',
}

let mockPolicyData: Record<string, unknown> = { ...basePolicyData }

vi.mock('@gusto/embedded-api/react-query/timeOffPoliciesGet', () => ({
  useTimeOffPoliciesGetSuspense: () => ({
    data: { timeOffPolicy: mockPolicyData },
  }),
}))

vi.mock('@gusto/embedded-api/react-query/timeOffPoliciesUpdate', () => ({
  useTimeOffPoliciesUpdateMutation: () => ({
    mutateAsync: mockUpdateTimeOffPolicy,
    isPending: false,
  }),
}))

describe('PolicySettings container', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    onEvent.mockClear()
    mockUpdateTimeOffPolicy.mockClear()
    mockUpdateTimeOffPolicy.mockResolvedValue({
      timeOffPolicy: { ...mockPolicyData, complete: true },
    })
    mockPolicyData = { ...basePolicyData }
  })

  function renderComponent(props = {}) {
    return renderWithProviders(
      <PolicySettings onEvent={onEvent} policyId="policy-123" {...props} />,
    )
  }

  describe('hours_worked variant', () => {
    it('renders the presentation with hours_worked fields', async () => {
      mockPolicyData = { ...basePolicyData, accrualMethod: 'per_hour_worked' }
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Policy settings')).toBeInTheDocument()
      })
      expect(screen.getAllByText('Accrual maximum').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Waiting period').length).toBeGreaterThan(0)
    })

    it('also treats per_hour_paid as hours_worked', async () => {
      mockPolicyData = { ...basePolicyData, accrualMethod: 'per_hour_paid' }
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Policy settings')).toBeInTheDocument()
      })
      expect(screen.getAllByText('Accrual maximum').length).toBeGreaterThan(0)
    })

    it('also treats per_hour_worked_no_overtime as hours_worked', async () => {
      mockPolicyData = { ...basePolicyData, accrualMethod: 'per_hour_worked_no_overtime' }
      renderComponent()

      await waitFor(() => {
        expect(screen.getAllByText('Accrual maximum').length).toBeGreaterThan(0)
      })
    })

    it('also treats per_hour_paid_no_overtime as hours_worked', async () => {
      mockPolicyData = { ...basePolicyData, accrualMethod: 'per_hour_paid_no_overtime' }
      renderComponent()

      await waitFor(() => {
        expect(screen.getAllByText('Accrual maximum').length).toBeGreaterThan(0)
      })
    })
  })

  describe('fixed variant', () => {
    it('renders without accrual maximum or waiting period for per_calendar_year', async () => {
      mockPolicyData = { ...basePolicyData, accrualMethod: 'per_calendar_year' }
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Policy settings')).toBeInTheDocument()
      })
      expect(screen.queryAllByText('Accrual maximum')).toHaveLength(0)
      expect(screen.queryAllByText('Waiting period')).toHaveLength(0)
    })

    it('also treats per_pay_period as fixed', async () => {
      mockPolicyData = { ...basePolicyData, accrualMethod: 'per_pay_period' }
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Policy settings')).toBeInTheDocument()
      })
      expect(screen.queryAllByText('Accrual maximum')).toHaveLength(0)
    })

    it('also treats per_anniversary_year as fixed', async () => {
      mockPolicyData = { ...basePolicyData, accrualMethod: 'per_anniversary_year' }
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Policy settings')).toBeInTheDocument()
      })
      expect(screen.queryAllByText('Accrual maximum')).toHaveLength(0)
    })
  })

  describe('default values from API', () => {
    it('maps API fields to form default values', async () => {
      mockPolicyData = {
        ...basePolicyData,
        accrualMethod: 'per_hour_worked',
        maxAccrualHoursPerYear: '100',
        maxHours: '200',
        carryoverLimitHours: '50',
        accrualWaitingPeriodDays: 30,
        paidOutOnTermination: true,
      }
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Policy settings')).toBeInTheDocument()
      })

      const switches = screen.getAllByRole('switch')
      const accrualMaxSwitch = switches.find(
        s => s.getAttribute('aria-label') === 'Accrual maximum',
      )
      const balanceMaxSwitch = switches.find(
        s => s.getAttribute('aria-label') === 'Balance maximum',
      )
      const carryOverSwitch = switches.find(
        s => s.getAttribute('aria-label') === 'Carry over limit',
      )
      const waitingPeriodSwitch = switches.find(
        s => s.getAttribute('aria-label') === 'Waiting period',
      )
      const payoutSwitch = switches.find(
        s => s.getAttribute('aria-label') === 'Payout on dismissal',
      )

      expect(accrualMaxSwitch).toBeChecked()
      expect(balanceMaxSwitch).toBeChecked()
      expect(carryOverSwitch).toBeChecked()
      expect(waitingPeriodSwitch).toBeChecked()
      expect(payoutSwitch).toBeChecked()
    })
  })

  describe('form submission', () => {
    it('calls the update API and emits DONE on submit', async () => {
      const user = userEvent.setup()
      mockPolicyData = {
        ...basePolicyData,
        accrualMethod: 'per_calendar_year',
      }
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      })

      const balanceSwitches = screen
        .getAllByRole('switch')
        .filter(s => s.getAttribute('aria-label') === 'Balance maximum')
      if (!balanceSwitches[0]) throw new Error('Balance switch not found')
      await user.click(balanceSwitches[0])

      await waitFor(() => {
        expect(screen.getAllByPlaceholderText('Number of hours')[0]).not.toBeDisabled()
      })

      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(mockUpdateTimeOffPolicy).toHaveBeenCalledWith({
          request: {
            timeOffPolicyUuid: 'policy-123',
            requestBody: expect.objectContaining({
              complete: true,
              version: 'version-abc',
              paidOutOnTermination: false,
            }),
          },
        })
      })

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(componentEvents.TIME_OFF_POLICY_SETTINGS_DONE)
      })
    })
  })

  describe('back navigation', () => {
    it('emits POLICY_SETTINGS_BACK when Back is clicked', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Back' }))

      expect(onEvent).toHaveBeenCalledWith(componentEvents.TIME_OFF_POLICY_SETTINGS_BACK)
    })
  })

  describe('accessibility', () => {
    it('should not have any accessibility violations', async () => {
      mockPolicyData = { ...basePolicyData, accrualMethod: 'per_hour_worked' }
      const { container } = renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Policy settings')).toBeInTheDocument()
      })

      await expectNoAxeViolations(container)
    })
  })
})
