import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SelectPolicyTypePresentation } from './SelectPolicyTypePresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('SelectPolicyTypePresentation', () => {
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
      renderWithProviders(<SelectPolicyTypePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Select policy type')).toBeInTheDocument()
      })
    })

    it('renders the description', async () => {
      renderWithProviders(<SelectPolicyTypePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByText('Select the type of time off policy you want to set up for your team.'),
        ).toBeInTheDocument()
      })
    })

    it('renders all three radio options with labels', async () => {
      renderWithProviders(<SelectPolicyTypePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Holiday pay')).toBeInTheDocument()
      })
      expect(screen.getByText('Time off')).toBeInTheDocument()
      expect(screen.getByText('Sick leave')).toBeInTheDocument()
    })

    it('renders descriptions for each option', async () => {
      renderWithProviders(<SelectPolicyTypePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByText(
            'Give employees time off for company holidays. Choose which holidays to observe.',
          ),
        ).toBeInTheDocument()
      })
      expect(
        screen.getByText(
          'Use for paid leave or combine vacation and sick time into one PTO policy.',
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          "Paid time employees can use when they're sick or caring for their health.",
        ),
      ).toBeInTheDocument()
    })

    it('has no option selected by default', async () => {
      renderWithProviders(<SelectPolicyTypePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getAllByRole('radio')).toHaveLength(3)
      })

      const radioButtons = screen.getAllByRole('radio')
      radioButtons.forEach(radio => {
        expect(radio).not.toBeChecked()
      })
    })

    it('renders Cancel and Continue buttons', async () => {
      renderWithProviders(<SelectPolicyTypePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    })
  })

  describe('pre-selected state', () => {
    it('renders with holiday pre-selected', async () => {
      renderWithProviders(
        <SelectPolicyTypePresentation {...defaultProps} defaultPolicyType="holiday" />,
      )

      await waitFor(() => {
        expect(screen.getByLabelText('Holiday pay')).toBeChecked()
      })
    })

    it('renders with vacation pre-selected', async () => {
      renderWithProviders(
        <SelectPolicyTypePresentation {...defaultProps} defaultPolicyType="vacation" />,
      )

      await waitFor(() => {
        expect(screen.getByLabelText('Time off')).toBeChecked()
      })
    })

    it('renders with sick pre-selected', async () => {
      renderWithProviders(
        <SelectPolicyTypePresentation {...defaultProps} defaultPolicyType="sick" />,
      )

      await waitFor(() => {
        expect(screen.getByLabelText('Sick leave')).toBeChecked()
      })
    })
  })

  describe('selection behavior', () => {
    it('selects an option when clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SelectPolicyTypePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText('Holiday pay')).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText('Holiday pay'))
      expect(screen.getByLabelText('Holiday pay')).toBeChecked()
    })

    it('allows changing selection between options', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SelectPolicyTypePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText('Holiday pay')).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText('Holiday pay'))
      expect(screen.getByLabelText('Holiday pay')).toBeChecked()

      await user.click(screen.getByLabelText('Time off'))
      expect(screen.getByLabelText('Time off')).toBeChecked()
      expect(screen.getByLabelText('Holiday pay')).not.toBeChecked()
    })
  })

  describe('actions', () => {
    it('calls onContinue with selected policy type on submit', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SelectPolicyTypePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText('Time off')).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText('Time off'))
      await user.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => {
        expect(defaultProps.onContinue).toHaveBeenCalledWith('vacation')
      })
    })

    it('calls onContinue with holiday when holiday is selected', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SelectPolicyTypePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText('Holiday pay')).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText('Holiday pay'))
      await user.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => {
        expect(defaultProps.onContinue).toHaveBeenCalledWith('holiday')
      })
    })

    it('calls onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SelectPolicyTypePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(defaultProps.onCancel).toHaveBeenCalledOnce()
    })

    it('does not call onContinue when submitting without selection', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SelectPolicyTypePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Continue' }))

      await waitFor(() => {
        expect(defaultProps.onContinue).not.toHaveBeenCalled()
      })
    })
  })

  describe('accessibility', () => {
    it('has a radio group with correct role', async () => {
      renderWithProviders(<SelectPolicyTypePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('radiogroup')).toBeInTheDocument()
      })
    })

    it('supports keyboard navigation between options', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SelectPolicyTypePresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText('Holiday pay')).toBeInTheDocument()
      })

      await user.tab()
      expect(screen.getByLabelText('Holiday pay')).toHaveFocus()

      await user.keyboard('{ArrowDown}')
      expect(screen.getByLabelText('Time off')).toHaveFocus()

      await user.keyboard('{ArrowDown}')
      expect(screen.getByLabelText('Sick leave')).toHaveFocus()
    })
  })
})
