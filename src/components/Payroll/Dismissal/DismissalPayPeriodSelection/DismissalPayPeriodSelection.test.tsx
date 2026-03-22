import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DismissalPayPeriodSelection } from './DismissalPayPeriodSelection'
import { componentEvents } from '@/shared/constants'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const mockCreateOffCyclePayroll = vi.fn()

vi.mock('@gusto/embedded-api/react-query/paySchedulesGetUnprocessedTerminationPeriods', () => ({
  usePaySchedulesGetUnprocessedTerminationPeriodsSuspense: () => ({
    data: {
      unprocessedTerminationPayPeriodList: [
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
      ],
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

    it('sends the period checkDate when available', async () => {
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
      expect(call.request.requestBody.checkDate).toBeDefined()
    })
  })

  describe('payroll creation with missing checkDate', () => {
    beforeEach(() => {
      vi.doMock(
        '@gusto/embedded-api/react-query/paySchedulesGetUnprocessedTerminationPeriods',
        () => ({
          usePaySchedulesGetUnprocessedTerminationPeriodsSuspense: () => ({
            data: {
              unprocessedTerminationPayPeriodList: [
                {
                  startDate: '2024-12-01',
                  endDate: '2024-12-14',
                  employeeUuid: 'emp-1',
                  employeeName: 'Jane Doe',
                  payScheduleUuid: 'ps-1',
                },
              ],
            },
          }),
        }),
      )
    })

    it('computes a fallback checkDate when period has no checkDate', async () => {
      const user = userEvent.setup()
      mockCreateOffCyclePayroll.mockResolvedValueOnce({
        payrollUnprocessed: { payrollUuid: 'new-payroll-456' },
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
      expect(call.request.requestBody.checkDate).toBeDefined()
    })
  })
})
