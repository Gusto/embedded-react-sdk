import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OffCycleCreation } from './OffCycleCreation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const defaultProps = {
  companyId: 'company-123',
  onEvent: vi.fn(),
}

function renderComponent(props = {}) {
  return renderWithProviders(<OffCycleCreation {...defaultProps} {...props} />)
}

describe('OffCycleCreation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the page title and description', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /new off-cycle payroll/i })).toBeInTheDocument()
      })

      expect(
        screen.getByText(/configure your off-cycle payroll details below/i),
      ).toBeInTheDocument()
    })

    it('renders the reason selection radio group', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Reason')).toBeInTheDocument()
      })

      expect(screen.getByText('Bonus')).toBeInTheDocument()
      expect(screen.getByText('Correction payment')).toBeInTheDocument()
    })

    it('renders the pay period date fields', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('group', { name: 'Start date' })).toBeInTheDocument()
      })

      expect(screen.getByRole('group', { name: 'End date' })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: 'Payment date' })).toBeInTheDocument()
    })

    it('renders the check-only payroll checkbox', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: /check-only payroll/i })).toBeInTheDocument()
      })

      expect(screen.getByRole('checkbox', { name: /check-only payroll/i })).not.toBeChecked()
    })

    it('renders the continue button', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })
    })
  })

  describe('reason selection', () => {
    it('allows selecting a reason', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Bonus')).toBeInTheDocument()
      })

      const bonusRadio = screen.getByLabelText('Bonus')
      await user.click(bonusRadio)

      expect(bonusRadio).toBeChecked()
    })

    it('allows changing selection between reasons', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Bonus')).toBeInTheDocument()
      })

      const bonusRadio = screen.getByLabelText('Bonus')
      const correctionRadio = screen.getByLabelText('Correction payment')

      await user.click(bonusRadio)
      expect(bonusRadio).toBeChecked()

      await user.click(correctionRadio)
      expect(correctionRadio).toBeChecked()
      expect(bonusRadio).not.toBeChecked()
    })
  })

  describe('check-only payroll toggle', () => {
    it('hides start and end date fields when check-only is selected', async () => {
      const user = userEvent.setup()
      renderComponent()

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
      renderComponent()

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

  describe('form validation', () => {
    it('shows validation errors when submitting without required dates', async () => {
      const user = userEvent.setup()
      renderComponent()

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
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: /check-only payroll/i })).toBeInTheDocument()
      })

      const checkOnlyCheckbox = screen.getByRole('checkbox', { name: /check-only payroll/i })
      await user.click(checkOnlyCheckbox)

      await waitFor(() => {
        expect(screen.queryByRole('group', { name: 'Start date' })).not.toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/payment date is required/i)).toBeInTheDocument()
      })
    })

    it('does not emit an event when form has validation errors', async () => {
      const user = userEvent.setup()
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/start date is required/i)).toBeInTheDocument()
      })

      expect(defaultProps.onEvent).not.toHaveBeenCalled()
    })
  })
})
