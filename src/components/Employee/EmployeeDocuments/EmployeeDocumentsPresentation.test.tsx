import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18next from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { EmployeeDocumentsPresentation } from './EmployeeDocumentsPresentation'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import EmployeeDocumentsTranslations from '@/i18n/en/Employee.EmployeeDocuments.json'

const i18n = i18next.createInstance()
void i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['Employee.EmployeeDocuments'],
  defaultNS: 'Employee.EmployeeDocuments',
  resources: {
    en: {
      'Employee.EmployeeDocuments': EmployeeDocumentsTranslations,
    },
  },
  interpolation: {
    escapeValue: false,
  },
})

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <GustoTestProvider>{ui}</GustoTestProvider>
    </I18nextProvider>,
  )
}

describe('EmployeeDocumentsPresentation', () => {
  const defaultProps = {
    isEmployeeSelfOnboarding: true,
    currentI9Status: false,
    onSubmit: vi.fn(),
    onDone: vi.fn(),
    isPending: false,
  }

  describe('when isEmployeeSelfOnboarding is true', () => {
    it('renders the self-onboarding view with checkbox', async () => {
      renderWithProviders(<EmployeeDocumentsPresentation {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Employee documents')).toBeInTheDocument()
      })
      expect(
        screen.getByText('During onboarding, employees will sign these documents.'),
      ).toBeInTheDocument()
      expect(screen.getByText('We automatically include')).toBeInTheDocument()
      expect(screen.getByText('Tax withholding (Form W-4)')).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: /Employment eligibility/i })).toBeInTheDocument()
    })

    it('shows info alert when i9 checkbox is unchecked', () => {
      renderWithProviders(
        <EmployeeDocumentsPresentation {...defaultProps} currentI9Status={false} />,
      )

      expect(screen.getByText('Have you completed the form I-9 already?')).toBeInTheDocument()
    })

    it('shows warning alert when i9 checkbox is checked', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <EmployeeDocumentsPresentation {...defaultProps} currentI9Status={false} />,
      )

      const checkbox = screen.getByRole('checkbox', { name: /Employment eligibility/i })
      await user.click(checkbox)

      await waitFor(() => {
        expect(screen.getByText('Verifying Form I-9 remotely?')).toBeInTheDocument()
      })
    })

    it('renders continue button with submit type', () => {
      renderWithProviders(<EmployeeDocumentsPresentation {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Continue' })
      expect(button).toBeInTheDocument()
    })

    it('shows loading state when isPending is true', () => {
      renderWithProviders(<EmployeeDocumentsPresentation {...defaultProps} isPending={true} />)

      const button = screen.getByRole('button', { name: 'Continue' })
      expect(button).toBeInTheDocument()
    })

    it('calls onSubmit when continue button is clicked', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      renderWithProviders(<EmployeeDocumentsPresentation {...defaultProps} onSubmit={onSubmit} />)

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })
    })
  })

  describe('when isEmployeeSelfOnboarding is false', () => {
    it('renders the not self-onboarding view without checkbox', () => {
      renderWithProviders(
        <EmployeeDocumentsPresentation {...defaultProps} isEmployeeSelfOnboarding={false} />,
      )

      expect(screen.getByText('Employee documents')).toBeInTheDocument()
      expect(
        screen.getByText('You will sign all these forms for your employee manually.'),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('checkbox', { name: /Employment eligibility/i }),
      ).not.toBeInTheDocument()
      expect(
        screen.getByText(
          'The government requires you to have Form I-9 and Form W-4 completed and signed.',
        ),
      ).toBeInTheDocument()
    })

    it('calls onDone when continue button is clicked', async () => {
      const user = userEvent.setup()
      const onDone = vi.fn()
      renderWithProviders(
        <EmployeeDocumentsPresentation
          {...defaultProps}
          isEmployeeSelfOnboarding={false}
          onDone={onDone}
        />,
      )

      const button = screen.getByRole('button', { name: 'Continue' })
      await user.click(button)

      expect(onDone).toHaveBeenCalled()
    })
  })
})
