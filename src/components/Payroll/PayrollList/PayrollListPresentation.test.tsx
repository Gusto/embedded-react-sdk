import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Payroll } from '@gusto/embedded-api/models/components/payroll'
import type { PayScheduleList } from '@gusto/embedded-api/models/components/payschedulelist'
import type { ApiPayrollBlocker } from '../PayrollBlocker/payrollHelpers'
import type { PayrollType } from './types'
import { PayrollListPresentation } from './PayrollListPresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

interface PresentationPayroll extends Payroll {
  payrollType: PayrollType
}

const mockPaySchedules: PayScheduleList[] = [
  {
    uuid: 'schedule-1',
    frequency: 'Every week',
    anchorPayDate: '2024-01-01',
    anchorEndOfPayPeriod: '2024-01-07',
    customName: 'Weekly Schedule',
    active: true,
    version: '56a489ce86ed6c1b0f0cecc4050a0b01',
  },
]

const mockUnprocessedPayroll: PresentationPayroll = {
  payrollUuid: 'payroll-1',
  processed: false,
  checkDate: '2024-12-15',
  external: false,
  offCycle: false,
  payrollDeadline: new Date('2024-12-14T23:30:00Z'),
  payrollStatusMeta: {
    cancellable: true,
    expectedCheckDate: '2024-12-15',
    initialCheckDate: '2024-12-15',
    expectedDebitTime: '2024-12-14T23:30:00Z',
    payrollLate: false,
    initialDebitCutoffTime: '2024-12-14T23:30:00Z',
  },
  payPeriod: {
    startDate: '2024-12-01',
    endDate: '2024-12-15',
    payScheduleUuid: 'schedule-1',
  },
  totals: {
    netPay: '2500.00',
    grossPay: '3200.00',
  },
  payrollType: 'Regular',
}

const mockCalculatedPayroll: PresentationPayroll = {
  ...mockUnprocessedPayroll,
  payrollUuid: 'payroll-2',
  calculatedAt: new Date('2024-12-14T10:00:00Z'),
}

const mockBlockers: ApiPayrollBlocker[] = [
  {
    key: 'missing_bank_info',
    message: 'Company must have a bank account in order to run payroll.',
  },
  {
    key: 'missing_signatory',
    message:
      'A signatory who is authorized to sign documents on behalf of your company is required.',
  },
]

const defaultProps = {
  onRunPayroll: vi.fn(),
  onSubmitPayroll: vi.fn(),
  onSkipPayroll: vi.fn(),
  onDeletePayroll: vi.fn(),
  onRunOffCyclePayroll: vi.fn(),
  payrolls: [mockUnprocessedPayroll] as Payroll[],
  paySchedules: mockPaySchedules,
  showSkipSuccessAlert: false,
  onDismissSkipSuccessAlert: vi.fn(),
  showDeleteSuccessAlert: false,
  onDismissDeleteSuccessAlert: vi.fn(),
  skippingPayrollId: null,
  deletingPayrollId: null,
  blockers: [] as ApiPayrollBlocker[],
  wireInRequests: [],
}

describe('PayrollListPresentation', () => {
  describe('rendering', () => {
    it('renders pay period information', async () => {
      renderWithProviders(<PayrollListPresentation {...defaultProps} />)

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      expect(screen.getByText(/Dec 1 - Dec 15, 2024/)).toBeInTheDocument()
    })

    it('renders pay schedule name', async () => {
      renderWithProviders(<PayrollListPresentation {...defaultProps} />)

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
    })
  })

  describe('skip payroll menu', () => {
    it('shows hamburger menu with skip option when there are no blockers and pay period has started', async () => {
      renderWithProviders(<PayrollListPresentation {...defaultProps} />)

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const hamburgerButton = screen.getByRole('button', { name: /open menu/i })
      expect(hamburgerButton).toBeInTheDocument()
    })

    it('does not show hamburger menu when there are blockers', async () => {
      renderWithProviders(<PayrollListPresentation {...defaultProps} blockers={mockBlockers} />)

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const hamburgerButton = screen.queryByRole('button', { name: /open menu/i })
      expect(hamburgerButton).not.toBeInTheDocument()
    })

    it('does not show hamburger menu when pay period starts tomorrow', async () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowDate = tomorrow.toISOString().split('T')[0]

      const futurePayroll: PresentationPayroll = {
        ...mockUnprocessedPayroll,
        payPeriod: {
          startDate: tomorrowDate,
          endDate: '2025-12-15',
          payScheduleUuid: 'schedule-1',
        },
      }

      renderWithProviders(<PayrollListPresentation {...defaultProps} payrolls={[futurePayroll]} />)

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const hamburgerButton = screen.queryByRole('button', { name: /open menu/i })
      expect(hamburgerButton).not.toBeInTheDocument()
    })

    it('shows hamburger menu when pay period starts today', async () => {
      const today = new Date()
      const todayDate = today.toISOString().split('T')[0]

      const todayPayroll: PresentationPayroll = {
        ...mockUnprocessedPayroll,
        payPeriod: {
          startDate: todayDate,
          endDate: '2024-12-15',
          payScheduleUuid: 'schedule-1',
        },
      }

      renderWithProviders(<PayrollListPresentation {...defaultProps} payrolls={[todayPayroll]} />)

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const hamburgerButton = screen.getByRole('button', { name: /open menu/i })
      expect(hamburgerButton).toBeInTheDocument()
    })

    it('shows hamburger menu when pay period started yesterday', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayDate = yesterday.toISOString().split('T')[0]

      const pastPayroll: PresentationPayroll = {
        ...mockUnprocessedPayroll,
        payPeriod: {
          startDate: yesterdayDate,
          endDate: '2024-12-15',
          payScheduleUuid: 'schedule-1',
        },
      }

      renderWithProviders(<PayrollListPresentation {...defaultProps} payrolls={[pastPayroll]} />)

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const hamburgerButton = screen.getByRole('button', { name: /open menu/i })
      expect(hamburgerButton).toBeInTheDocument()
    })

    it('does not show skip option for off-cycle payrolls', async () => {
      const user = userEvent.setup()
      const bonusPayroll: PresentationPayroll = {
        ...mockUnprocessedPayroll,
        payrollUuid: 'payroll-bonus',
        offCycle: true,
        offCycleReason: 'Bonus',
      }

      renderWithProviders(<PayrollListPresentation {...defaultProps} payrolls={[bonusPayroll]} />)

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const hamburgerButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(hamburgerButton)

      expect(screen.queryByText('Skip payroll')).not.toBeInTheDocument()
      expect(screen.getByText('Cancel payroll')).toBeInTheDocument()
    })

    it('does not show hamburger menu for processed payrolls', async () => {
      const processedPayroll: PresentationPayroll = {
        ...mockUnprocessedPayroll,
        processed: true,
      }

      renderWithProviders(
        <PayrollListPresentation {...defaultProps} payrolls={[processedPayroll]} />,
      )

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const hamburgerButton = screen.queryByRole('button', { name: /open menu/i })
      expect(hamburgerButton).not.toBeInTheDocument()
    })
  })

  describe('cancel payroll menu', () => {
    const bonusPayroll: PresentationPayroll = {
      ...mockUnprocessedPayroll,
      payrollUuid: 'payroll-bonus',
      offCycle: true,
      offCycleReason: 'Bonus',
    }

    const dismissalPayroll: PresentationPayroll = {
      ...mockUnprocessedPayroll,
      payrollUuid: 'payroll-dismissal',
      offCycle: true,
      offCycleReason: 'Dismissed employee',
    }

    it('shows cancel option in hamburger menu for bonus payrolls', async () => {
      const user = userEvent.setup()

      renderWithProviders(<PayrollListPresentation {...defaultProps} payrolls={[bonusPayroll]} />)

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const hamburgerButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(hamburgerButton)

      expect(screen.getByText('Cancel payroll')).toBeInTheDocument()
    })

    it('shows cancel option in hamburger menu for dismissal payrolls', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <PayrollListPresentation {...defaultProps} payrolls={[dismissalPayroll]} />,
      )

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const hamburgerButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(hamburgerButton)

      expect(screen.getByText('Cancel payroll')).toBeInTheDocument()
    })

    it('opens cancel confirmation dialog when cancel is clicked for dismissal payroll', async () => {
      const user = userEvent.setup()

      HTMLDialogElement.prototype.showModal = vi.fn()
      HTMLDialogElement.prototype.close = vi.fn()
      Object.defineProperty(HTMLDialogElement.prototype, 'open', {
        get: vi.fn(() => false),
        set: vi.fn(),
        configurable: true,
      })

      renderWithProviders(
        <PayrollListPresentation {...defaultProps} payrolls={[dismissalPayroll]} />,
      )

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const hamburgerButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(hamburgerButton)
      await user.click(screen.getByText('Cancel payroll'))

      expect(screen.getByText(/Yes, cancel payroll/)).toBeInTheDocument()
    })

    it('opens cancel confirmation dialog when cancel is clicked for bonus payroll', async () => {
      const user = userEvent.setup()

      HTMLDialogElement.prototype.showModal = vi.fn()
      HTMLDialogElement.prototype.close = vi.fn()
      Object.defineProperty(HTMLDialogElement.prototype, 'open', {
        get: vi.fn(() => false),
        set: vi.fn(),
        configurable: true,
      })

      renderWithProviders(<PayrollListPresentation {...defaultProps} payrolls={[bonusPayroll]} />)

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const hamburgerButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(hamburgerButton)
      await user.click(screen.getByText('Cancel payroll'))

      expect(screen.getByText(/Yes, cancel payroll/)).toBeInTheDocument()
    })

    it('shows skip option instead of cancel for transition payrolls', async () => {
      const user = userEvent.setup()
      const transitionPayroll: PresentationPayroll = {
        ...mockUnprocessedPayroll,
        payrollUuid: 'payroll-transition',
        offCycle: true,
        offCycleReason: 'Transition from old pay schedule',
      }

      renderWithProviders(
        <PayrollListPresentation {...defaultProps} payrolls={[transitionPayroll]} />,
      )

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const hamburgerButton = screen.getByRole('button', { name: /open menu/i })
      await user.click(hamburgerButton)

      expect(screen.getByText('Skip payroll')).toBeInTheDocument()
      expect(screen.queryByText('Cancel payroll')).not.toBeInTheDocument()
    })

    it('shows cancel success alert when showDeleteSuccessAlert is true', async () => {
      renderWithProviders(
        <PayrollListPresentation {...defaultProps} showDeleteSuccessAlert={true} />,
      )

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      expect(screen.getByText('Payroll cancelled')).toBeInTheDocument()
    })
  })

  describe('payroll actions', () => {
    it('calls onRunPayroll when run payroll button is clicked', async () => {
      const user = userEvent.setup()
      const onRunPayroll = vi.fn()

      renderWithProviders(<PayrollListPresentation {...defaultProps} onRunPayroll={onRunPayroll} />)

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const runPayrollButton = screen.getByRole('button', { name: 'Run Payroll' })
      await user.click(runPayrollButton)

      expect(onRunPayroll).toHaveBeenCalledWith({
        payrollUuid: 'payroll-1',
        payPeriod: {
          startDate: '2024-12-01',
          endDate: '2024-12-15',
          payScheduleUuid: 'schedule-1',
        },
      })
    })

    it('calls onSubmitPayroll when submit payroll button is clicked', async () => {
      const user = userEvent.setup()
      const onSubmitPayroll = vi.fn()

      renderWithProviders(
        <PayrollListPresentation
          {...defaultProps}
          onSubmitPayroll={onSubmitPayroll}
          payrolls={[mockCalculatedPayroll]}
        />,
      )

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const submitPayrollButton = screen.getByRole('button', { name: 'Review and submit' })
      await user.click(submitPayrollButton)

      expect(onSubmitPayroll).toHaveBeenCalledWith({
        payrollUuid: 'payroll-2',
        payPeriod: {
          startDate: '2024-12-01',
          endDate: '2024-12-15',
          payScheduleUuid: 'schedule-1',
        },
      })
    })
  })

  describe('skip success alert', () => {
    it('shows skip success alert when showSkipSuccessAlert is true', async () => {
      renderWithProviders(<PayrollListPresentation {...defaultProps} showSkipSuccessAlert={true} />)

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      expect(screen.getByText('Payroll skipped')).toBeInTheDocument()
    })

    it('does not show skip success alert when showSkipSuccessAlert is false', async () => {
      renderWithProviders(<PayrollListPresentation {...defaultProps} />)

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      expect(screen.queryByText('Payroll skipped')).not.toBeInTheDocument()
    })

    it('calls onDismissSkipSuccessAlert when alert is dismissed', async () => {
      const user = userEvent.setup()
      const onDismissSkipSuccessAlert = vi.fn()

      renderWithProviders(
        <PayrollListPresentation
          {...defaultProps}
          showSkipSuccessAlert={true}
          onDismissSkipSuccessAlert={onDismissSkipSuccessAlert}
        />,
      )

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const dismissButton = screen.getByRole('button', { name: /dismiss/i })
      await user.click(dismissButton)

      expect(onDismissSkipSuccessAlert).toHaveBeenCalled()
    })
  })
})
