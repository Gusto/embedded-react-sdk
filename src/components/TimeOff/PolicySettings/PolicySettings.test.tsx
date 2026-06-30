import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UnprocessableEntityError } from '@gusto/embedded-api-v-2026-06-15/models/errors/unprocessableentityerror'
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

vi.mock('@gusto/embedded-api-v-2026-06-15/react-query/timeOffPoliciesGet', () => ({
  useTimeOffPoliciesGetSuspense: () => ({
    data: { timeOffPolicy: mockPolicyData },
  }),
}))

vi.mock('@gusto/embedded-api-v-2026-06-15/react-query/timeOffPoliciesUpdate', () => ({
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

    it('shows accrual maximum and waiting period for per_pay_period', async () => {
      mockPolicyData = { ...basePolicyData, accrualMethod: 'per_pay_period' }
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Policy settings')).toBeInTheDocument()
      })
      expect(screen.getAllByText('Accrual maximum').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Waiting period').length).toBeGreaterThan(0)
    })

    it('hides accrual maximum and waiting period for per_anniversary_year', async () => {
      mockPolicyData = { ...basePolicyData, accrualMethod: 'per_anniversary_year' }
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Policy settings')).toBeInTheDocument()
      })
      expect(screen.queryAllByText('Accrual maximum')).toHaveLength(0)
      expect(screen.queryAllByText('Waiting period')).toHaveLength(0)
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
        const balanceInput = screen.getByRole('textbox', { name: /^Balance maximum/ })
        expect(balanceInput).toHaveAttribute('placeholder', '0')
        expect(balanceInput).not.toBeDisabled()
      })

      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(mockUpdateTimeOffPolicy).toHaveBeenCalledWith({
          request: {
            timeOffPolicyUuid: 'policy-123',
            requestBody: expect.objectContaining({
              version: 'version-abc',
              paidOutOnTermination: false,
            }),
          },
        })
      })

      await waitFor(() => {
        expect(onEvent).toHaveBeenCalledWith(
          componentEvents.TIME_OFF_POLICY_SETTINGS_DONE,
          expect.objectContaining({ complete: true }),
        )
      })
    })

    it('shows a friendly error when API returns LIMIT_VIOLATION_MAX_HOURS', async () => {
      const user = userEvent.setup()
      mockPolicyData = {
        ...basePolicyData,
        accrualMethod: 'per_hour_worked',
        maxHours: '200',
      }

      const apiError = new UnprocessableEntityError(
        {
          errors: [
            {
              errorKey: 'base',
              category: 'invalid_operation',
              message: 'LIMIT_VIOLATION_MAX_HOURS',
            },
          ],
        },
        {
          response: new Response(null, { status: 422 }),
          request: new Request('https://example.com'),
          body: '',
        },
      )
      mockUpdateTimeOffPolicy.mockRejectedValueOnce(apiError)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(
          screen.getByText(/balance maximum cannot be lower than an employee's current balance/i),
        ).toBeInTheDocument()
      })

      expect(screen.queryByText('LIMIT_VIOLATION_MAX_HOURS')).not.toBeInTheDocument()
    })

    it('nulls out accrual maximum and waiting period for all_at_once policies', async () => {
      const user = userEvent.setup()
      mockPolicyData = {
        ...basePolicyData,
        accrualMethod: 'per_anniversary_year',
      }
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(mockUpdateTimeOffPolicy).toHaveBeenCalledWith({
          request: {
            timeOffPolicyUuid: 'policy-123',
            requestBody: expect.objectContaining({
              maxAccrualHoursPerYear: null,
              accrualWaitingPeriodDays: null,
            }),
          },
        })
      })
    })
  })

  describe('update policy 422 error', () => {
    it('deduplicates identical error messages from a 422 response', async () => {
      const user = userEvent.setup()
      mockPolicyData = { ...basePolicyData, accrualMethod: 'per_calendar_year' }

      const { UnprocessableEntityError } =
        await import('@gusto/embedded-api-v-2026-06-15/models/errors/unprocessableentityerror')

      const duplicateMessage = 'Balance must be less than or equal to max balance (10.0)'
      const apiError = new UnprocessableEntityError(
        {
          errors: Array.from({ length: 5 }, () => ({
            errorKey: 'balance',
            category: 'invalid_attribute_value',
            message: duplicateMessage,
          })),
        },
        {
          response: new Response(null, { status: 422 }),
          request: new Request('https://example.com'),
          body: '',
        },
      )
      mockUpdateTimeOffPolicy.mockRejectedValueOnce(apiError)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(screen.getByText(/Unable to update policy settings/)).toBeInTheDocument()
      })

      const balanceErrors = screen.getAllByText(/Balance must be less than or equal to max balance/)
      expect(balanceErrors).toHaveLength(1)
    })

    it('re-throws non-UnprocessableEntityError errors unchanged', async () => {
      const user = userEvent.setup()
      mockPolicyData = { ...basePolicyData, accrualMethod: 'per_calendar_year' }

      mockUpdateTimeOffPolicy.mockRejectedValueOnce(new Error('Network failure'))

      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(screen.getByTestId('internal-error-card')).toBeInTheDocument()
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
