import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PolicyConfigurationFormPresentation } from './PolicyConfigurationFormPresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('PolicyConfigurationFormPresentation', () => {
  const defaultProps = {
    onContinue: vi.fn(),
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    defaultProps.onContinue.mockClear()
    defaultProps.onCancel.mockClear()
  })

  describe('rendering', () => {
    it('renders the heading', async () => {
      renderWithProviders(<PolicyConfigurationFormPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Policy details')).toBeInTheDocument()
      })
    })

    it('renders the policy name field', async () => {
      renderWithProviders(<PolicyConfigurationFormPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Policy name')).toBeInTheDocument()
      })
    })

    it('renders all three accrual method radio options', async () => {
      renderWithProviders(<PolicyConfigurationFormPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Based on hours worked')).toBeInTheDocument()
      })
      expect(screen.getByText('Fixed amount per year')).toBeInTheDocument()
      expect(screen.getByText('Unlimited')).toBeInTheDocument()
    })

    it('renders descriptions for each accrual method option', async () => {
      renderWithProviders(<PolicyConfigurationFormPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByText(
            'Employees earn time off based on hours worked (e.g., 1 hour for every 40 hours worked).',
          ),
        ).toBeInTheDocument()
      })
      expect(
        screen.getByText(
          'Employees earn a set amount of time off each year. (e.g., 120 hours per year).',
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Employees can take flexible time off with no set limit.'),
      ).toBeInTheDocument()
    })

    it('renders Cancel and Continue buttons', async () => {
      renderWithProviders(<PolicyConfigurationFormPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: 'Save & continue' })).toBeInTheDocument()
    })

    it('does not show conditional fields by default', async () => {
      renderWithProviders(<PolicyConfigurationFormPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Policy details')).toBeInTheDocument()
      })

      expect(screen.queryByText('Employees will accrue')).not.toBeInTheDocument()
      expect(screen.queryByText('Total hours per year')).not.toBeInTheDocument()
      expect(screen.queryByText('Reset date')).not.toBeInTheDocument()
    })
  })

  describe('conditional visibility - hours worked', () => {
    it('shows hourly fields when "Based on hours worked" is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PolicyConfigurationFormPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText('Based on hours worked')).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText('Based on hours worked'))

      await waitFor(() => {
        expect(screen.getByText('Employees will accrue')).toBeInTheDocument()
      })
      expect(screen.getByText('For every')).toBeInTheDocument()
      expect(screen.getByText('Additional options')).toBeInTheDocument()
      expect(screen.getByText('Include overtime hours')).toBeInTheDocument()
      expect(screen.getByText('Include all paid hours')).toBeInTheDocument()
      expect(screen.getByText('Reset date')).toBeInTheDocument()
    })

    it('shows hourly fields when defaultValues includes per_hour_paid', async () => {
      renderWithProviders(
        <PolicyConfigurationFormPresentation
          {...defaultProps}
          defaultValues={{ accrualMethod: 'per_hour_paid' }}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Employees will accrue')).toBeInTheDocument()
      })
      expect(screen.getByText('For every')).toBeInTheDocument()
      expect(screen.getByText('Additional options')).toBeInTheDocument()
      expect(screen.getByText('Include overtime hours')).toBeInTheDocument()
      expect(screen.getByText('Include all paid hours')).toBeInTheDocument()
    })
  })

  describe('conditional visibility - fixed', () => {
    it('shows fixed fields when "Fixed amount per year" is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PolicyConfigurationFormPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText('Fixed amount per year')).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText('Fixed amount per year'))

      await waitFor(() => {
        expect(screen.getByText('Total hours per year')).toBeInTheDocument()
      })
      expect(screen.getByText('Each pay period')).toBeInTheDocument()
      expect(screen.getByText('All at once')).toBeInTheDocument()
      expect(screen.getByText('Reset date')).toBeInTheDocument()
    })

    it('does not show hourly-specific fields when fixed is selected', async () => {
      renderWithProviders(
        <PolicyConfigurationFormPresentation
          {...defaultProps}
          defaultValues={{ accrualMethod: 'per_calendar_year' }}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Total hours per year')).toBeInTheDocument()
      })

      expect(screen.queryByText('Employees will accrue')).not.toBeInTheDocument()
      expect(screen.queryByText('For every')).not.toBeInTheDocument()
      expect(screen.queryByText('Include overtime hours')).not.toBeInTheDocument()
    })
  })

  describe('conditional visibility - unlimited', () => {
    it('shows no extra fields when "Unlimited" is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PolicyConfigurationFormPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText('Unlimited')).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText('Unlimited'))

      await waitFor(() => {
        expect(screen.getByLabelText('Unlimited')).toBeChecked()
      })

      expect(screen.queryByText('Employees will accrue')).not.toBeInTheDocument()
      expect(screen.queryByText('Total hours per year')).not.toBeInTheDocument()
      expect(screen.queryByText('Reset date')).not.toBeInTheDocument()
    })
  })

  describe('conditional visibility - reset date', () => {
    it('shows month/day selects when "Custom date" is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <PolicyConfigurationFormPresentation
          {...defaultProps}
          defaultValues={{ accrualMethod: 'per_hour_paid' }}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Reset date')).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText('Custom date'))

      await waitFor(() => {
        expect(screen.getByText('Month')).toBeInTheDocument()
      })
      expect(screen.getByText('Day')).toBeInTheDocument()
    })

    it('hides month/day selects when "Each employee\'s start date" is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <PolicyConfigurationFormPresentation
          {...defaultProps}
          defaultValues={{
            accrualMethod: 'per_hour_paid',
            resetDateType: 'per_calendar_year',
          }}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Month')).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText("Each employee's start date"))

      await waitFor(() => {
        expect(screen.queryByText('Month')).not.toBeInTheDocument()
      })
      expect(screen.queryByText('Day')).not.toBeInTheDocument()
    })
  })

  describe('switching between methods', () => {
    it('switches from hourly to fixed fields', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <PolicyConfigurationFormPresentation
          {...defaultProps}
          defaultValues={{ accrualMethod: 'per_hour_paid' }}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Employees will accrue')).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText('Fixed amount per year'))

      await waitFor(() => {
        expect(screen.getByText('Total hours per year')).toBeInTheDocument()
      })
      expect(screen.queryByText('Employees will accrue')).not.toBeInTheDocument()
      expect(screen.queryByText('For every')).not.toBeInTheDocument()
    })

    it('switches from fixed to unlimited and hides all conditional fields', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <PolicyConfigurationFormPresentation
          {...defaultProps}
          defaultValues={{ accrualMethod: 'per_calendar_year' }}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Total hours per year')).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText('Unlimited'))

      await waitFor(() => {
        expect(screen.queryByText('Total hours per year')).not.toBeInTheDocument()
      })
      expect(screen.queryByText('Reset date')).not.toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('calls onContinue with form data on submit', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <PolicyConfigurationFormPresentation
          {...defaultProps}
          defaultValues={{
            name: 'Test Policy',
            accrualMethod: 'unlimited',
          }}
        />,
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save & continue' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Save & continue' }))

      await waitFor(() => {
        expect(defaultProps.onContinue).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Policy',
            accrualMethod: 'unlimited',
          }),
        )
      })
    })

    it('calls onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PolicyConfigurationFormPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(defaultProps.onCancel).toHaveBeenCalledOnce()
    })
  })

  describe('edit mode (pre-populated)', () => {
    it('renders with all pre-populated values', async () => {
      renderWithProviders(
        <PolicyConfigurationFormPresentation
          {...defaultProps}
          defaultValues={{
            name: 'Awesome Time Off Policy',
            accrualMethod: 'per_hour_paid',
            accrualRate: 2,
            accrualRateUnit: 20,
            includeOvertime: true,
            allPaidHours: false,
            resetDateType: 'per_calendar_year',
            resetMonth: 1,
            resetDay: 1,
          }}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Employees will accrue')).toBeInTheDocument()
      })

      expect(screen.getByLabelText('Based on hours worked')).toBeChecked()
      expect(screen.getByText('For every')).toBeInTheDocument()
      expect(screen.getByText('Include overtime hours')).toBeInTheDocument()
      expect(screen.getByText('Month')).toBeInTheDocument()
      expect(screen.getByText('Day')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has a radio group for accrual method', async () => {
      renderWithProviders(<PolicyConfigurationFormPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('radiogroup')).toBeInTheDocument()
      })
    })

    it('supports keyboard navigation between accrual method options', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PolicyConfigurationFormPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText('Based on hours worked')).toBeInTheDocument()
      })

      await user.tab()
      await user.tab()
      expect(screen.getByLabelText('Based on hours worked')).toHaveFocus()

      await user.keyboard('{ArrowDown}')
      expect(screen.getByLabelText('Fixed amount per year')).toHaveFocus()

      await user.keyboard('{ArrowDown}')
      expect(screen.getByLabelText('Unlimited')).toHaveFocus()
    })
  })
})
