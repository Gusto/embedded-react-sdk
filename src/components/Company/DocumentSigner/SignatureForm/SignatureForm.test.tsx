import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { SignatureForm } from './SignatureForm'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { companyEvents } from '@/shared/constants'
import { server } from '@/test/mocks/server'
import {
  handleSignCompanyForm,
  handleGetCompanyForm,
  handleGetCompanyFormPdf,
} from '@/test/mocks/apis/company_forms'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const testForm = {
  uuid: 'form-123',
  name: 'Test Form',
  title: 'Tax Document',
  description: 'Please review and sign this tax document.',
  status: 'not_signed',
  form_type: 'company',
  created_at: '2024-05-29T12:00:00Z',
  updated_at: '2024-05-29T12:30:00Z',
  requires_signing: true,
}

const testFormPdf = {
  uuid: 'form-123',
  document_url: 'data:application/pdf;base64,JVBE',
}

describe('SignatureForm', () => {
  const mockOnEvent = vi.fn()

  beforeEach(() => {
    setupApiTestMocks()
    mockOnEvent.mockClear()
    vi.resetModules()

    server.use(
      handleGetCompanyForm(() => HttpResponse.json(testForm)),
      handleGetCompanyFormPdf(() => HttpResponse.json(testFormPdf)),
      handleSignCompanyForm(() => HttpResponse.json(testForm)),
    )
  })

  describe('field rendering', () => {
    it('renders signature text input', async () => {
      renderWithProviders(
        <SignatureForm formId="form-123" companyId="company-123" onEvent={mockOnEvent} />,
      )

      await waitFor(() => {
        expect(screen.getByLabelText('Signature')).toBeInTheDocument()
      })
    })

    it('renders confirm signature checkbox', async () => {
      renderWithProviders(
        <SignatureForm formId="form-123" companyId="company-123" onEvent={mockOnEvent} />,
      )

      await waitFor(() => {
        expect(
          screen.getByLabelText('I am the signatory and I agree to sign electronically'),
        ).toBeInTheDocument()
      })
    })

    it('renders form title in heading', async () => {
      renderWithProviders(
        <SignatureForm formId="form-123" companyId="company-123" onEvent={mockOnEvent} />,
      )

      await waitFor(() => {
        expect(screen.getByText(/Signature required for/)).toBeInTheDocument()
      })
    })

    it('renders submit and back buttons', async () => {
      renderWithProviders(
        <SignatureForm formId="form-123" companyId="company-123" onEvent={mockOnEvent} />,
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Sign form' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
      })
    })
  })

  describe('submission', () => {
    it('fires the correct events when form is submitted successfully', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <SignatureForm formId="form-123" companyId="company-123" onEvent={mockOnEvent} />,
      )

      await waitFor(() => {
        expect(screen.getByText(/Signature required for/)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText('Signature'), 'John Doe')

      const checkbox = screen.getByLabelText(
        'I am the signatory and I agree to sign electronically',
      )
      await user.click(checkbox)

      const submitButton = screen.getByRole('button', { name: 'Sign form' })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnEvent).toHaveBeenCalledWith(
          companyEvents.COMPANY_SIGN_FORM,
          expect.objectContaining({
            uuid: testForm.uuid,
          }),
        )
        expect(mockOnEvent).toHaveBeenCalledWith(companyEvents.COMPANY_SIGN_FORM_DONE)
      })
    })

    it('does not submit when signature is empty', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <SignatureForm formId="form-123" companyId="company-123" onEvent={mockOnEvent} />,
      )

      await waitFor(() => {
        expect(screen.getByText(/Signature required for/)).toBeInTheDocument()
      })

      const checkbox = screen.getByLabelText(
        'I am the signatory and I agree to sign electronically',
      )
      await user.click(checkbox)

      await user.click(screen.getByRole('button', { name: 'Sign form' }))

      await waitFor(() => {
        expect(mockOnEvent).not.toHaveBeenCalledWith(
          companyEvents.COMPANY_SIGN_FORM,
          expect.anything(),
        )
      })
    })

    it('does not submit when checkbox is not checked', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <SignatureForm formId="form-123" companyId="company-123" onEvent={mockOnEvent} />,
      )

      await waitFor(() => {
        expect(screen.getByText(/Signature required for/)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText('Signature'), 'John Doe')

      await user.click(screen.getByRole('button', { name: 'Sign form' }))

      await waitFor(() => {
        expect(mockOnEvent).not.toHaveBeenCalledWith(
          companyEvents.COMPANY_SIGN_FORM,
          expect.anything(),
        )
      })
    })
  })

  describe('navigation', () => {
    it('fires the back event when back button is clicked', async () => {
      const user = userEvent.setup()

      renderWithProviders(
        <SignatureForm formId="form-123" companyId="company-123" onEvent={mockOnEvent} />,
      )

      await waitFor(() => {
        expect(screen.getByText(/Signature required for/)).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: 'Back' })
      await user.click(backButton)

      expect(mockOnEvent).toHaveBeenCalledWith(companyEvents.COMPANY_SIGN_FORM_BACK)
    })
  })
})
