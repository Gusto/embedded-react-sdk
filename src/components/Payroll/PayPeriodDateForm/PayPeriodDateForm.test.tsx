import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PayPeriodDateForm } from './PayPeriodDateForm'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

vi.mock('@/hooks/useContainerBreakpoints/useContainerBreakpoints')

describe('PayPeriodDateForm', () => {
  const defaultProps = {
    companyId: 'test-company-123',
    onEvent: vi.fn(),
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    const { useContainerBreakpoints } =
      await import('@/hooks/useContainerBreakpoints/useContainerBreakpoints')
    vi.mocked(useContainerBreakpoints).mockReturnValue(['base', 'small', 'medium'])
  })

  describe('initial render', () => {
    it('renders the form with page title and description', async () => {
      renderWithProviders(<PayPeriodDateForm {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /pay period and payment date/i }),
        ).toBeInTheDocument()
      })

      expect(
        screen.getByText(/enter a work period to show on your employees' pay stubs/i),
      ).toBeInTheDocument()
    })

    it('renders start date, end date, and payment date fields by default', async () => {
      renderWithProviders(<PayPeriodDateForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('group', { name: 'Start date' })).toBeInTheDocument()
      })

      expect(screen.getByRole('group', { name: 'End date' })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: 'Payment date' })).toBeInTheDocument()
    })

    it('renders check-only payroll checkbox unchecked by default', async () => {
      renderWithProviders(<PayPeriodDateForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: /check-only payroll/i })).toBeInTheDocument()
      })

      expect(screen.getByRole('checkbox', { name: /check-only payroll/i })).not.toBeChecked()
    })

    it('renders continue button', async () => {
      renderWithProviders(<PayPeriodDateForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })
    })

    it('disables end date field when start date is not set', async () => {
      renderWithProviders(<PayPeriodDateForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('group', { name: 'End date' })).toBeInTheDocument()
      })

      const endDateGroup = screen.getByRole('group', { name: 'End date' })
      expect(endDateGroup).toHaveAttribute('data-disabled', 'true')
    })
  })

  describe('check-only payroll toggle', () => {
    it('hides start and end date fields when check-only is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PayPeriodDateForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('group', { name: 'Start date' })).toBeInTheDocument()
      })

      const checkOnlyCheckbox = screen.getByRole('checkbox', { name: /check-only payroll/i })
      await user.click(checkOnlyCheckbox)

      await waitFor(() => {
        expect(screen.queryByRole('group', { name: 'Start date' })).not.toBeInTheDocument()
      })
      expect(screen.queryByRole('group', { name: 'End date' })).not.toBeInTheDocument()
      expect(screen.getByRole('group', { name: 'Payment date' })).toBeInTheDocument()
    })

    it('shows start and end date fields when check-only is deselected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PayPeriodDateForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: /check-only payroll/i })).toBeInTheDocument()
      })

      const checkOnlyCheckbox = screen.getByRole('checkbox', { name: /check-only payroll/i })

      await user.click(checkOnlyCheckbox)
      await waitFor(() => {
        expect(screen.queryByRole('group', { name: 'Start date' })).not.toBeInTheDocument()
      })

      await user.click(checkOnlyCheckbox)
      await waitFor(() => {
        expect(screen.getByRole('group', { name: 'Start date' })).toBeInTheDocument()
      })
      expect(screen.getByRole('group', { name: 'End date' })).toBeInTheDocument()
    })
  })

  describe('initial values', () => {
    it('respects initialValues for check-only payroll', async () => {
      renderWithProviders(
        <PayPeriodDateForm {...defaultProps} initialValues={{ isCheckOnly: true }} />,
      )

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: /check-only payroll/i })).toBeChecked()
      })

      expect(screen.queryByRole('group', { name: 'Start date' })).not.toBeInTheDocument()
      expect(screen.queryByRole('group', { name: 'End date' })).not.toBeInTheDocument()
    })
  })

  describe('form validation', () => {
    it('shows validation error when submitting without required dates', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PayPeriodDateForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/start date is required/i)).toBeInTheDocument()
      })
    })

    it('shows payment date required error when submitting check-only without payment date', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <PayPeriodDateForm {...defaultProps} initialValues={{ isCheckOnly: true }} />,
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/payment date is required/i)).toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    it('dispatches RUN_PAYROLL_DATES_CONFIGURED event on valid submission for check-only payroll', async () => {
      const user = userEvent.setup()
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)

      renderWithProviders(
        <PayPeriodDateForm
          {...defaultProps}
          initialValues={{
            isCheckOnly: true,
            checkDate: futureDate,
          }}
        />,
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(defaultProps.onEvent).toHaveBeenCalledWith(
          componentEvents.RUN_PAYROLL_DATES_CONFIGURED,
          expect.objectContaining({
            isCheckOnly: true,
            checkDate: expect.any(String),
          }),
        )
      })
    })
  })

  describe('payroll type behavior', () => {
    it('renders with bonus payroll type by default', async () => {
      renderWithProviders(<PayPeriodDateForm {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /pay period and payment date/i }),
        ).toBeInTheDocument()
      })
    })

    it('accepts correction payroll type', async () => {
      renderWithProviders(<PayPeriodDateForm {...defaultProps} payrollType="correction" />)

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /pay period and payment date/i }),
        ).toBeInTheDocument()
      })
    })
  })
})
