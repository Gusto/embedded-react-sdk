import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OffCycleReasonSelection } from './OffCycleReasonSelection'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

describe('OffCycleReasonSelection', () => {
  const defaultProps = {
    companyId: 'company-123',
    onEvent: vi.fn(),
  }

  beforeEach(() => {
    defaultProps.onEvent.mockClear()
  })

  describe('rendering', () => {
    it('renders the reason selection title', async () => {
      renderWithProviders(<OffCycleReasonSelection {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Reason')).toBeInTheDocument()
      })
    })

    it('renders both radio options with labels', async () => {
      renderWithProviders(<OffCycleReasonSelection {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Correction payment')).toBeInTheDocument()
      })
      expect(screen.getByText('Bonus')).toBeInTheDocument()
    })

    it('displays description text for each option', async () => {
      renderWithProviders(<OffCycleReasonSelection {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByText('Run a payroll outside of your regular pay schedule'),
        ).toBeInTheDocument()
      })
      expect(screen.getByText('Pay a bonus, gift, or commission.')).toBeInTheDocument()
    })

    it('has no option selected initially', async () => {
      renderWithProviders(<OffCycleReasonSelection {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getAllByRole('radio')).toHaveLength(2)
      })

      const radioButtons = screen.getAllByRole('radio')
      radioButtons.forEach(radio => {
        expect(radio).not.toBeChecked()
      })
    })
  })

  describe('selection behavior', () => {
    it('dispatches OFF_CYCLE_SELECT_REASON with bonus defaults when Bonus is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<OffCycleReasonSelection {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Bonus')).toBeInTheDocument()
      })

      const bonusRadio = screen.getByLabelText('Bonus')
      await user.click(bonusRadio)

      expect(defaultProps.onEvent).toHaveBeenCalledWith(componentEvents.OFF_CYCLE_SELECT_REASON, {
        reason: 'bonus',
        defaults: {
          skipDeductions: true,
          withholdingType: 'supplemental',
        },
      })
    })

    it('dispatches OFF_CYCLE_SELECT_REASON with correction defaults when Correction is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<OffCycleReasonSelection {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Correction payment')).toBeInTheDocument()
      })

      const correctionRadio = screen.getByLabelText('Correction payment')
      await user.click(correctionRadio)

      expect(defaultProps.onEvent).toHaveBeenCalledWith(componentEvents.OFF_CYCLE_SELECT_REASON, {
        reason: 'correction',
        defaults: {
          skipDeductions: false,
          withholdingType: 'regular',
        },
      })
    })

    it('updates the selected radio when an option is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<OffCycleReasonSelection {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Bonus')).toBeInTheDocument()
      })

      const bonusRadio = screen.getByLabelText('Bonus')
      await user.click(bonusRadio)

      expect(bonusRadio).toBeChecked()
    })

    it('allows changing selection between options', async () => {
      const user = userEvent.setup()
      renderWithProviders(<OffCycleReasonSelection {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Bonus')).toBeInTheDocument()
      })

      const bonusRadio = screen.getByLabelText('Bonus')
      const correctionRadio = screen.getByLabelText('Correction payment')

      await user.click(bonusRadio)
      expect(bonusRadio).toBeChecked()
      expect(correctionRadio).not.toBeChecked()

      await user.click(correctionRadio)
      expect(correctionRadio).toBeChecked()
      expect(bonusRadio).not.toBeChecked()
    })
  })

  describe('accessibility', () => {
    it('supports keyboard navigation between options', async () => {
      const user = userEvent.setup()
      renderWithProviders(<OffCycleReasonSelection {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Correction payment')).toBeInTheDocument()
      })

      const correctionRadio = screen.getByLabelText('Correction payment')

      await user.tab()
      expect(correctionRadio).toHaveFocus()

      await user.keyboard('{ArrowDown}')
      const bonusRadio = screen.getByLabelText('Bonus')
      expect(bonusRadio).toHaveFocus()
    })

    it('allows selection via Space key', async () => {
      const user = userEvent.setup()
      renderWithProviders(<OffCycleReasonSelection {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Correction payment')).toBeInTheDocument()
      })

      const correctionRadio = screen.getByLabelText('Correction payment')
      await user.tab()
      await user.keyboard(' ')

      expect(correctionRadio).toBeChecked()
      expect(defaultProps.onEvent).toHaveBeenCalledWith(
        componentEvents.OFF_CYCLE_SELECT_REASON,
        expect.objectContaining({ reason: 'correction' }),
      )
    })

    it('has radio group with correct role', async () => {
      renderWithProviders(<OffCycleReasonSelection {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('radiogroup')).toBeInTheDocument()
      })
    })
  })
})
