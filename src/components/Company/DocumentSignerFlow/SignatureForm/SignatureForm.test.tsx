import { mockResizeObserver } from 'jsdom-testing-mocks'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { SignatureForm } from './SignatureForm'
import { GustoTestApiProvider } from '@/test/GustoTestApiProvider'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { companyEvents } from '@/shared/constants'
import { server } from '@/test/mocks/server'
import { handleSignCompanyForm } from '@/test/mocks/apis/company_forms'

const testForm = {
  uuid: 'form-123',
  name: 'Test Form',
  status: 'not_signed',
  form_type: 'company',
  created_at: '2024-05-29T12:00:00Z',
  updated_at: '2024-05-29T12:30:00Z',
  requires_signing: true,
}

describe('SignatureForm', () => {
  const mockOnEvent = vi.fn()

  beforeEach(() => {
    mockResizeObserver()
    setupApiTestMocks()
    mockOnEvent.mockClear()
    vi.resetModules()

    server.use(handleSignCompanyForm(() => HttpResponse.json(testForm)))
  })

  it('fires the correct events when form is submitted successfully', async () => {
    const user = userEvent.setup()

    render(
      <GustoTestApiProvider>
        <SignatureForm formId="form-123" companyId="company-123" onEvent={mockOnEvent} />
      </GustoTestApiProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText(/Signature required for/)).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Signature'), 'John Doe')

    const checkbox = screen.getByLabelText('I am the signatory and I agree to sign electronically')

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

  it('fires the back event when back button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <GustoTestApiProvider>
        <SignatureForm formId="form-123" companyId="company-123" onEvent={mockOnEvent} />
      </GustoTestApiProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText(/Signature required for/)).toBeInTheDocument()
    })

    const backButton = screen.getByRole('button', { name: 'Back' })
    await user.click(backButton)

    expect(mockOnEvent).toHaveBeenCalledWith(companyEvents.COMPANY_SIGN_FORM_BACK)
  })
})
