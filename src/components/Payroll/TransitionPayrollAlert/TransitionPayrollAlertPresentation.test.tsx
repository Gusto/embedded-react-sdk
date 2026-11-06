import { Suspense } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PayPeriod } from '@gusto/embedded-api/models/components/payperiod'
import { TransitionPayrollAlertPresentation } from './TransitionPayrollAlertPresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const mockPayPeriod: PayPeriod = {
  startDate: '2024-12-01',
  endDate: '2024-12-15',
  payScheduleUuid: 'schedule-1',
  payroll: {
    processed: false,
    payrollType: 'transition',
  },
}

const mockPayPeriod2: PayPeriod = {
  startDate: '2024-12-16',
  endDate: '2024-12-31',
  payScheduleUuid: 'schedule-1',
  payroll: {
    processed: false,
    payrollType: 'transition',
  },
}

const mockGroupedPayPeriods = [
  {
    payScheduleUuid: 'schedule-1',
    payScheduleName: 'Weekly Schedule',
    payPeriods: [mockPayPeriod],
  },
]

const mockMultipleGroupedPayPeriods = [
  {
    payScheduleUuid: 'schedule-1',
    payScheduleName: 'Weekly Schedule',
    payPeriods: [mockPayPeriod, mockPayPeriod2],
  },
  {
    payScheduleUuid: 'schedule-2',
    payScheduleName: 'Monthly Schedule',
    payPeriods: [
      {
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        payScheduleUuid: 'schedule-2',
        payroll: { processed: false, payrollType: 'transition' as const },
      },
    ],
  },
]

const renderWithSuspense = (ui: React.ReactElement) =>
  renderWithProviders(<Suspense fallback={null}>{ui}</Suspense>)

describe('TransitionPayrollAlertPresentation', () => {
  describe('rendering', () => {
    it('renders no alert content when there are no grouped pay periods', () => {
      renderWithSuspense(
        <TransitionPayrollAlertPresentation
          groupedPayPeriods={[]}
          onRunPayroll={() => {}}
          onSkipPayroll={() => {}}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayPeriod={null}
        />,
      )
      expect(screen.queryByText(/Transition payroll -/)).not.toBeInTheDocument()
    })

    it('renders the warning alert with title and description', async () => {
      renderWithSuspense(
        <TransitionPayrollAlertPresentation
          groupedPayPeriods={mockGroupedPayPeriods}
          onRunPayroll={() => {}}
          onSkipPayroll={() => {}}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayPeriod={null}
        />,
      )

      expect(await screen.findByText(/Transition payroll - Dec 1/)).toBeInTheDocument()
      expect(screen.getByText(/you changed your pay schedule/i)).toBeInTheDocument()
      expect(
        screen.getByText(
          /Regular payroll functionality is blocked until you either run or skip transition payrolls/i,
        ),
      ).toBeInTheDocument()
    })

    it('shows run action directly without schedule name for single group', async () => {
      renderWithSuspense(
        <TransitionPayrollAlertPresentation
          groupedPayPeriods={mockGroupedPayPeriods}
          onRunPayroll={() => {}}
          onSkipPayroll={() => {}}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayPeriod={null}
        />,
      )

      await screen.findByText(/Transition payroll -/)
      expect(screen.queryByText('Weekly Schedule')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /run transition payroll/i })).toBeInTheDocument()
    })

    it('lists every transition payroll as its own row with its dates and pay schedule', async () => {
      renderWithSuspense(
        <TransitionPayrollAlertPresentation
          groupedPayPeriods={mockMultipleGroupedPayPeriods}
          onRunPayroll={() => {}}
          onSkipPayroll={() => {}}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayPeriod={null}
        />,
      )

      expect(
        await screen.findByText('You have 3 transition payrolls to run or skip'),
      ).toBeInTheDocument()
      expect(screen.getAllByText('Weekly Schedule')).toHaveLength(2)
      expect(screen.getAllByText('Monthly Schedule')).toHaveLength(1)

      const runButtons = screen.getAllByRole('button', { name: /run transition payroll/i })
      expect(runButtons).toHaveLength(3)
      expect(runButtons[1]).toHaveAccessibleDescription('Dec 16–Dec 31, 2024 Weekly Schedule')
      expect(runButtons[2]).toHaveAccessibleDescription('Dec 1–Dec 31, 2024 Monthly Schedule')
      expect(screen.getAllByRole('button', { name: /skip this payroll/i })).toHaveLength(3)
    })
  })

  describe('pre-existing payroll', () => {
    it('shows "Run Transition Payroll" even when a payroll already exists for the period', async () => {
      const periodWithPayroll: PayPeriod = {
        startDate: '2024-12-01',
        endDate: '2024-12-15',
        payScheduleUuid: 'schedule-1',
        payroll: {
          payrollUuid: 'existing-123',
          processed: false,
          payrollType: 'transition',
        },
      }

      renderWithSuspense(
        <TransitionPayrollAlertPresentation
          groupedPayPeriods={[
            {
              payScheduleUuid: 'schedule-1',
              payScheduleName: 'Weekly Schedule',
              payPeriods: [periodWithPayroll],
            },
          ]}
          onRunPayroll={() => {}}
          onSkipPayroll={() => {}}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayPeriod={null}
        />,
      )

      await screen.findByText(/Transition payroll -/)
      expect(screen.getByRole('button', { name: /run transition payroll/i })).toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('calls onRunPayroll when run transition payroll button is clicked', async () => {
      const user = userEvent.setup()
      const onRunPayroll = vi.fn()

      renderWithSuspense(
        <TransitionPayrollAlertPresentation
          groupedPayPeriods={mockGroupedPayPeriods}
          onRunPayroll={onRunPayroll}
          onSkipPayroll={() => {}}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayPeriod={null}
        />,
      )

      await screen.findByText(/Transition payroll -/)

      const runButton = screen.getByRole('button', { name: /run transition payroll/i })
      await user.click(runButton)

      expect(onRunPayroll).toHaveBeenCalledWith(mockPayPeriod)
    })

    it('runs and skips the pay period of the clicked row', async () => {
      const user = userEvent.setup()
      const onRunPayroll = vi.fn()
      const onSkipPayroll = vi.fn()

      renderWithSuspense(
        <TransitionPayrollAlertPresentation
          groupedPayPeriods={mockMultipleGroupedPayPeriods}
          onRunPayroll={onRunPayroll}
          onSkipPayroll={onSkipPayroll}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayPeriod={null}
        />,
      )

      await screen.findByText(/transition payrolls to run or skip/)
      await user.click(screen.getAllByRole('button', { name: /run transition payroll/i })[1]!)
      expect(onRunPayroll).toHaveBeenCalledWith(mockPayPeriod2)

      await user.click(screen.getAllByRole('button', { name: /skip this payroll/i })[1]!)
      const dialog = await screen.findByRole('dialog')
      expect(
        within(dialog).getByText('Skip Dec 16–Dec 31, 2024 transition payroll?'),
      ).toBeInTheDocument()
      await user.click(within(dialog).getByRole('button', { name: 'Skip payroll' }))
      expect(onSkipPayroll).toHaveBeenCalledWith(mockPayPeriod2)
    })

    it('renders skip button for each pay period', async () => {
      renderWithSuspense(
        <TransitionPayrollAlertPresentation
          groupedPayPeriods={mockGroupedPayPeriods}
          onRunPayroll={() => {}}
          onSkipPayroll={() => {}}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayPeriod={null}
        />,
      )

      await screen.findByText(/Transition payroll -/)
      expect(screen.getByRole('button', { name: /skip this payroll/i })).toBeInTheDocument()
    })
  })

  describe('payroll blocker gating', () => {
    it('disables run and skip actions when hasBlockers is true', async () => {
      renderWithSuspense(
        <TransitionPayrollAlertPresentation
          groupedPayPeriods={mockGroupedPayPeriods}
          onRunPayroll={() => {}}
          onSkipPayroll={() => {}}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayPeriod={null}
          hasBlockers
        />,
      )

      await screen.findByText(/Transition payroll -/)
      expect(screen.getByRole('button', { name: /run transition payroll/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /skip this payroll/i })).toBeDisabled()
    })

    it('does not call onRunPayroll when the disabled run button is clicked', async () => {
      const user = userEvent.setup()
      const onRunPayroll = vi.fn()

      renderWithSuspense(
        <TransitionPayrollAlertPresentation
          groupedPayPeriods={mockGroupedPayPeriods}
          onRunPayroll={onRunPayroll}
          onSkipPayroll={() => {}}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayPeriod={null}
          hasBlockers
        />,
      )

      await screen.findByText(/Transition payroll -/)
      await user.click(screen.getByRole('button', { name: /run transition payroll/i }))
      expect(onRunPayroll).not.toHaveBeenCalled()
    })

    it('enables run and skip actions when hasBlockers is false', async () => {
      renderWithSuspense(
        <TransitionPayrollAlertPresentation
          groupedPayPeriods={mockGroupedPayPeriods}
          onRunPayroll={() => {}}
          onSkipPayroll={() => {}}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayPeriod={null}
          hasBlockers={false}
        />,
      )

      await screen.findByText(/Transition payroll -/)
      expect(screen.getByRole('button', { name: /run transition payroll/i })).toBeEnabled()
      expect(screen.getByRole('button', { name: /skip this payroll/i })).toBeEnabled()
    })
  })

  describe('skip success alert', () => {
    it('shows skip success alert when showSkipSuccessAlert is true', async () => {
      renderWithSuspense(
        <TransitionPayrollAlertPresentation
          groupedPayPeriods={mockGroupedPayPeriods}
          onRunPayroll={() => {}}
          onSkipPayroll={() => {}}
          showSkipSuccessAlert={true}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayPeriod={null}
        />,
      )

      expect(await screen.findByText('Transition payroll skipped')).toBeInTheDocument()
    })

    it('does not show skip success alert when showSkipSuccessAlert is false', async () => {
      renderWithSuspense(
        <TransitionPayrollAlertPresentation
          groupedPayPeriods={mockGroupedPayPeriods}
          onRunPayroll={() => {}}
          onSkipPayroll={() => {}}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayPeriod={null}
        />,
      )

      await screen.findByText(/Transition payroll -/)
      expect(screen.queryByText('Transition payroll skipped')).not.toBeInTheDocument()
    })

    it('calls onDismissSkipSuccessAlert when alert is dismissed', async () => {
      const user = userEvent.setup()
      const onDismissSkipSuccessAlert = vi.fn()

      renderWithSuspense(
        <TransitionPayrollAlertPresentation
          groupedPayPeriods={mockGroupedPayPeriods}
          onRunPayroll={() => {}}
          onSkipPayroll={() => {}}
          showSkipSuccessAlert={true}
          onDismissSkipSuccessAlert={onDismissSkipSuccessAlert}
          skippingPayPeriod={null}
        />,
      )

      await screen.findByText('Transition payroll skipped')

      const dismissButton = screen.getByRole('button', { name: /dismiss/i })
      await user.click(dismissButton)

      expect(onDismissSkipSuccessAlert).toHaveBeenCalled()
    })
  })
})
