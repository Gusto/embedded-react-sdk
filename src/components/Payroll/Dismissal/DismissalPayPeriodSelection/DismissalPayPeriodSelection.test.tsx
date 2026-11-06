import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import type { UnprocessedTerminationPayPeriod } from '@gusto/embedded-api/models/components/unprocessedterminationpayperiod'
import { DismissalPayPeriodSelection } from './DismissalPayPeriodSelection'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const mockCreateOffCyclePayroll = vi.fn()

const defaultPayPeriods: UnprocessedTerminationPayPeriod[] = [
  {
    startDate: '2024-12-01',
    endDate: '2024-12-14',
    checkDate: '2024-12-17',
    employeeUuid: 'emp-1',
    employeeName: 'Jane Doe',
    payScheduleUuid: 'ps-1',
  },
  {
    startDate: '2024-12-15',
    endDate: '2024-12-28',
    checkDate: '2024-12-31',
    employeeUuid: 'emp-1',
    employeeName: 'Jane Doe',
    payScheduleUuid: 'ps-1',
  },
  {
    startDate: '2024-12-01',
    endDate: '2024-12-14',
    checkDate: '2024-12-17',
    employeeUuid: 'emp-2',
    employeeName: 'John Smith',
    payScheduleUuid: 'ps-2',
  },
]

let mockPayPeriods: UnprocessedTerminationPayPeriod[] = defaultPayPeriods

vi.mock('@gusto/embedded-api/react-query/paySchedulesGetUnprocessedTerminationPeriods', () => ({
  usePaySchedulesGetUnprocessedTerminationPeriodsSuspense: () => ({
    data: {
      unprocessedTerminationPayPeriods: mockPayPeriods,
    },
  }),
}))

vi.mock('@gusto/embedded-api/react-query/payrollsCreateOffCycle', () => ({
  usePayrollsCreateOffCycleMutation: () => ({
    mutateAsync: mockCreateOffCyclePayroll,
    isPending: false,
  }),
}))

const defaultProps = {
  companyId: 'company-123',
  employeeId: 'emp-1',
  onEvent: vi.fn(),
}

function renderComponent(props = {}) {
  return renderWithProviders(<DismissalPayPeriodSelection {...defaultProps} {...props} />)
}

describe('DismissalPayPeriodSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateOffCyclePayroll.mockReset()
    mockPayPeriods = defaultPayPeriods
  })

  describe('rendering', () => {
    it('renders the page title and description', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /run dismissal payroll/i })).toBeInTheDocument()
      })

      expect(
        screen.getByText(/select the pay period for the terminated employee/i),
      ).toBeInTheDocument()
    })

    it('renders the pay period select with label', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByLabelText(/pay period/i)).toBeInTheDocument()
      })
    })

    it('renders the continue button', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })
    })

    it('applies custom className', async () => {
      const { container } = renderComponent({ className: 'custom-class' })

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /run dismissal payroll/i })).toBeInTheDocument()
      })

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('filters pay periods to the specified employee', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /run dismissal payroll/i })).toBeInTheDocument()
      })

      expect(screen.queryByText(/John Smith/i)).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty state when no pay periods exist for employee', async () => {
      renderComponent({ employeeId: 'non-existent-employee' })

      await waitFor(() => {
        expect(screen.getByText(/no unprocessed termination pay periods/i)).toBeInTheDocument()
      })
    })
  })

  describe('payroll creation', () => {
    it('creates payroll for the selected employee when two employees share a pay period', async () => {
      const sharedPayPeriod: UnprocessedTerminationPayPeriod = {
        startDate: '2024-12-01',
        endDate: '2024-12-14',
        checkDate: '2024-12-17',
        payScheduleUuid: 'ps-1',
      }
      mockPayPeriods = [
        { ...sharedPayPeriod, employeeName: 'Jane Doe', employeeUuid: 'emp-1' },
        { ...sharedPayPeriod, employeeName: 'John Smith', employeeUuid: 'emp-2' },
      ]
      const user = userEvent.setup()
      mockCreateOffCyclePayroll.mockResolvedValueOnce({
        payrollUnprocessed: { payrollUuid: 'selected-employee-payroll' },
      })

      renderComponent({ employeeId: undefined })

      await user.click(await screen.findByLabelText(/pay period/i))
      expect(await screen.findAllByRole('option')).toHaveLength(2)
      await user.click(screen.getByRole('option', { name: /John Smith/ }))
      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(mockCreateOffCyclePayroll).toHaveBeenCalledExactlyOnceWith({
          request: {
            companyId: 'company-123',
            requestBody: {
              offCycle: true,
              offCycleReason: 'Dismissed employee',
              startDate: new RFCDate('2024-12-01'),
              endDate: new RFCDate('2024-12-14'),
              employeeUuids: ['emp-2'],
            },
          },
        })
      })
      await waitFor(() => {
        expect(defaultProps.onEvent).toHaveBeenCalledWith(
          componentEvents.DISMISSAL_PAY_PERIOD_SELECTED,
          { payrollUuid: 'selected-employee-payroll' },
        )
      })
    })

    it('creates off-cycle payroll on submit and fires event', async () => {
      const user = userEvent.setup()
      mockCreateOffCyclePayroll.mockResolvedValueOnce({
        payrollUnprocessed: { payrollUuid: 'new-payroll-123' },
      })

      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })

      const selectTrigger = screen.getByLabelText(/pay period/i)
      await user.click(selectTrigger)

      const options = await screen.findAllByRole('option')
      expect(options.length).toBeGreaterThan(0)
      await user.click(options[0]!)

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(mockCreateOffCyclePayroll).toHaveBeenCalledWith(
          expect.objectContaining({
            request: expect.objectContaining({
              companyId: 'company-123',
              requestBody: expect.objectContaining({
                offCycle: true,
                offCycleReason: 'Dismissed employee',
                employeeUuids: ['emp-1'],
              }),
            }),
          }),
        )
      })

      await waitFor(() => {
        expect(defaultProps.onEvent).toHaveBeenCalledWith(
          componentEvents.DISMISSAL_PAY_PERIOD_SELECTED,
          { payrollUuid: 'new-payroll-123' },
        )
      })
    })

    it('does not send checkDate so the server computes it', async () => {
      const user = userEvent.setup()
      mockCreateOffCyclePayroll.mockResolvedValueOnce({
        payrollUnprocessed: { payrollUuid: 'new-payroll-123' },
      })

      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })

      const selectTrigger = screen.getByLabelText(/pay period/i)
      await user.click(selectTrigger)
      const options = await screen.findAllByRole('option')
      await user.click(options[0]!)

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(mockCreateOffCyclePayroll).toHaveBeenCalled()
      })

      const call = mockCreateOffCyclePayroll.mock.calls[0]![0]
      expect(call.request.requestBody.checkDate).toBeUndefined()
    })
  })

  describe('auto-selection behavior', () => {
    it('shows selection UI with employee pre-selected when only one dismissal exists and no employeeId', async () => {
      mockPayPeriods = [
        {
          startDate: '2024-12-01',
          endDate: '2024-12-14',
          checkDate: '2024-12-17',
          employeeUuid: 'emp-1',
          employeeName: 'Jane Doe',
          payScheduleUuid: 'ps-1',
        },
      ]

      renderComponent({ employeeId: undefined })

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /run dismissal payroll/i })).toBeInTheDocument()
      })

      expect(screen.getByLabelText(/pay period/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled()
    })

    it('auto-advances when both payrollId and employeeId are passed', async () => {
      renderComponent({ employeeId: 'emp-1', payrollId: 'payroll-123' })

      await waitFor(() => {
        expect(defaultProps.onEvent).toHaveBeenCalledWith(
          componentEvents.DISMISSAL_PAY_PERIOD_SELECTED,
          { payrollUuid: 'payroll-123' },
        )
      })

      expect(
        screen.queryByRole('heading', { name: /run dismissal payroll/i }),
      ).not.toBeInTheDocument()
    })
  })

  describe('payroll creation with missing checkDate', () => {
    it('does not send checkDate even when period has no checkDate', async () => {
      mockPayPeriods = [
        {
          startDate: '2024-12-01',
          endDate: '2024-12-14',
          employeeUuid: 'emp-1',
          employeeName: 'Jane Doe',
          payScheduleUuid: 'ps-1',
        },
      ]

      const user = userEvent.setup()
      mockCreateOffCyclePayroll.mockResolvedValueOnce({
        payrollUnprocessed: { payrollUuid: 'new-payroll-456' },
      })

      renderComponent()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /continue/i }))

      await waitFor(() => {
        expect(mockCreateOffCyclePayroll).toHaveBeenCalled()
      })

      const call = mockCreateOffCyclePayroll.mock.calls[0]![0]
      expect(call.request.requestBody.checkDate).toBeUndefined()
    })
  })
})
