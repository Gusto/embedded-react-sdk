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

describe('PayrollListPresentation', () => {
  describe('rendering', () => {
    it('renders pay period information', async () => {
      renderWithProviders(
        <PayrollListPresentation
          onRunPayroll={() => {}}
          onSubmitPayroll={() => {}}
          onSkipPayroll={() => {}}
          onViewBlockers={() => {}}
          payrolls={[mockUnprocessedPayroll]}
          paySchedules={mockPaySchedules}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayrollId={null}
          blockers={[]}
          wireInRequests={[]}
        />,
      )

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      expect(screen.getByText(/Dec 1 - Dec 15, 2024/)).toBeInTheDocument()
    })

    it('renders pay schedule name', async () => {
      renderWithProviders(
        <PayrollListPresentation
          onRunPayroll={() => {}}
          onSubmitPayroll={() => {}}
          onSkipPayroll={() => {}}
          onViewBlockers={() => {}}
          payrolls={[mockUnprocessedPayroll]}
          paySchedules={mockPaySchedules}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayrollId={null}
          blockers={[]}
          wireInRequests={[]}
        />,
      )

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
    })
  })

  describe('skip payroll menu', () => {
    it('shows hamburger menu with skip option when there are no blockers and pay period has started', async () => {
      renderWithProviders(
        <PayrollListPresentation
          onRunPayroll={() => {}}
          onSubmitPayroll={() => {}}
          onSkipPayroll={() => {}}
          onViewBlockers={() => {}}
          payrolls={[mockUnprocessedPayroll]}
          paySchedules={mockPaySchedules}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayrollId={null}
          blockers={[]}
          wireInRequests={[]}
        />,
      )

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const hamburgerButton = screen.getByRole('button', { name: /open menu/i })
      expect(hamburgerButton).toBeInTheDocument()
    })

    it('does not show hamburger menu when there are blockers', async () => {
      renderWithProviders(
        <PayrollListPresentation
          onRunPayroll={() => {}}
          onSubmitPayroll={() => {}}
          onSkipPayroll={() => {}}
          onViewBlockers={() => {}}
          payrolls={[mockUnprocessedPayroll]}
          paySchedules={mockPaySchedules}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayrollId={null}
          blockers={mockBlockers}
          wireInRequests={[]}
        />,
      )

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

      renderWithProviders(
        <PayrollListPresentation
          onRunPayroll={() => {}}
          onSubmitPayroll={() => {}}
          onSkipPayroll={() => {}}
          onViewBlockers={() => {}}
          payrolls={[futurePayroll]}
          paySchedules={mockPaySchedules}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayrollId={null}
          blockers={[]}
          wireInRequests={[]}
        />,
      )

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

      renderWithProviders(
        <PayrollListPresentation
          onRunPayroll={() => {}}
          onSubmitPayroll={() => {}}
          onSkipPayroll={() => {}}
          onViewBlockers={() => {}}
          payrolls={[todayPayroll]}
          paySchedules={mockPaySchedules}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayrollId={null}
          blockers={[]}
          wireInRequests={[]}
        />,
      )

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

      renderWithProviders(
        <PayrollListPresentation
          onRunPayroll={() => {}}
          onSubmitPayroll={() => {}}
          onSkipPayroll={() => {}}
          onViewBlockers={() => {}}
          payrolls={[pastPayroll]}
          paySchedules={mockPaySchedules}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayrollId={null}
          blockers={[]}
          wireInRequests={[]}
        />,
      )

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const hamburgerButton = screen.getByRole('button', { name: /open menu/i })
      expect(hamburgerButton).toBeInTheDocument()
    })

    it('does not show hamburger menu for processed payrolls', async () => {
      const processedPayroll: PresentationPayroll = {
        ...mockUnprocessedPayroll,
        processed: true,
      }

      renderWithProviders(
        <PayrollListPresentation
          onRunPayroll={() => {}}
          onSubmitPayroll={() => {}}
          onSkipPayroll={() => {}}
          onViewBlockers={() => {}}
          payrolls={[processedPayroll]}
          paySchedules={mockPaySchedules}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayrollId={null}
          blockers={[]}
          wireInRequests={[]}
        />,
      )

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const hamburgerButton = screen.queryByRole('button', { name: /open menu/i })
      expect(hamburgerButton).not.toBeInTheDocument()
    })
  })

  describe('payroll actions', () => {
    it('calls onRunPayroll when run payroll button is clicked', async () => {
      const user = userEvent.setup()
      const onRunPayroll = vi.fn()

      renderWithProviders(
        <PayrollListPresentation
          onRunPayroll={onRunPayroll}
          onSubmitPayroll={() => {}}
          onSkipPayroll={() => {}}
          onViewBlockers={() => {}}
          payrolls={[mockUnprocessedPayroll]}
          paySchedules={mockPaySchedules}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayrollId={null}
          blockers={[]}
          wireInRequests={[]}
        />,
      )

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
          onRunPayroll={() => {}}
          onSubmitPayroll={onSubmitPayroll}
          onSkipPayroll={() => {}}
          onViewBlockers={() => {}}
          payrolls={[mockCalculatedPayroll]}
          paySchedules={mockPaySchedules}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayrollId={null}
          blockers={[]}
          wireInRequests={[]}
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
      renderWithProviders(
        <PayrollListPresentation
          onRunPayroll={() => {}}
          onSubmitPayroll={() => {}}
          onSkipPayroll={() => {}}
          onViewBlockers={() => {}}
          payrolls={[mockUnprocessedPayroll]}
          paySchedules={mockPaySchedules}
          showSkipSuccessAlert={true}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayrollId={null}
          blockers={[]}
          wireInRequests={[]}
        />,
      )

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      expect(screen.getByText('Payroll skipped')).toBeInTheDocument()
    })

    it('does not show skip success alert when showSkipSuccessAlert is false', async () => {
      renderWithProviders(
        <PayrollListPresentation
          onRunPayroll={() => {}}
          onSubmitPayroll={() => {}}
          onSkipPayroll={() => {}}
          onViewBlockers={() => {}}
          payrolls={[mockUnprocessedPayroll]}
          paySchedules={mockPaySchedules}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayrollId={null}
          blockers={[]}
          wireInRequests={[]}
        />,
      )

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      expect(screen.queryByText('Payroll skipped')).not.toBeInTheDocument()
    })

    it('calls onDismissSkipSuccessAlert when alert is dismissed', async () => {
      const user = userEvent.setup()
      const onDismissSkipSuccessAlert = vi.fn()

      renderWithProviders(
        <PayrollListPresentation
          onRunPayroll={() => {}}
          onSubmitPayroll={() => {}}
          onSkipPayroll={() => {}}
          onViewBlockers={() => {}}
          payrolls={[mockUnprocessedPayroll]}
          paySchedules={mockPaySchedules}
          showSkipSuccessAlert={true}
          onDismissSkipSuccessAlert={onDismissSkipSuccessAlert}
          skippingPayrollId={null}
          blockers={[]}
          wireInRequests={[]}
        />,
      )

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const dismissButton = screen.getByRole('button', { name: /dismiss/i })
      await user.click(dismissButton)

      expect(onDismissSkipSuccessAlert).toHaveBeenCalled()
    })
  })

  describe('payroll blockers', () => {
    it('displays blocker alerts when blockers exist', async () => {
      renderWithProviders(
        <PayrollListPresentation
          onRunPayroll={() => {}}
          onSubmitPayroll={() => {}}
          onSkipPayroll={() => {}}
          onViewBlockers={() => {}}
          payrolls={[mockUnprocessedPayroll]}
          paySchedules={mockPaySchedules}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayrollId={null}
          blockers={mockBlockers}
          wireInRequests={[]}
        />,
      )

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      expect(screen.getByText('Missing Bank Info')).toBeInTheDocument()
      expect(screen.getByText('Missing Signatory')).toBeInTheDocument()
    })

    it('calls onViewBlockers when view all link is clicked with multiple blockers', async () => {
      const user = userEvent.setup()
      const onViewBlockers = vi.fn()

      renderWithProviders(
        <PayrollListPresentation
          onRunPayroll={() => {}}
          onSubmitPayroll={() => {}}
          onSkipPayroll={() => {}}
          onViewBlockers={onViewBlockers}
          payrolls={[mockUnprocessedPayroll]}
          paySchedules={mockPaySchedules}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayrollId={null}
          blockers={mockBlockers}
          wireInRequests={[]}
        />,
      )

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      const viewAllButton = screen.getByText('View All Blockers')
      await user.click(viewAllButton)

      expect(onViewBlockers).toHaveBeenCalled()
    })

    it('does not show blocker alerts when there are no blockers', async () => {
      renderWithProviders(
        <PayrollListPresentation
          onRunPayroll={() => {}}
          onSubmitPayroll={() => {}}
          onSkipPayroll={() => {}}
          onViewBlockers={() => {}}
          payrolls={[mockUnprocessedPayroll]}
          paySchedules={mockPaySchedules}
          showSkipSuccessAlert={false}
          onDismissSkipSuccessAlert={() => {}}
          skippingPayrollId={null}
          blockers={[]}
          wireInRequests={[]}
        />,
      )

      await screen.findByRole('heading', { name: 'Upcoming payroll' })
      expect(screen.queryByText('Missing Bank Info')).not.toBeInTheDocument()
      expect(screen.queryByText('Missing Signatory')).not.toBeInTheDocument()
    })
  })
})
