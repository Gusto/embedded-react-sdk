import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransitionCreation } from './TransitionCreation'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const COMPANY_ID = 'company-123'
const START_DATE = '2025-08-14'
const END_DATE = '2025-08-27'
const PAY_SCHEDULE_UUID = '1478a82e-b45c-4980-843a-6ddc3b78268e'

describe('TransitionCreation', () => {
  const defaultProps = {
    companyId: COMPANY_ID,
    startDate: START_DATE,
    endDate: END_DATE,
    payScheduleUuid: PAY_SCHEDULE_UUID,
    onEvent: vi.fn(),
  }

  beforeEach(() => {
    setupApiTestMocks()

    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    Object.defineProperty(HTMLDialogElement.prototype, 'open', {
      get: vi.fn(() => false),
      set: vi.fn(),
      configurable: true,
    })
  })

  describe('rendering', () => {
    it('renders the page title', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /transition payroll/i, level: 2 }),
        ).toBeInTheDocument()
      })
    })

    it('renders the transition explanation alert', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })

    it('renders the transition details section', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/transition details/i)).toBeInTheDocument()
      })
    })

    it('renders the check date input', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/check date/i)).toBeInTheDocument()
      })
    })

    it('renders the continue button', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })
    })
  })

  describe('deductions and contributions', () => {
    it('renders the deductions radio group defaulting to include', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByLabelText(/make all the regular deductions and contributions/i),
        ).toBeInTheDocument()
      })

      expect(
        screen.getByLabelText(/make all the regular deductions and contributions/i),
      ).toBeChecked()
      expect(screen.getByLabelText(/block all deductions and contributions/i)).not.toBeChecked()
    })

    it('allows switching to skip deductions', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByLabelText(/make all the regular deductions and contributions/i),
        ).toBeInTheDocument()
      })

      const skipRadio = screen.getByLabelText(/block all deductions and contributions/i)
      await user.click(skipRadio)

      expect(skipRadio).toBeChecked()
      expect(
        screen.getByLabelText(/make all the regular deductions and contributions/i),
      ).not.toBeChecked()
    })
  })

  describe('tax withholding rates', () => {
    it('renders the tax withholding rates table', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /tax withholding rates/i })).toBeInTheDocument()
      })

      expect(screen.getByText('Regular hours, regular wages, and tips')).toBeInTheDocument()
      expect(screen.getByText('Supplemental wages, bonus wages, commission')).toBeInTheDocument()
      expect(screen.getByText('Reimbursements')).toBeInTheDocument()
    })

    it('opens the modal when Edit is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /tax withholding rates/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      await waitFor(() => {
        expect(screen.getByText('Rate for regular wages and earnings')).toBeInTheDocument()
      })
    })

    it('does not change config when modal Cancel is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /tax withholding rates/i })).toBeInTheDocument()
      })

      expect(
        screen.getAllByText(/regular wages, paid every other week/i).length,
      ).toBeGreaterThanOrEqual(1)

      await user.click(screen.getByRole('button', { name: /edit/i }))

      await waitFor(() => {
        expect(screen.getByText('Rate for regular wages and earnings')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /cancel/i, hidden: true })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('Rate for regular wages and earnings')).not.toBeInTheDocument()
      })

      expect(
        screen.getAllByText(/regular wages, paid every other week/i).length,
      ).toBeGreaterThanOrEqual(1)
    })

    it('defaults to regular withholding rate for transition payrolls', async () => {
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /tax withholding rates/i })).toBeInTheDocument()
      })

      const regularWagesTexts = screen.getAllByText(/regular wages, paid every other week/i)
      expect(regularWagesTexts.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('validation', () => {
    it('shows check date required error when submitting without a date', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(screen.getByText(/check date is required/i)).toBeInTheDocument()
      })
    })
  })

  describe('submission', () => {
    it('creates a transition payroll and emits the transition/created event on success', async () => {
      const user = userEvent.setup()
      renderWithProviders(<TransitionCreation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })

      const checkDateGroup = screen.getByRole('group', { name: /check date/i })
      await user.type(within(checkDateGroup).getByRole('spinbutton', { name: /month/i }), '12')
      await user.type(within(checkDateGroup).getByRole('spinbutton', { name: /day/i }), '15')
      await user.type(within(checkDateGroup).getByRole('spinbutton', { name: /year/i }), '2026')

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(defaultProps.onEvent).toHaveBeenCalledWith(
          'transition/created',
          expect.objectContaining({ payrollUuid: 'transition-payroll-uuid-1' }),
        )
      })
    })
  })
})
