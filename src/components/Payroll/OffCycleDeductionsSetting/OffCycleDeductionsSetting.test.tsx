import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OffCycleDeductionsSetting } from './OffCycleDeductionsSetting'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

describe('OffCycleDeductionsSetting', () => {
  const onEvent = vi.fn()

  beforeEach(() => {
    onEvent.mockClear()
  })

  describe('rendering', () => {
    it('renders the title', async () => {
      renderWithProviders(<OffCycleDeductionsSetting offCycleReason="bonus" onEvent={onEvent} />)

      await waitFor(() => {
        expect(screen.getByText('Deductions and contributions')).toBeInTheDocument()
      })
    })

    it('renders both radio options with labels', async () => {
      renderWithProviders(<OffCycleDeductionsSetting offCycleReason="bonus" onEvent={onEvent} />)

      await waitFor(() => {
        expect(
          screen.getByText('Make all the regular deductions and contributions.'),
        ).toBeInTheDocument()
      })
      expect(
        screen.getByText(
          'Block all deductions and contributions, except 401(k). Taxes will be included.',
        ),
      ).toBeInTheDocument()
    })

    it('displays description hint text', async () => {
      renderWithProviders(<OffCycleDeductionsSetting offCycleReason="bonus" onEvent={onEvent} />)

      await waitFor(() => {
        expect(
          screen.getByText(
            /Employers often block deductions and contributions from certain checks/,
          ),
        ).toBeInTheDocument()
      })
    })
  })

  describe('default selection based on off-cycle reason', () => {
    it('defaults to skip for bonus payrolls', async () => {
      renderWithProviders(<OffCycleDeductionsSetting offCycleReason="bonus" onEvent={onEvent} />)

      await waitFor(() => {
        expect(screen.getAllByRole('radio')).toHaveLength(2)
      })

      const skipRadio = screen.getByLabelText(
        'Block all deductions and contributions, except 401(k). Taxes will be included.',
      )
      const includeRadio = screen.getByLabelText(
        'Make all the regular deductions and contributions.',
      )

      expect(skipRadio).toBeChecked()
      expect(includeRadio).not.toBeChecked()
    })

    it('defaults to include for correction payrolls', async () => {
      renderWithProviders(
        <OffCycleDeductionsSetting offCycleReason="correction" onEvent={onEvent} />,
      )

      await waitFor(() => {
        expect(screen.getAllByRole('radio')).toHaveLength(2)
      })

      const includeRadio = screen.getByLabelText(
        'Make all the regular deductions and contributions.',
      )
      const skipRadio = screen.getByLabelText(
        'Block all deductions and contributions, except 401(k). Taxes will be included.',
      )

      expect(includeRadio).toBeChecked()
      expect(skipRadio).not.toBeChecked()
    })
  })

  describe('selection behavior', () => {
    it('dispatches OFF_CYCLE_DEDUCTIONS_CHANGE with skipRegularDeductions: false when include is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<OffCycleDeductionsSetting offCycleReason="bonus" onEvent={onEvent} />)

      await waitFor(() => {
        expect(
          screen.getByText('Make all the regular deductions and contributions.'),
        ).toBeInTheDocument()
      })

      const includeRadio = screen.getByLabelText(
        'Make all the regular deductions and contributions.',
      )
      await user.click(includeRadio)

      expect(onEvent).toHaveBeenCalledWith(componentEvents.OFF_CYCLE_DEDUCTIONS_CHANGE, {
        skipRegularDeductions: false,
      })
    })

    it('dispatches OFF_CYCLE_DEDUCTIONS_CHANGE with skipRegularDeductions: true when skip is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <OffCycleDeductionsSetting offCycleReason="correction" onEvent={onEvent} />,
      )

      await waitFor(() => {
        expect(
          screen.getByText(
            'Block all deductions and contributions, except 401(k). Taxes will be included.',
          ),
        ).toBeInTheDocument()
      })

      const skipRadio = screen.getByLabelText(
        'Block all deductions and contributions, except 401(k). Taxes will be included.',
      )
      await user.click(skipRadio)

      expect(onEvent).toHaveBeenCalledWith(componentEvents.OFF_CYCLE_DEDUCTIONS_CHANGE, {
        skipRegularDeductions: true,
      })
    })

    it('allows overriding the default selection', async () => {
      const user = userEvent.setup()
      renderWithProviders(<OffCycleDeductionsSetting offCycleReason="bonus" onEvent={onEvent} />)

      await waitFor(() => {
        expect(screen.getAllByRole('radio')).toHaveLength(2)
      })

      const includeRadio = screen.getByLabelText(
        'Make all the regular deductions and contributions.',
      )
      const skipRadio = screen.getByLabelText(
        'Block all deductions and contributions, except 401(k). Taxes will be included.',
      )

      expect(skipRadio).toBeChecked()

      await user.click(includeRadio)
      expect(includeRadio).toBeChecked()
      expect(skipRadio).not.toBeChecked()
    })
  })

  describe('accessibility', () => {
    it('supports keyboard navigation between options', async () => {
      const user = userEvent.setup()
      renderWithProviders(<OffCycleDeductionsSetting offCycleReason="bonus" onEvent={onEvent} />)

      await waitFor(() => {
        expect(screen.getAllByRole('radio')).toHaveLength(2)
      })

      await user.tab()

      const skipRadio = screen.getByLabelText(
        'Block all deductions and contributions, except 401(k). Taxes will be included.',
      )
      expect(skipRadio).toHaveFocus()

      await user.keyboard('{ArrowUp}')
      const includeRadio = screen.getByLabelText(
        'Make all the regular deductions and contributions.',
      )
      expect(includeRadio).toHaveFocus()
    })

    it('allows selection via Space key', async () => {
      const user = userEvent.setup()
      renderWithProviders(<OffCycleDeductionsSetting offCycleReason="bonus" onEvent={onEvent} />)

      await waitFor(() => {
        expect(screen.getAllByRole('radio')).toHaveLength(2)
      })

      const skipRadio = screen.getByLabelText(
        'Block all deductions and contributions, except 401(k). Taxes will be included.',
      )

      await user.tab()
      expect(skipRadio).toHaveFocus()

      await user.keyboard('{ArrowUp}')
      await user.keyboard(' ')

      const includeRadio = screen.getByLabelText(
        'Make all the regular deductions and contributions.',
      )
      expect(includeRadio).toBeChecked()
      expect(onEvent).toHaveBeenCalledWith(componentEvents.OFF_CYCLE_DEDUCTIONS_CHANGE, {
        skipRegularDeductions: false,
      })
    })

    it('has radio group with correct role', async () => {
      renderWithProviders(<OffCycleDeductionsSetting offCycleReason="bonus" onEvent={onEvent} />)

      await waitFor(() => {
        expect(screen.getByRole('radiogroup')).toBeInTheDocument()
      })
    })
  })
})
