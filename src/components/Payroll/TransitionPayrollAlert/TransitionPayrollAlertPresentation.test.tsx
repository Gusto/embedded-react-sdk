import { Suspense } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
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
      expect(screen.queryByText('Transition payroll')).not.toBeInTheDocument()
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

      expect(await screen.findByText('Transition payroll')).toBeInTheDocument()
      expect(screen.getByText(/you changed your pay schedule/i)).toBeInTheDocument()
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

      await screen.findByText('Transition payroll')
      expect(screen.queryByText('Weekly Schedule')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /run transition payroll/i })).toBeInTheDocument()
    })

    it('renders multiple pay schedule groups with headers', async () => {
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

      await screen.findByText('Transition payroll')
      expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
      expect(screen.getByText('Monthly Schedule')).toBeInTheDocument()
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

      await screen.findByText('Transition payroll')

      const runButton = screen.getByRole('button', { name: /run transition payroll/i })
      await user.click(runButton)

      expect(onRunPayroll).toHaveBeenCalledWith(mockPayPeriod)
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

      await screen.findByText('Transition payroll')
      expect(screen.getByRole('button', { name: /skip this payroll/i })).toBeInTheDocument()
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

      await screen.findByText('Transition payroll')
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
