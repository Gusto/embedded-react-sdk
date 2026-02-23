import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmployeeDocumentsPresentation } from './EmployeeDocumentsPresentation'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

describe('EmployeeDocumentsPresentation', () => {
  const defaultProps = {
    isSelfOnboarding: true,
    currentI9Status: false,
    onSubmit: vi.fn(),
    onContinue: vi.fn(),
    isPending: false,
  }

  describe('when isSelfOnboarding is true', () => {
    it('renders the self-onboarding view with checkbox', () => {
      renderWithProviders(<EmployeeDocumentsPresentation {...defaultProps} />)

      expect(screen.getByText('Employee documents')).toBeInTheDocument()
      expect(
        screen.getByText('During onboarding, employees will sign these documents.'),
      ).toBeInTheDocument()
      expect(screen.getByText('We automatically include')).toBeInTheDocument()
      expect(screen.getByText('Tax withholding (Form W-4)')).toBeInTheDocument()
      expect(screen.getByLabelText('Employment eligibility (Form I-9)')).toBeInTheDocument()
    })

    it('shows warning alert when i9 checkbox is unchecked', () => {
      renderWithProviders(
        <EmployeeDocumentsPresentation {...defaultProps} currentI9Status={false} />,
      )

      expect(
        screen.getByText('Have you completed the form I-9 already?'),
      ).toBeInTheDocument()
    })

    it('shows info alert when i9 checkbox is checked', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <EmployeeDocumentsPresentation {...defaultProps} currentI9Status={false} />,
      )

      const checkbox = screen.getByLabelText('Employment eligibility (Form I-9)')
      await user.click(checkbox)

      await waitFor(() => {
        expect(screen.getByText('Verifying Form I-9 is remedial')).toBeInTheDocument()
      })
    })

    it('renders continue button with submit type', () => {
      renderWithProviders(<EmployeeDocumentsPresentation {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Continue' })
      expect(button).toBeInTheDocument()
    })

    it('shows loading state when isPending is true', () => {
      renderWithProviders(
        <EmployeeDocumentsPresentation {...defaultProps} isPending={true} />,
      )

      const button = screen.getByRole('button', { name: 'Continue' })
      expect(button).toBeInTheDocument()
    })

    it('calls onContinue when continue button is clicked', async () => {
      const user = userEvent.setup()
      const onContinue = vi.fn()
      renderWithProviders(
        <EmployeeDocumentsPresentation {...defaultProps} onContinue={onContinue} />,
      )

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      expect(onContinue).toHaveBeenCalled()
    })
  })

  describe('when isSelfOnboarding is false', () => {
    it('renders the not self-onboarding view without checkbox', () => {
      renderWithProviders(
        <EmployeeDocumentsPresentation {...defaultProps} isSelfOnboarding={false} />,
      )

      expect(screen.getByText('Employee documents')).toBeInTheDocument()
      expect(
        screen.getByText('You will sign all these forms for your employee manually.'),
      ).toBeInTheDocument()
      expect(
        screen.queryByLabelText('Employment eligibility (Form I-9)'),
      ).not.toBeInTheDocument()
      expect(
        screen.getByText(
          'The government requires you to have Form I-9 and Form W-2 completed and signed.',
        ),
      ).toBeInTheDocument()
    })

    it('calls onContinue when continue button is clicked', async () => {
      const user = userEvent.setup()
      const onContinue = vi.fn()
      renderWithProviders(
        <EmployeeDocumentsPresentation
          {...defaultProps}
          isSelfOnboarding={false}
          onContinue={onContinue}
        />,
      )

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      expect(onContinue).toHaveBeenCalled()
    })
  })
})
