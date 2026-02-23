import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmployeeDocuments } from './EmployeeDocuments'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('EmployeeDocuments', () => {
  const mockEmployeeId = 'employee_id'
  const mockOnEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
  })

  describe('when isSelfOnboarding is true', () => {
    it('renders the self-onboarding view with checkbox', async () => {
      renderWithProviders(
        <EmployeeDocuments
          employeeId={mockEmployeeId}
          isSelfOnboarding={true}
          onEvent={mockOnEvent}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Employee documents')).toBeInTheDocument()
      })

      expect(screen.getByText('During onboarding, employees will sign these documents.')).toBeInTheDocument()
      expect(screen.getByText('We automatically include')).toBeInTheDocument()
      expect(screen.getByText('Tax withholding (Form W-4)')).toBeInTheDocument()
      expect(screen.getByLabelText('Employment eligibility (Form I-9)')).toBeInTheDocument()
    })

    it('shows warning alert when i9 checkbox is unchecked', async () => {
      renderWithProviders(
        <EmployeeDocuments
          employeeId={mockEmployeeId}
          isSelfOnboarding={true}
          onEvent={mockOnEvent}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Employee documents')).toBeInTheDocument()
      })

      expect(screen.getByText('Have you completed the form I-9 already?')).toBeInTheDocument()
    })

    it('shows info alert when i9 checkbox is checked', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <EmployeeDocuments
          employeeId={mockEmployeeId}
          isSelfOnboarding={true}
          onEvent={mockOnEvent}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Employee documents')).toBeInTheDocument()
      })

      const checkbox = screen.getByLabelText('Employment eligibility (Form I-9)')
      await user.click(checkbox)

      await waitFor(() => {
        expect(screen.getByText('Verifying Form I-9 is remedial')).toBeInTheDocument()
      })
    })
  })

  describe('when isSelfOnboarding is false', () => {
    it('renders the not self-onboarding view without checkbox', async () => {
      renderWithProviders(
        <EmployeeDocuments
          employeeId={mockEmployeeId}
          isSelfOnboarding={false}
          onEvent={mockOnEvent}
        />,
      )

      await waitFor(() => {
        expect(screen.getByText('Employee documents')).toBeInTheDocument()
      })

      expect(screen.getByText('You will sign all these forms for your employee manually.')).toBeInTheDocument()
      expect(screen.queryByLabelText('Employment eligibility (Form I-9)')).not.toBeInTheDocument()
      expect(screen.getByText('The government requires you to have Form I-9 and Form W-2 completed and signed.')).toBeInTheDocument()
    })
  })
})
