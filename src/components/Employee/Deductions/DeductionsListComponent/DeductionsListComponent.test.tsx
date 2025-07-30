import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeductionsListComponent } from './DeductionsListComponent'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

// Mock the API hooks
vi.mock('@gusto/embedded-api/react-query/garnishmentsList', () => ({
  useGarnishmentsListSuspense: vi.fn(),
}))

vi.mock('@gusto/embedded-api/react-query/garnishmentsUpdate', () => ({
  useGarnishmentsUpdateMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}))

const mockUseGarnishmentsListSuspense = vi.mocked(
  await import('@gusto/embedded-api/react-query/garnishmentsList'),
).useGarnishmentsListSuspense

describe('DeductionsListComponent', () => {
  const user = userEvent.setup()
  const mockOnEvent = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderDeductionsList = (deductions: unknown[] = []) => {
    mockUseGarnishmentsListSuspense.mockReturnValue({
      data: {
        garnishmentList: deductions,
      },
    } as ReturnType<typeof mockUseGarnishmentsListSuspense>)

    return renderWithProviders(
      <DeductionsListComponent employeeId="test-employee-id" onEvent={mockOnEvent} />,
    )
  }

  describe('Button Rendering', () => {
    it('should show "Add another deduction" button', () => {
      renderDeductionsList([])

      expect(screen.getByText('+ Add another deduction')).toBeInTheDocument()
    })

    it('should show "Add another deduction" button when deductions exist', () => {
      const mockDeductions = [
        {
          uuid: '1',
          description: 'Test Deduction',
          amount: '100',
          active: true,
          recurring: true,
          deductAsPercentage: false,
        },
      ]

      renderDeductionsList(mockDeductions)

      expect(screen.getByText('+ Add another deduction')).toBeInTheDocument()
    })

    it('should show "Continue" button when no deductions exist', () => {
      renderDeductionsList([])
      expect(screen.getAllByText('Continue')).toHaveLength(1)
    })

    it('should show "Continue" button when deductions exist', () => {
      const mockDeductions = [
        {
          uuid: '1',
          description: 'Test Deduction',
          amount: '100',
          active: true,
          recurring: true,
          deductAsPercentage: false,
        },
      ]

      renderDeductionsList(mockDeductions)
      expect(screen.getAllByText('Continue')).toHaveLength(1)
    })
  })

  describe('Button Interactions', () => {
    it('should trigger EMPLOYEE_DEDUCTION_ADD when "Add another deduction" is clicked', async () => {
      const mockDeductions = [
        {
          uuid: '1',
          description: 'Test Deduction',
          amount: '100',
          active: true,
          recurring: true,
          deductAsPercentage: false,
        },
      ]

      renderDeductionsList(mockDeductions)

      const addButton = screen.getByText('+ Add another deduction')
      await user.click(addButton)

      expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_DEDUCTION_ADD)
    })

    it('should trigger EMPLOYEE_DEDUCTION_DONE when "Continue" is clicked', async () => {
      renderDeductionsList([])

      const continueButton = screen.getByText('Continue')
      await user.click(continueButton)

      expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_DEDUCTION_DONE)
    })
  })

  describe('Deductions Display', () => {
    it('should display existing deductions in a table', () => {
      const mockDeductions = [
        {
          uuid: '1',
          description: 'Health Insurance',
          amount: '100',
          active: true,
          recurring: true,
          deductAsPercentage: false,
        },
        {
          uuid: '2',
          description: 'Parking Fee',
          amount: '50',
          active: true,
          recurring: true,
          deductAsPercentage: false,
        },
      ]

      renderDeductionsList(mockDeductions)

      expect(screen.getByText('Health Insurance')).toBeInTheDocument()
      expect(screen.getByText('Parking Fee')).toBeInTheDocument()
    })

    it('should show empty state when no deductions exist', () => {
      renderDeductionsList([])

      // The component should auto-redirect, but we can still test the empty state
      // The empty state is handled by the DataView component
      expect(screen.getByTestId('data-view')).toBeInTheDocument()
    })
  })
})
