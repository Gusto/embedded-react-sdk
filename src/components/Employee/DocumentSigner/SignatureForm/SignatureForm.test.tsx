import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { SignatureForm } from './SignatureForm'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { componentEvents } from '@/shared/constants'
import { server } from '@/test/mocks/server'
import {
  handleSignEmployeeForm,
  handleGetEmployeeForm,
  handleGetEmployeeFormPdf,
} from '@/test/mocks/apis/employee_forms'
import { renderWithProviders } from '@/test-utils/renderWithProviders'

const testForm = {
  uuid: 'form-123',
  name: 'W-4',
  title: 'Form W-4',
  description: 'Federal tax withholding form.',
  status: 'not_signed',
  requires_signing: true,
  employee_uuid: 'employee-123',
}

const testFormPdf = {
  uuid: 'form-123',
  document_url: 'https://example.com/test-w4.pdf',
}

describe('Employee SignatureForm', () => {
  const mockOnEvent = vi.fn()
  const defaultProps = {
    employeeId: 'employee-123',
    formId: 'form-123',
    onEvent: mockOnEvent,
  }

  beforeEach(() => {
    setupApiTestMocks()
    mockOnEvent.mockClear()

    server.use(
      handleGetEmployeeForm(() => HttpResponse.json(testForm)),
      handleGetEmployeeFormPdf(() => HttpResponse.json(testFormPdf)),
      handleSignEmployeeForm(() => HttpResponse.json({ ...testForm, requires_signing: false })),
    )
  })

  describe('field rendering', () => {
    it('renders signature text input', async () => {
      renderWithProviders(<SignatureForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText('Signature')).toBeInTheDocument()
      })
    })

    it('renders confirm signature checkbox', async () => {
      renderWithProviders(<SignatureForm {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByLabelText('I am the employee and I agree to sign electronically'),
        ).toBeInTheDocument()
      })
    })

    it('renders form title in heading', async () => {
      renderWithProviders(<SignatureForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/Signature required for/)).toBeInTheDocument()
      })
    })

    it('renders submit and back buttons', async () => {
      renderWithProviders(<SignatureForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Sign form' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
      })
    })
  })

  describe('submission', () => {
    it('fires EMPLOYEE_SIGN_FORM on successful submission', async () => {
      const user = userEvent.setup()

      renderWithProviders(<SignatureForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText('Signature')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText('Signature'), 'Jane Doe')
      await user.click(
        screen.getByLabelText('I am the employee and I agree to sign electronically'),
      )
      await user.click(screen.getByRole('button', { name: 'Sign form' }))

      await waitFor(() => {
        expect(mockOnEvent).toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_SIGN_FORM,
          expect.objectContaining({ uuid: testForm.uuid }),
        )
      })
    })

    it('does not submit when signature is empty', async () => {
      const user = userEvent.setup()

      renderWithProviders(<SignatureForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText('Signature')).toBeInTheDocument()
      })

      await user.click(
        screen.getByLabelText('I am the employee and I agree to sign electronically'),
      )
      await user.click(screen.getByRole('button', { name: 'Sign form' }))

      await waitFor(() => {
        expect(mockOnEvent).not.toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_SIGN_FORM,
          expect.anything(),
        )
      })
    })

    it('does not submit when checkbox is not checked', async () => {
      const user = userEvent.setup()

      renderWithProviders(<SignatureForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByLabelText('Signature')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText('Signature'), 'Jane Doe')
      await user.click(screen.getByRole('button', { name: 'Sign form' }))

      await waitFor(() => {
        expect(mockOnEvent).not.toHaveBeenCalledWith(
          componentEvents.EMPLOYEE_SIGN_FORM,
          expect.anything(),
        )
      })
    })
  })

  describe('navigation', () => {
    it('fires CANCEL event when back button is clicked', async () => {
      const user = userEvent.setup()

      renderWithProviders(<SignatureForm {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Back' }))

      expect(mockOnEvent).toHaveBeenCalledWith(componentEvents.CANCEL)
    })
  })
})
