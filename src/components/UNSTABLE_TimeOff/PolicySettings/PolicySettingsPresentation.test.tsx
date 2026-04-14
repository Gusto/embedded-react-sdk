import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PolicySettingsPresentation } from './PolicySettingsPresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

function renderHoursWorked(overrides = {}) {
  return renderWithProviders(
    <PolicySettingsPresentation
      accrualMethod="hours_worked"
      onContinue={handlers.onContinue}
      onBack={handlers.onBack}
      {...overrides}
    />,
  )
}

function renderFixed(overrides = {}) {
  return renderWithProviders(
    <PolicySettingsPresentation
      accrualMethod="fixed"
      onContinue={handlers.onContinue}
      onBack={handlers.onBack}
      {...overrides}
    />,
  )
}

const handlers = {
  onContinue: vi.fn(),
  onBack: vi.fn(),
}

describe('PolicySettingsPresentation', () => {
  beforeEach(() => {
    handlers.onContinue.mockClear()
    handlers.onBack.mockClear()
  })

  describe('rendering - hours worked variant', () => {
    it('renders the heading', async () => {
      renderHoursWorked()

      await waitFor(() => {
        expect(screen.getByText('Policy settings')).toBeInTheDocument()
      })
    })

    it('renders all five setting fields', async () => {
      renderHoursWorked()

      await waitFor(() => {
        expect(screen.getAllByText('Accrual maximum').length).toBeGreaterThan(0)
      })
      expect(screen.getAllByText('Balance maximum').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Carry over limit').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Waiting period').length).toBeGreaterThan(0)
      expect(screen.getByText('Payout on dismissal')).toBeInTheDocument()
    })

    it('renders description text for each field', async () => {
      renderHoursWorked()

      await waitFor(() => {
        expect(
          screen.getByText(
            'The maximum balance an employee can accrue per period. Accrual will stop when this limit is reached.',
          ),
        ).toBeInTheDocument()
      })
      expect(
        screen.getByText(
          'The maximum balance an employee can hold at once. Accrual stops when this limit is reached.',
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'The maximum hours allowed to carryover from one accrual period to the next.',
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'The number of days employees must work before they begin accruing time off.',
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Choose if unused time off is paid out when an employee leaves. Some states require it by law.',
        ),
      ).toBeInTheDocument()
    })

    it('renders Back and Save buttons', async () => {
      renderHoursWorked()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    it('renders toggle switches for optional numeric fields', async () => {
      renderHoursWorked()

      await waitFor(() => {
        expect(screen.getAllByRole('switch')).toHaveLength(5)
      })
    })
  })

  describe('rendering - fixed variant', () => {
    it('renders only three setting fields', async () => {
      renderFixed()

      await waitFor(() => {
        expect(screen.getAllByText('Balance maximum').length).toBeGreaterThan(0)
      })
      expect(screen.getAllByText('Carry over limit').length).toBeGreaterThan(0)
      expect(screen.getByText('Payout on dismissal')).toBeInTheDocument()
    })

    it('does not render accrual maximum or waiting period', async () => {
      renderFixed()

      await waitFor(() => {
        expect(screen.getAllByText('Balance maximum').length).toBeGreaterThan(0)
      })
      expect(screen.queryAllByText('Accrual maximum')).toHaveLength(0)
      expect(screen.queryAllByText('Waiting period')).toHaveLength(0)
    })

    it('renders three toggle switches', async () => {
      renderFixed()

      await waitFor(() => {
        expect(screen.getAllByRole('switch')).toHaveLength(3)
      })
    })
  })

  describe('toggle interaction', () => {
    it('enables the balance maximum input when its toggle is switched on', async () => {
      const user = userEvent.setup()
      renderFixed()

      await waitFor(() => {
        expect(screen.getAllByText('Balance maximum').length).toBeGreaterThan(0)
      })

      const balanceInputs = screen.getAllByPlaceholderText('Number of hours')
      expect(balanceInputs[0]).toBeDisabled()

      const balanceSwitches = screen
        .getAllByRole('switch')
        .filter(s => s.getAttribute('aria-label') === 'Balance maximum')
      expect(balanceSwitches).toHaveLength(1)
      const balanceSwitch = balanceSwitches[0]
      if (!balanceSwitch) throw new Error('Balance switch not found')
      await user.click(balanceSwitch)

      await waitFor(() => {
        expect(screen.getAllByPlaceholderText('Number of hours')[0]).not.toBeDisabled()
      })
    })
  })

  describe('edit mode - pre-populated values', () => {
    it('renders with pre-populated toggle states', async () => {
      renderHoursWorked({
        defaultValues: {
          balanceMaximumEnabled: true,
          balanceMaximum: 200,
          paidOutOnTermination: true,
        },
      })

      await waitFor(() => {
        const switches = screen.getAllByRole('switch')
        const balanceSwitch = switches.find(s => s.getAttribute('aria-label') === 'Balance maximum')
        expect(balanceSwitch).toBeChecked()
      })
    })

    it('renders payout toggle as checked when defaulted to true', async () => {
      renderHoursWorked({
        defaultValues: { paidOutOnTermination: true },
      })

      await waitFor(() => {
        const switches = screen.getAllByRole('switch')
        const payoutSwitch = switches.find(
          s => s.getAttribute('aria-label') === 'Payout on dismissal',
        )
        expect(payoutSwitch).toBeChecked()
      })
    })
  })

  describe('form submission', () => {
    it('calls onContinue with form data when submitted', async () => {
      const user = userEvent.setup()
      renderHoursWorked({
        defaultValues: {
          balanceMaximumEnabled: true,
          balanceMaximum: 100,
          paidOutOnTermination: true,
        },
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(handlers.onContinue).toHaveBeenCalledWith(
          expect.objectContaining({
            balanceMaximumEnabled: true,
            balanceMaximum: 100,
            paidOutOnTermination: true,
          }),
        )
      })
    })

    it('calls onBack when Back button is clicked', async () => {
      const user = userEvent.setup()
      renderHoursWorked()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Back' }))
      expect(handlers.onBack).toHaveBeenCalledOnce()
    })
  })

  describe('accessibility', () => {
    it('should not have any accessibility violations - hours worked variant', async () => {
      const { container } = renderHoursWorked()

      await waitFor(() => {
        expect(screen.getByText('Policy settings')).toBeInTheDocument()
      })

      await expectNoAxeViolations(container)
    })

    it('should not have any accessibility violations - fixed variant', async () => {
      const { container } = renderFixed()

      await waitFor(() => {
        expect(screen.getByText('Policy settings')).toBeInTheDocument()
      })

      await expectNoAxeViolations(container)
    })

    it('should not have any accessibility violations - edit mode', async () => {
      const { container } = renderHoursWorked({
        defaultValues: {
          accrualMaximumEnabled: true,
          accrualMaximum: 100,
          balanceMaximumEnabled: true,
          balanceMaximum: 200,
          paidOutOnTermination: true,
        },
      })

      await waitFor(() => {
        expect(screen.getByText('Policy settings')).toBeInTheDocument()
      })

      await expectNoAxeViolations(container)
    })
  })
})
