import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IncludeDeductions } from './IncludeDeductions'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
import { componentEvents } from '@/shared/constants'

vi.mock('@/hooks/useContainerBreakpoints/useContainerBreakpoints', async () => {
  const actual = await vi.importActual('@/hooks/useContainerBreakpoints/useContainerBreakpoints')
  return {
    ...actual,
    default: () => ['base', 'small', 'medium', 'large'],
    useContainerBreakpoints: () => ['base', 'small', 'medium', 'large'],
  }
})

describe('IncludeDeductions', () => {
  const user = userEvent.setup()
  const mockOnEvent = vi.fn()

  describe('Empty state actions rendering', () => {
    it('should show "Add deduction" button', async () => {
      renderWithProviders(<IncludeDeductions employeeId="test-employee-id" onEvent={mockOnEvent} />)

      await waitFor(() => {
        expect(screen.getByText('Deductions')).toBeInTheDocument()
      })

      const addButton = screen.getByText('Add deduction')

      await user.click(addButton)

      expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_YES)
    })
  })
})
