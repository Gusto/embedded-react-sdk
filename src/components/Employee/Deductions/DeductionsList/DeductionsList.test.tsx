import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { DeductionsList } from './DeductionsList'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { getEmployeeGarnishments } from '@/test/mocks/apis/employees'
import { server } from '@/test/mocks/server'

vi.mock('@/hooks/useContainerBreakpoints/useContainerBreakpoints', async () => {
  const actual = await vi.importActual('@/hooks/useContainerBreakpoints/useContainerBreakpoints')
  return {
    ...actual,
    default: () => ['base', 'small', 'medium', 'large'],
    useContainerBreakpoints: () => ['base', 'small', 'medium', 'large'],
  }
})

describe('DeductionsList', () => {
  const user = userEvent.setup()
  const mockOnEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    server.use(getEmployeeGarnishments)
  })

  const renderDeductionsList = (deductions: unknown[] = []) => {
    server.use(
      http.get('/api/v1/employees/:employee_id/garnishments', () =>
        HttpResponse.json({ garnishments: deductions }),
      ),
    )

    return renderWithProviders(
      <DeductionsList employeeId="test-employee-id" onEvent={mockOnEvent} />,
    )
  }

  describe('Button Rendering', () => {
    it('should show "Add another deduction" button', async () => {
      renderDeductionsList([])

      await waitFor(() => {
        expect(screen.getByText('Add another deduction')).toBeInTheDocument()
      })
    })

    it('should show "Add another deduction" button when deductions exist', async () => {
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

      await waitFor(() => {
        expect(screen.getByText('Add another deduction')).toBeInTheDocument()
      })
    })

    it('should show "Continue" button when no deductions exist', async () => {
      renderDeductionsList([])
      await waitFor(() => {
        expect(screen.getAllByText('Continue')).toHaveLength(1)
      })
    })

    it('should show "Continue" button when deductions exist', async () => {
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
      await waitFor(() => {
        expect(screen.getAllByText('Continue')).toHaveLength(1)
      })
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

      await waitFor(() => {
        expect(screen.getByText('Add another deduction')).toBeInTheDocument()
      })

      const addButton = screen.getByText('Add another deduction')
      await user.click(addButton)

      expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_DEDUCTION_ADD)
    })

    it('should trigger EMPLOYEE_DEDUCTION_DONE when "Continue" is clicked', async () => {
      renderDeductionsList([])

      await waitFor(() => {
        expect(screen.getByText('Continue')).toBeInTheDocument()
      })

      const continueButton = screen.getByText('Continue')
      await user.click(continueButton)

      expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_DEDUCTION_DONE)
    })
  })

  describe('Deductions Display', () => {
    it('should display existing deductions in a table', async () => {
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

      await waitFor(() => {
        // Check that the table is rendered with correct headers
        expect(screen.getByTestId('data-table')).toBeInTheDocument()
        expect(screen.getByText('Deduction')).toBeInTheDocument()
        expect(screen.getByText('Frequency')).toBeInTheDocument()
        expect(screen.getByText('Withheld')).toBeInTheDocument()
      })
    })

    it('should show empty state when no deductions exist', async () => {
      renderDeductionsList([])

      await waitFor(() => {
        expect(screen.getByTestId('data-view')).toBeInTheDocument()
      })
    })
  })
})

// Row-action coverage (Edit click, soft-delete soft-deletes via PUT active:false,
// DELETED vs DELETED_EMPTY branching) lives in the new list hook's unit tests
// rather than here. The HamburgerMenu uses a react-aria Popover that does not open
// reliably under jsdom (see Common/UI/Menu/Menu.test.tsx for the canonical caveat),
// so the row-action event surface is locked down at the hook level — that's where
// the delete mutation and the remaining-count → event-selection logic live after
// the migration.
